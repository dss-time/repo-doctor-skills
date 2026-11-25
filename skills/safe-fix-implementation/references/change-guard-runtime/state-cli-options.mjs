export function parseOptions(args, { values = [], repeat = [], flags = [] }) {
  const result = {};
  for (let index = 0; index < args.length; index += 1) {
    const name = args[index];
    if (![...values, ...repeat, ...flags, "--json"].includes(name)) throw new Error("Unknown option; see --help");
    if (Object.hasOwn(result, name) && !repeat.includes(name)) throw new Error("Repeated option; see --help");
    if (flags.includes(name) || name === "--json") { result[name] = true; continue; }
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error("Missing option value; see --help");
    if (repeat.includes(name)) (result[name] ??= []).push(value);
    else result[name] = value;
  }
  return result;
}

export function required(options, name) {
  if (!options[name]) throw new Error(`Required option ${name}`);
  return options[name];
}
