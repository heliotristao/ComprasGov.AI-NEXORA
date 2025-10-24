#!/usr/bin/env node

const { spawn } = require('node:child_process');
const { createRequire } = require('node:module');
const path = require('node:path');

const requireFromRoot = createRequire(require.resolve('../package.json'));
const eslintPackageJson = requireFromRoot.resolve('eslint/package.json');
const eslintBin = path.join(path.dirname(eslintPackageJson), 'bin', 'eslint.js');

const stubPath = require.resolve('./prevent-eslint-patch');

const nodeOptions = [process.env.NODE_OPTIONS, `--require ${stubPath}`]
  .filter(Boolean)
  .join(' ')
  .trim();

const child = spawn(process.execPath, [eslintBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_DISABLE_ESLINT_PATCH: process.env.NEXT_DISABLE_ESLINT_PATCH || '1',
    NODE_OPTIONS: nodeOptions,
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code === undefined ? 1 : code);
});
