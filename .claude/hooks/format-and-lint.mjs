#!/usr/bin/env node
// PostToolUse (Edit|Write|MultiEdit): auto-fixes the edited file so Claude never spends tokens on style.
//   1. eslint --fix (.ts / .html)   2. prettier --write (.ts / .html / .scss / .css / .json)
// Remaining lint errors are reported back to Claude via exit code 2 so it fixes them immediately.
import path from 'node:path';
import { readHookInput, runNodeBin } from './lib.mjs';

const PRETTIER_EXT = new Set(['.ts', '.html', '.scss', '.css', '.json']);
const ESLINT_EXT = new Set(['.ts', '.html']);

const input = await readHookInput();
const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const abs = path.resolve(root, file);
const rel = path.relative(root, abs).split(path.sep).join('/');
const ext = path.extname(abs);
if (!rel.startsWith('src/')) process.exit(0);

let lintErrors = '';
if (ESLINT_EXT.has(ext)) {
  const eslint = runNodeBin(root, 'node_modules/eslint/bin/eslint.js', [
    '--fix',
    '--no-warn-ignored',
    abs,
  ]);
  if (!eslint.ok) lintErrors = eslint.output;
}

if (PRETTIER_EXT.has(ext)) {
  runNodeBin(root, 'node_modules/prettier/bin/prettier.cjs', ['--write', '--log-level', 'warn', abs]);
}

if (lintErrors) {
  process.stderr.write(`ESLint errors remain in ${rel} after auto-fix:\n${lintErrors}\n`);
  process.exit(2);
}
