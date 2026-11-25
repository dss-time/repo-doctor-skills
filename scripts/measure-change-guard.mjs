import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/repo-doctor-skills.mjs', import.meta.url));
function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
}

const counts = option('--dirty', '0,25,250').split(',').map(Number);
const runs = Number(option('--runs', '10'));
const tracked = Number(option('--tracked', '251'));
const large = Number(option('--large-files', '0'));
const largeBytes = 2 * 1024 * 1024;
const measureMemory = process.argv.includes('--memory');
assert.ok(Number.isInteger(tracked) && tracked > 1 && tracked <= 10000, 'Invalid tracked count');
assert.ok(Number.isInteger(runs) && runs > 0 && runs <= 30, 'Invalid run count');
assert.ok(counts.every(count => Number.isInteger(count) && count >= 0 && count < tracked), 'Invalid dirty counts');
assert.ok(Number.isInteger(large) && large >= 0 && large <= Math.min(...counts) && large <= 8, 'Invalid large-file count');
const memoryHook = 'data:text/javascript,' + encodeURIComponent(
  'process.on("exit", () => process.stderr.write("peak_rss_bytes=" + process.resourceUsage().maxRSS * 1024 + "\\n"))',
);
const bytes = 4096;
const samples = [];
const gitArgs = ['-c', 'commit.gpgSign=false', '-c', 'core.hooksPath=.unused-hooks'];
const sha256 = relative => createHash('sha256').update(readFileSync(new URL(relative, import.meta.url))).digest('hex');

function run(program, args, cwd) {
  return execFileSync(program, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
}

function measure(root, action, id, ...args) {
  const start = performance.now();
  const argumentsForNode = [cli, 'change', action, '--id', id, '--json', ...args];
  const observed = spawnSync(process.execPath,
    measureMemory ? ['--import', memoryHook, ...argumentsForNode] : argumentsForNode,
    { cwd: root, encoding: 'utf8', timeout: 30000 });
  assert.equal(observed.status, 0, observed.stderr || observed.error?.message);
  const peak = observed.stderr.match(/peak_rss_bytes=(\d+)/);
  return { ms: Math.round((performance.now() - start) * 10) / 10, result: JSON.parse(observed.stdout),
    peakRss: peak ? Number(peak[1]) : null };
}

for (const dirty of counts) {
  const root = mkdtempSync(path.join(tmpdir(), 'repo-doctor-guard-cost-'));
  try {
    run('git', ['init', '-q'], root);
    mkdirSync(path.join(root, 'src'));
    const files = Array.from({ length: tracked - 1 }, (_, index) => path.join(root, 'src', `file-${index}.txt`));
    for (const [index, file] of files.entries()) writeFileSync(file, 'a'.repeat(index < large ? largeBytes : bytes));
    const outside = path.join(root, 'outside.txt');
    writeFileSync(outside, 'fixture\n');
    run('git', ['add', '.'], root);
    run('git', [...gitArgs, '-c', 'user.name=Guard Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture'], root);
    for (const [index, file] of files.slice(0, dirty).entries()) writeFileSync(file, 'b'.repeat(index < large ? largeBytes : bytes));
    const rounds = [];
    for (let index = 0; index <= runs; index += 1) {
      const id = `sample-${index}`;
      writeFileSync(outside, 'fixture\n');
      const begin = measure(root, 'begin', id, '--scope', 'src');
      assert.equal(begin.result.status, 'baseline_created');
      assert.equal(begin.result.preexisting_paths, dirty);
      writeFileSync(outside, 'fixture edit\n');
      const check = measure(root, 'check', id);
      assert.equal(check.result.changes.length, 1);
      assert.ok(check.result.findings.some(item => item.code === 'outside_declared_scope' && item.path === 'outside.txt'));
      if (index > 0) rounds.push({
        begin_ms: begin.ms, check_ms: check.ms,
        ...(measureMemory ? { begin_peak_rss_bytes: begin.peakRss, check_peak_rss_bytes: check.peakRss } : {}),
        baseline_bytes: statSync(path.join(root, '.repo-doctor', 'changes', id + '.json')).size,
      });
    }
    samples.push({
      preexisting_dirty_paths: dirty,
      ignored_file_bytes: statSync(path.join(root, '.repo-doctor', '.gitignore')).size,
      rounds,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
console.log(JSON.stringify({
  schema_version: 1, platform: process.platform, architecture: process.arch,
  node: process.version, git: run('git', ['--version'], process.cwd()).trim(),
  change_guard_sha256: sha256('./change-guard.mjs'),
  measurement_script_sha256: sha256('./measure-change-guard.mjs'),
  tracked_fixture_files: tracked, bytes_per_source_file: bytes,
  ...(large ? { large_files: large, bytes_per_large_file: largeBytes } : {}),
  measured_rounds_per_size: runs, excluded_warmups_per_size: 1,
  measurement: 'local CLI wall time including Node startup; baseline JSON bytes per ID',
  samples,
}, null, 2));
