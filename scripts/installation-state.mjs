import { createHash } from 'node:crypto';
import { lstatSync, realpathSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { safePath, readJson, writeJson } from './local-state-files.mjs';

const replacements = Object.freeze({
  'requirements-to-spec': 'requirements-clarification',
  'spec-to-work-items': 'safe-change-plan',
});
const removed = new Set([
  'pdf-review-basic',
  'word-document-review-basic',
  'excel-data-quality-check-basic',
  'document-review',
  'pdf-review',
  'spreadsheet-data-cleaning',
]);
const languages = new Set(['en', 'zh-CN', 'bilingual']);
const ledgerKeys = ['schema_version', 'kind', 'target_name', 'revision', 'entries'];
const entryKeys = ['source', 'version', 'language', 'digest', 'installed_at'];
// SemVer 2.0: numeric release/prerelease identifiers cannot have leading zeroes.
const numeric = '(?:0|[1-9][0-9]*)';
const prerelease = `(?:${numeric}|[0-9]*[A-Za-z-][0-9A-Za-z-]*)`;
const semver = new RegExp(
  `^${numeric}\\.${numeric}\\.${numeric}`
    + `(?:-${prerelease}(?:\\.${prerelease})*)?`
    + '(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$',
);

function slugValid(value) {
  return typeof value === 'string'
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    && value.length <= 200
    && !/\s/.test(value);
}

function ownKeys(value, keys) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}

function versionValid(value) {
  return typeof value === 'string'
    && value.length <= 200
    && !/\s/.test(value)
    && semver.test(value);
}

function timestampValid(value) {
  return typeof value === 'string'
    && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)
    && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString() === value;
}

