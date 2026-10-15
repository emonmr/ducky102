#!/usr/bin/env node
// Stop: type-checks app code AND templates (ngc --noEmit) plus specs (tsc) before Claude finishes.
// On failure, exit code 2 makes Claude keep working to fix the errors.
// Skips when nothing in src/ changed since the last passing run, so plain Q&A turns stay instant.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readHookInput, runNodeBin } from './lib.mjs';

const input = await readHookInput();
const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();

// Already continuing because of this hook — don't loop forever.
if (input.stop_hook_active) process.exit(0);

const cacheDir = path.join(root, 'node_modules', '.cache');
const cacheFile = path.join(cacheDir, 'claude-typecheck.json');

function fingerprint(dir) {
  let latest = 0;
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    count++;
    latest = Math.max(latest, statSync(path.join(entry.parentPath, entry.name)).mtimeMs);
  }
  return `${count}:${latest}`;
}

const current = fingerprint(path.join(root, 'src'));
const previous = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')).fingerprint : null;
if (current === previous) process.exit(0);

const checks = [
  ['App + templates', 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js', ['-p', 'tsconfig.app.json', '--noEmit', '--pretty', 'false']],
  ['Specs', 'node_modules/typescript/bin/tsc', ['-p', 'tsconfig.spec.json', '--noEmit', '--pretty', 'false']],
];

const failures = [];
for (const [label, bin, args] of checks) {
  const result = runNodeBin(root, bin, args);
  if (!result.ok) failures.push(`## ${label}\n${result.output}`);
}

if (failures.length) {
  process.stderr.write(`Type check failed — fix these before finishing:\n\n${failures.join('\n\n')}\n`);
  process.exit(2);
}

mkdirSync(cacheDir, { recursive: true });
writeFileSync(cacheFile, JSON.stringify({ fingerprint: current }));
