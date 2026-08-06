import { spawn } from "node:child_process";

function option(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const cwd = option("--cwd", process.cwd());
const timeoutMs = Number(option("--timeout-ms", "15000"));
const child = spawn("codex", ["app-server", "--stdio"], {
  cwd,
  env: process.env,
  stdio: ["pipe", "pipe", "pipe"],
});

let stdoutBuffer = "";
let stderr = "";
let settled = false;

const finish = (exitCode, payload) => {
  if (settled) return;
  settled = true;
  clearTimeout(timeout);
  child.kill();
  if (stderr.trim()) payload.stderr = stderr.trim();
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exitCode = exitCode;
};

const send = (message) => {
  child.stdin.write(`${JSON.stringify(message)}\n`);
};

const timeout = setTimeout(() => {
  finish(1, {
    result: "BLOCKED",
    reason: `Codex app-server did not answer within ${timeoutMs}ms`,
  });
}, timeoutMs);

child.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

child.stdout.on("data", (chunk) => {
  stdoutBuffer += chunk.toString();
  while (stdoutBuffer.includes("\n")) {
    const newline = stdoutBuffer.indexOf("\n");
    const line = stdoutBuffer.slice(0, newline).trim();
    stdoutBuffer = stdoutBuffer.slice(newline + 1);
    if (!line) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    if (message.id === 1 && message.result) {
      send({ method: "initialized" });
      send({
        id: 2,
        method: "skills/list",
        params: { cwds: [cwd], forceReload: true },
      });
    }
    if (message.id === 2) {
      if (message.error) {
        finish(1, { result: "BLOCKED", error: message.error });
      } else {
        finish(0, { result: "PASS", response: message.result });
      }
    }
  }
});

child.on("error", (error) => {
  finish(1, { result: "BLOCKED", reason: error.message });
});

child.on("exit", (code, signal) => {
  if (!settled) {
    finish(1, {
      result: "BLOCKED",
      reason: `Codex app-server exited before skills/list (code=${code}, signal=${signal})`,
    });
  }
});

send({
  id: 1,
  method: "initialize",
  params: {
    clientInfo: {
      name: "repo-doctor-release-validation",
      version: "1.0.0",
    },
    capabilities: {
      experimentalApi: true,
    },
  },
});
