// Shared helpers for Claude Code hooks. Plain Node so hooks work on Windows, macOS and Linux.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

/** Parses the JSON event Claude Code writes to the hook's stdin. */
export async function readHookInput() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Runs a package's JS entry point with the current Node binary (no npx/shell startup cost). */
export function runNodeBin(root, binPath, args) {
  const result = spawnSync(process.execPath, [path.join(root, binPath), ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim(),
  };
}
