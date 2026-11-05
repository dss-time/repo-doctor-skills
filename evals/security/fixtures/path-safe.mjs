import path from "node:path";
export function resolveFile(base, input) {
  const target = path.resolve(base, input);
  const relative = path.relative(path.resolve(base), target);
  if (relative === ".." || relative.startsWith(".." + path.sep) || path.isAbsolute(relative)) throw new Error("Forbidden");
  return target;
}
