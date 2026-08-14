import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const binPath = path.join(root, "bin", "repo-doctor-skills.mjs");

assert.equal(packageJson.name, "repo-doctor-skills");
assert.equal(packageJson.version, "0.6.1");
assert.notEqual(packageJson.private, true, "public CLI package must not be private");
assert.deepEqual(packageJson.bin, { "repo-doctor-skills": "./bin/repo-doctor-skills.mjs" });
assert.equal(packageJson.publishConfig?.access, "public");
assert.equal(packageJson.publishConfig?.registry, "https://registry.npmjs.org/");
assert.ok(Array.isArray(packageJson.files) && packageJson.files.includes("bin/"));
assert.ok(packageJson.files.includes("package-assets/"));
assert.ok(packageJson.files.includes("scripts/install.mjs"));

const bin = readFileSync(binPath, "utf8");
assert.ok(bin.startsWith("#!/usr/bin/env node\n"), "CLI bin must have a Node shebang");
assert.ok((statSync(binPath).mode & 0o111) !== 0, "CLI bin must be executable");

console.log("Public npm package contract test passed for repo-doctor-skills@0.6.1.");
