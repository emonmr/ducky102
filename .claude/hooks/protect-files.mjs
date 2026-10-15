#!/usr/bin/env node
// PreToolUse (Edit|Write|MultiEdit): refuses edits to files that must never be hand-edited.
// Exit code 2 blocks the tool call and shows stderr to Claude.
import path from 'node:path';
import { readHookInput } from './lib.mjs';

const PROTECTED = [
  { pattern: /\.generated\.ts$/, reason: 'Generated file — change the generator/source instead.' },
  { pattern: /(^|\/)\.env(\.|$)/, reason: 'Environment secrets are off-limits.' },
  { pattern: /^package-lock\.json$/, reason: 'Lockfile is managed by npm — ask the user to install packages.' },
  { pattern: /(^|\/)node_modules\//, reason: 'Never edit installed dependencies.' },
  { pattern: /^(dist|\.angular)\//, reason: 'Build output — edit the source in src/ instead.' },
];

const input = await readHookInput();
const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join('/');
const hit = PROTECTED.find(({ pattern }) => pattern.test(rel));
if (hit) {
  process.stderr.write(`BLOCKED: ${rel} is protected. ${hit.reason}\n`);
  process.exit(2);
}