function statOptional(filename, options) {
  try {
    return lstatSync(filename, options);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function installationTarget(target) {
  const separators = path.sep === '\\' ? /[\\/]/ : /\//;
  if (typeof target !== 'string'
      || !target
      || target.includes('\0')
      || (path.sep !== '\\' && target.includes('\\'))
      || target.split(separators).includes('..')) {
    throw new Error('Invalid installation target');
  }

  const absolute = path.resolve(target);
  let basename = path.basename(absolute);
  if (absolute === path.parse(absolute).root
      || absolute === path.resolve(os.homedir())) {
    throw new Error('Unsafe installation target');
  }

  // Resolve parent aliases such as macOS /tmp, then validate the target itself.
  const root = realpathSync(path.dirname(absolute));
  let directory = safePath(root, basename);
  const home = statOptional(os.homedir()) ? realpathSync(os.homedir()) : path.resolve(os.homedir());
  if (directory === home) {
    throw new Error('Unsafe installation target');
  }
  const stat = statOptional(directory);
  if (stat && !stat.isDirectory()) {
    throw new Error('Installation target must be a real directory');
  }
  if (stat && realpathSync(directory) === home) {
    throw new Error('Unsafe installation target');
  }
  // Resolve an existing case alias using directory identity, not spelling alone.
  if (stat) {
    const identity = lstatSync(directory, { bigint: true });
    if (identity.ino === 0n) throw new Error('Cannot establish installation directory identity');
    const actualName = readdirSync(root).find(name => {
      const candidate = statOptional(path.join(root, name), { bigint: true });
      return candidate?.isDirectory() && candidate.dev === identity.dev && candidate.ino === identity.ino;
    });
    if (!actualName) throw new Error('Cannot establish installation directory identity');
    basename = actualName;
    directory = safePath(root, basename);
  }
  return { root, basename, directory };
}

// Metadata stays beside the target: the target continues to contain only Skills.
export function installationStatePaths(target) {
  const { root, basename } = installationTarget(target);
  const ledger = `.repo-doctor-${basename}.json`;
  const lock = `.repo-doctor-${basename}.lock`;
  safePath(root, ledger);
  safePath(root, lock);
  return { root, ledger, lock };
}

function validateEntry(slug, entry) {
  if (!slugValid(slug)
      || !ownKeys(entry, entryKeys)
      || entry.source !== 'repo-doctor-skills'
      || !versionValid(entry.version)
      || !languages.has(entry.language)
      || typeof entry.digest !== 'string'
      || entry.digest.length !== 64
      || !/^[a-f0-9]{64}$/.test(entry.digest)
      || !timestampValid(entry.installed_at)) {
    throw new Error('Invalid installation ledger entry');
  }
}

function validateLedger(value, targetName) {
  if (!ownKeys(value, ledgerKeys)
      || value.schema_version !== 1
      || value.kind !== 'repo-doctor-installation'
      || value.target_name !== targetName
      || !Number.isSafeInteger(value.revision)
      || value.revision < 1
      || !value.entries
      || typeof value.entries !== 'object'
      || Array.isArray(value.entries)) {
    throw new Error('Invalid installation ledger schema');
  }
  for (const [slug, entry] of Object.entries(value.entries)) {
    validateEntry(slug, entry);
  }
  return value;
}

export function readInstallationState(target) {
  const { root, ledger } = installationStatePaths(target);
  const value = readJson(root, ledger, { optional: true });
  // JSON null is malformed state; only a missing file means no ledger.
  if (value === null && !statOptional(safePath(root, ledger))) return null;
  return validateLedger(value, installationTarget(target).basename);
}

export function treeDigest(directory) {
  const root = path.resolve(directory);
  const stat = lstatSync(root);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error('Digest requires a real directory');
  }
  const actual = safePath(realpathSync(path.dirname(root)), path.basename(root));
  const hash = createHash('sha256');
  function frame(value) {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    hash.update(String(bytes.length));
    hash.update(':');
    hash.update(bytes);
  }
  function walk(relative) {
    const full = relative ? safePath(actual, relative) : actual;
    const entry = lstatSync(full);
    if (entry.isSymbolicLink()) throw new Error('Digest refuses symlinks');

    if (entry.isDirectory()) {
      frame('directory');
      frame(relative);
      frame(String(entry.mode & 0o111));
      const names = readdirSync(full).sort();
      frame(String(names.length));
      for (const name of names) {
        walk(relative ? `${relative}/${name}` : name);
      }
    } else if (entry.isFile()) {
      frame('file');
      frame(relative);
      frame(String(entry.mode & 0o111));
      frame(readFileSync(full));
    } else {
      throw new Error('Digest refuses special files');
    }
  }
  walk('');
  return hash.digest('hex');
}

// Caller holds installationStatePaths(target).lock across installation + record.
export function recordInstallation(target, {
  slugs, version, language, expectedRevision,
}) {
  const paths = installationStatePaths(target);
  if (!Array.isArray(slugs)
      || slugs.length === 0
      || slugs.some(slug => !slugValid(slug))
      || new Set(slugs).size !== slugs.length
      || !versionValid(version)
      || !languages.has(language)
      || !Number.isSafeInteger(expectedRevision)
      || expectedRevision < 0) {
    throw new Error('Invalid installation record request');
  }

  const previous = readInstallationState(target);
  if ((previous?.revision ?? 0) !== expectedRevision
      || expectedRevision === Number.MAX_SAFE_INTEGER) {
    throw new Error('Installation ledger revision conflict');
  }

  const directory = installationTarget(target).directory;
  const entries = { ...previous?.entries };
  const installed_at = new Date().toISOString();
  for (const slug of slugs) {
    entries[slug] = {
      source: 'repo-doctor-skills',
      version,
      language,
      digest: treeDigest(safePath(directory, slug)),
      installed_at,
    };
  }
  const ledger = {
    schema_version: 1,
    kind: 'repo-doctor-installation',
    target_name: path.basename(directory),
    revision: expectedRevision + 1,
    entries,
  };
  validateLedger(ledger, path.basename(directory));
  writeJson(paths.root, paths.ledger, ledger);
  return ledger;
}

export function inspectInstallations({ targets, activeSlugs = [], sourceRoot }) {
  if (!Array.isArray(targets)
      || !Array.isArray(activeSlugs)
      || activeSlugs.some(slug => !slugValid(slug))) {
    throw new Error('Invalid inspection request');
  }
  const active = new Set(activeSlugs);
  const locations = new Map();
  const seenTargets = new Map();
  const report = { targets: [], duplicates: [] };

  function addLocation(slug, target, origin) {
    if (!locations.has(slug)) locations.set(slug, []);
    const item = { label: target.label, path: target.path, origin, digest: null };
    locations.get(slug).push(item);
    return item;
  }
  function unverified(result, target, slug, reason) {
    result.records.push({ slug, origin: 'unknown', content_state: 'UNVERIFIED', reason });
    addLocation(slug, target, 'unknown');
  }
  function missingRecords(result, ledger) {
    for (const slug of Object.keys(ledger?.entries ?? {})) {
      if (!result.records.some(record => record.slug === slug)) {
        result.records.push({
          slug, origin: 'managed', content_state: 'missing', reason: 'missing',
        });
      }
    }
  }

  for (const target of targets) {
    if (!target
        || typeof target.path !== 'string'
        || typeof target.label !== 'string') {
      throw new Error('Invalid inspection target');
    }
    const result = {
      label: target.label,
      path: target.path,
      ledger_status: 'absent',
      warnings: [],
      records: [],
    };
    report.targets.push(result);
    let directory;
    try {
      directory = installationTarget(target.path).directory;
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      result.ledger_status = 'invalid';
      result.warnings.push('UNVERIFIED: unsafe or inaccessible target');
      continue;
    }

    const directoryStat = statOptional(directory, { bigint: true });
    if (directoryStat) {
      const identity = directoryStat.ino ? `${directoryStat.dev}:${directoryStat.ino}` : directory;
      if (seenTargets.has(identity)) {
        result.alias_of = seenTargets.get(identity);
        result.ledger_status = 'alias';
        continue;
      }
      seenTargets.set(identity, target.label);
    }

    let ledger;
    try {
      ledger = readInstallationState(target.path);
      result.ledger_status = ledger ? 'valid' : 'absent';
    } catch {
      result.ledger_status = 'invalid';
      result.warnings.push('Invalid installation ledger; ownership is unverified');
    }
    if (!statOptional(directory)) {
      missingRecords(result, ledger);
      continue;
    }

    for (const slug of readdirSync(directory).sort()) {
      const full = path.join(directory, slug);
      const item = lstatSync(full);
      if (item.isSymbolicLink()) {
        unverified(result, target, slug, 'symlink');
        continue;
      }
      if (!item.isDirectory()) continue;
      const marker = statOptional(path.join(full, 'SKILL.md'));
      if (!marker) continue;
      if (!marker.isFile() || marker.isSymbolicLink()) {
        unverified(result, target, slug, 'unsafe-skill-marker');
        continue;
      }

      const entry = ledger && Object.hasOwn(ledger.entries, slug)
        ? ledger.entries[slug]
        : undefined;
      const record = {
        slug,
        origin: entry ? 'managed' : 'unknown',
        content_state: 'unknown',
        reason: 'untracked',
      };
      const installation = addLocation(slug, target, record.origin);
      try {
        const digest = treeDigest(full);
        installation.digest = digest;
        if (entry) {
          record.content_state = digest === entry.digest ? 'current' : 'modified';
          record.reason = record.content_state;
        }
        if (sourceRoot && slugValid(slug)) {
          try {
            const sourceDigest = treeDigest(safePath(sourceRoot, slug));
            record.source_content_state = digest === sourceDigest ? 'same' : 'different';
          } catch {
            record.source_content_state = 'UNVERIFIED';
          }
        }
      } catch {
        record.content_state = 'UNVERIFIED';
        record.reason = 'unsafe-content';
      }
      if (Object.hasOwn(replacements, slug)) {
        record.reason = 'renamed';
        record.replacement = replacements[slug];
      } else if (removed.has(slug)) {
        record.reason = 'removed';
      } else if (entry && active.size && !active.has(slug)) {
        record.reason = 'inactive';
      }
      result.records.push(record);
    }
    missingRecords(result, ledger);
  }

  for (const [slug, installations] of locations) {
    if (installations.length < 2) continue;
    let content_state = 'UNVERIFIED';
    if (installations.every(installation => installation.digest !== null)) {
      const digests = new Set(installations.map(installation => installation.digest));
      content_state = digests.size === 1 ? 'same' : 'different';
    }
    report.duplicates.push({
      slug,
      content_state,
      source_unknown: installations.some(installation => installation.origin === 'unknown'),
      installations: installations.map(({ digest, ...installation }) => installation),
    });
  }
  return report;
}
