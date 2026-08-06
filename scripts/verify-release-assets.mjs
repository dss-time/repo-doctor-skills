import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultRepository = "dss-time/repo-doctor-skills";
const packageVersion = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
const allowedZipRoots = new Set(["SKILL.md", "agents", "assets", "references", "scripts"]);
const forbiddenEntryParts = new Set([".DS_Store", ".git", ".hg", ".svn", "node_modules"]);
const secretPatterns = [
  { label: "private key", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: "OpenAI-style key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: "GitHub token", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { label: "machine-specific Unix path", pattern: /\/(?:Users|home)\/[A-Za-z0-9._-]+\// },
  { label: "machine-specific Windows path", pattern: /\b[A-Za-z]:\\Users\\[^\\\s]+\\/ },
  { label: "external repository provenance", pattern: /(?:matt-skills-reference|mattpocock\/skills)/ },
];

export class ReleaseVerificationError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ReleaseVerificationError";
    this.status = status;
  }
}

function fail(message) {
  throw new ReleaseVerificationError("FAIL", message);
}

export function isNetworkFailure(value) {
  return /(?:timed? out|timeout|error connecting|connection (?:reset|refused|closed)|could not resolve|temporary failure|network is unreachable|dial tcp|tls handshake|unexpected eof|i\/o timeout|HTTP (?:429|5\d\d))/i
    .test(String(value ?? ""));
}

function run(command, args, { network = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) {
    const detail = result.error.message;
    if (network && isNetworkFailure(detail)) throw new ReleaseVerificationError("BLOCKED_NETWORK", detail);
    fail(`${command} could not start: ${detail}`);
  }
  if (result.status !== 0) {
    const detail = [result.stderr, result.stdout].filter(Boolean).join("\n").trim()
      || `exit ${result.status ?? "unknown"}`;
    if (network && isNetworkFailure(detail)) throw new ReleaseVerificationError("BLOCKED_NETWORK", detail);
    fail(`${command} ${args.join(" ")} failed: ${detail}`);
  }
  return result.stdout;
}

function sha256(filename) {
  return createHash("sha256").update(readFileSync(filename)).digest("hex");
}

function sameNames(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function parseChecksums(content, label = "checksum file") {
  const entries = new Map();
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) fail(`${label} is empty`);
  for (const line of lines) {
    const match = line.match(/^([0-9a-f]{64})  ([A-Za-z0-9][A-Za-z0-9._-]*)$/);
    if (!match) fail(`${label} contains an invalid checksum line`);
    const [, digest, filename] = match;
    if (entries.has(filename)) fail(`${label} contains duplicate asset ${filename}`);
    entries.set(filename, digest);
  }
  return entries;
}

export function parseManifest(content, expectedTag) {
  const version = expectedTag.replace(/^v/, "");
  if (!content.includes(`Version: ${version}`)) fail(`Release Manifest does not identify version ${version}`);
  if (!content.includes(`Tag: ${expectedTag}`)) fail(`Release Manifest does not identify tag ${expectedTag}`);
  const marker = "\nAssets:\n";
  const index = content.indexOf(marker);
  if (index === -1) fail("Release Manifest has no Assets section");
  const lines = content.slice(index + marker.length)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      if (!line.startsWith("  ")) fail("Release Manifest contains an invalid asset line");
      return line.slice(2);
    });
  return parseChecksums(`${lines.join("\n")}\n`, "Release Manifest Assets");
}

export function validateZipEntry(entry) {
  const normalized = entry.replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized)) {
    fail(`ZIP contains an absolute or empty entry: ${entry}`);
  }
  const parts = normalized.split("/").filter(Boolean);
  if (parts.some((part) => part === "." || part === "..")) {
    fail(`ZIP contains path traversal: ${entry}`);
  }
  if (parts.some((part) => forbiddenEntryParts.has(part))) {
    fail(`ZIP contains forbidden repository or build content: ${entry}`);
  }
  if (!allowedZipRoots.has(parts[0])) {
    fail(`ZIP contains unexpected top-level content: ${entry}`);
  }
  return normalized;
}

