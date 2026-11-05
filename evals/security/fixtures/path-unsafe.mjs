import path from "node:path";
export function resolveFile(base, input) {
  return path.resolve(base, input);
}
