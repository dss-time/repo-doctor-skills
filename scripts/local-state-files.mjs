import { randomUUID } from "node:crypto";
import {
  lstatSync, realpathSync, mkdirSync, readFileSync, writeFileSync,
  renameSync, unlinkSync, rmdirSync, openSync, fsyncSync, closeSync,
} from "node:fs";
import path from "node:path";
import { credentialFindings } from "./credential-findings.mjs";

export const maxStateBytes = 4 * 1024 * 1024;

export function safePath(root, relative) {
  if (typeof relative !== "string" || !relative || path.isAbsolute(relative)
      || relative.includes("\\") || relative.includes("\0") || /^[A-Za-z]:/.test(relative)
      || relative.split("/").some(part => part === ".." || part === "." || !part)) {
    throw new Error("Expected a contained relative path");
  }
  let current = realpathSync(root);
  if (!lstatSync(current).isDirectory()) throw new Error("Root must be a directory");
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    try {
      if (lstatSync(current).isSymbolicLink()) throw new Error("State paths must not traverse symlinks");
    } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  return current;
}

export function readJson(root, relative, { optional = false } = {}) {
  const filename = safePath(root, relative);
  try {
    const stat = lstatSync(filename);
    if (!stat.isFile() || stat.size > maxStateBytes) throw new Error("State must be a bounded regular JSON file");
    const text = readFileSync(filename, "utf8");
    if (credentialFindings(text).length) throw new Error("JSON contains possible credentials; redact before reading state");
    let value;
    try { value = JSON.parse(text); }
    catch { throw new Error("Invalid JSON state"); }
    if (credentialFindings(JSON.stringify(value, null, 2)).length) throw new Error("JSON contains possible credentials; redact before reading state");
    return value;
  } catch (error) {
    if (optional && error.code === "ENOENT") return null;
    throw error;
  }
}

export function ensureDirectory(root, relative) {
  const directory = safePath(root, relative);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  safePath(root, relative);
  return directory;
}

export function withLock(root, relative, operation) {
  const lock = safePath(root, relative);
  try { mkdirSync(lock, { mode: 0o700 }); }
  catch (error) {
    if (error.code === "EEXIST") throw new Error("State is busy; inspect the existing lock before retrying");
    throw error;
  }
  try { return operation(); }
  finally { rmdirSync(lock); }
}

export function writeJson(root, relative, value) {
  const filename = safePath(root, relative);
  const serialized = JSON.stringify(value, null, 2);
  if (typeof serialized !== "string") throw new Error("State must be JSON serializable");
  const text = serialized + "\n";
  if (Buffer.byteLength(text, "utf8") > maxStateBytes) throw new Error("State exceeds the JSON size limit");
  if (credentialFindings(text).length) throw new Error("State contains possible credentials; redact before saving");
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, text, { flag: "wx", mode: 0o600 });
    const descriptor = openSync(temporary, "r+");
    try { fsyncSync(descriptor); } finally { closeSync(descriptor); }
    safePath(root, relative);
    renameSync(temporary, filename);
  } finally {
    try { unlinkSync(temporary); } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
}