export function validateSkillContent(content, publishedName, filename) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) fail(`${filename}: SKILL.md frontmatter is missing`);
  const name = frontmatter[1].match(/^name:\s*["']?([^"' \r\n]+)["']?\s*$/m)?.[1];
  if (name !== publishedName) {
    fail(`${filename}: SKILL.md name ${name ?? "missing"} does not match ${publishedName}`);
  }
  if (!/^description:\s*\S/m.test(frontmatter[1])) fail(`${filename}: bilingual description is missing`);
  if (!/[A-Za-z]{4,}/.test(content)) fail(`${filename}: English content is missing`);
  if (!/[\u3400-\u9fff]/u.test(content)) fail(`${filename}: Simplified Chinese content is missing`);
  for (const { label, pattern } of secretPatterns) {
    if (pattern.test(content)) fail(`${filename}: contains ${label}`);
  }
}

function walkFiles(directory, relative = "", output = []) {
  for (const name of readdirSync(directory).sort()) {
    const absolute = path.join(directory, name);
    const nextRelative = relative ? `${relative}/${name}` : name;
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink()) fail(`extracted ZIP contains symlink ${nextRelative}`);
    if (stat.isDirectory()) walkFiles(absolute, nextRelative, output);
    else if (stat.isFile()) output.push({ absolute, relative: nextRelative });
    else fail(`extracted ZIP contains unsupported entry ${nextRelative}`);
  }
  return output;
}

function validateExtractedTree(directory, zipName) {
  const resolvedRoot = realpathSync(directory);
  const files = walkFiles(directory);
  const skillFiles = files.filter((file) => file.relative === "SKILL.md");
  if (skillFiles.length !== 1) fail(`${zipName}: expected exactly one root SKILL.md`);
  for (const file of files) {
    const resolved = realpathSync(file.absolute);
    if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
      fail(`${zipName}: extracted file escapes the temporary directory`);
    }
    if (/\.(?:md|mdc|yaml|yml|json|toml|txt)$/i.test(file.relative)) {
      const content = readFileSync(file.absolute, "utf8");
      for (const { label, pattern } of secretPatterns) {
        if (pattern.test(content)) fail(`${zipName}/${file.relative}: contains ${label}`);
      }
    }
  }
  return readFileSync(skillFiles[0].absolute, "utf8");
}

function validateZip(zipPath, tag, extractRoot) {
  const zipName = path.basename(zipPath);
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = zipName.match(new RegExp(`^((?:rd|pt|sm)-[a-z0-9]+(?:-[a-z0-9]+)*)-${escapedTag}\\.zip$`));
  if (!match) fail(`${zipName}: filename does not encode a supported published Skill and ${tag}`);
  const publishedName = match[1];
  run("unzip", ["-tqq", zipPath]);
  const longListing = run("unzip", ["-Z", "-l", zipPath]);
  if (longListing.split(/\r?\n/).some((line) => /^[bclps]/.test(line))) {
    fail(`${zipName}: ZIP contains a symlink or special filesystem entry`);
  }
  const entries = run("unzip", ["-Z1", zipPath]).split(/\r?\n/).filter(Boolean);
  if (entries.length === 0) fail(`${zipName}: ZIP is empty`);
  const normalized = entries.map(validateZipEntry);
  if (new Set(normalized).size !== normalized.length) fail(`${zipName}: ZIP contains duplicate entries`);
  if (!normalized.includes("SKILL.md")) fail(`${zipName}: root SKILL.md is missing`);
  if (!normalized.includes("agents/openai.yaml")) fail(`${zipName}: agents/openai.yaml is missing`);
  const destination = path.join(extractRoot, publishedName);
  run("unzip", ["-qq", zipPath, "-d", destination]);
  const skillContent = validateExtractedTree(destination, zipName);
  validateSkillContent(skillContent, publishedName, zipName);
  return { zip: zipName, published_name: publishedName, entry_count: normalized.length };
}

export function parseArguments(argv) {
  const options = {
    repository: defaultRepository,
    tag: `v${packageVersion}`,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--repo") {
      options.repository = argv[index + 1] ?? "";
      index += 1;
    } else if (argument === "--tag") {
      options.tag = argv[index + 1] ?? "";
      index += 1;
    } else {
      fail(`unknown argument: ${argument}`);
    }
  }
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(options.repository)) fail("invalid --repo value");
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(options.tag)) fail("invalid --tag value");
  return options;
}

export function verifyDownloadedRelease({ release, directory, tag }) {
  if (release.tagName !== tag) fail(`Release tag ${release.tagName} does not match ${tag}`);
  if (release.isDraft || release.isPrerelease) fail(`${tag} is not a stable published Release`);
  if (!Array.isArray(release.assets) || release.assets.length === 0) fail(`${tag} has no assets`);

  const version = tag.slice(1);
  const manifestName = `Repo-Doctor-Skills-${tag}-RELEASE_MANIFEST.txt`;
  const notesName = `Repo-Doctor-Skills-${tag}-RELEASE_NOTES.md`;
  const checksumName = `SHA256SUMS-${tag}.txt`;
  const localNames = readdirSync(directory).sort();
  const remoteNames = release.assets.map((asset) => asset.name).sort();
  if (!sameNames(localNames, remoteNames)) fail("downloaded filenames do not match the Release asset list");

  const metadataNames = [manifestName, notesName, checksumName];
  for (const name of metadataNames) {
    if (!localNames.includes(name)) fail(`required Release metadata asset is missing: ${name}`);
  }
  const zipNames = localNames.filter((name) => name.endsWith(".zip"));
  const expectedNames = [...zipNames, ...metadataNames].sort();
  if (!sameNames(localNames, expectedNames)) fail("Release contains unexpected non-Skill assets");

  const checksums = parseChecksums(readFileSync(path.join(directory, checksumName), "utf8"), checksumName);
  const manifest = parseManifest(readFileSync(path.join(directory, manifestName), "utf8"), tag);
  if (!sameNames(checksums.keys(), zipNames)) fail("SHA256SUMS filenames do not match Release ZIP assets");
  if (!sameNames(manifest.keys(), zipNames)) fail("Release Manifest filenames do not match Release ZIP assets");
  for (const zipName of zipNames) {
    const actual = sha256(path.join(directory, zipName));
    if (checksums.get(zipName) !== actual) fail(`${zipName}: SHA256SUMS digest mismatch`);
    if (manifest.get(zipName) !== actual) fail(`${zipName}: Release Manifest digest mismatch`);
  }

  for (const asset of release.assets) {
    const actual = sha256(path.join(directory, asset.name));
    if (asset.digest !== `sha256:${actual}`) {
      fail(`${asset.name}: GitHub asset digest mismatch or missing`);
    }
  }

  const extractRoot = path.join(path.dirname(directory), "extracted");
  mkdirSync(extractRoot, { recursive: true });
  const zipResults = zipNames.map((name) => validateZip(path.join(directory, name), tag, extractRoot));
  return {
    status: "PASS",
    tag,
    version,
    release_url: release.url,
    asset_count: localNames.length,
    zip_count: zipNames.length,
    metadata_assets: metadataNames,
    checksums_verified: zipNames.length,
    github_digests_verified: release.assets.length,
    zips: zipResults,
  };
}

export function verifyRemoteRelease(options) {
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), "repo-doctor-release-assets-"));
  const downloadDirectory = path.join(temporaryRoot, "assets");
  try {
    const release = JSON.parse(run("gh", [
      "release",
      "view",
      options.tag,
      "-R",
      options.repository,
      "--json",
      "tagName,name,isDraft,isPrerelease,url,assets",
    ], { network: true }));
    run("gh", [
      "release",
      "download",
      options.tag,
      "-R",
      options.repository,
      "-D",
      downloadDirectory,
    ], { network: true });
    return verifyDownloadedRelease({ release, directory: downloadDirectory, tag: options.tag });
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function main() {
  try {
    const result = verifyRemoteRelease(parseArguments(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    console.log(
      `PASS ${result.tag}: ${result.asset_count} assets, ${result.zip_count} ZIPs, `
      + `${result.checksums_verified} checksums, ${result.github_digests_verified} GitHub digests`,
    );
  } catch (error) {
    const status = error instanceof ReleaseVerificationError ? error.status : "FAIL";
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${status}: ${message}`);
    process.exitCode = status === "BLOCKED_NETWORK" ? 2 : 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
