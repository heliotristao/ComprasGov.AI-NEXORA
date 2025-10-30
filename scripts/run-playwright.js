#!/usr/bin/env node
"use strict";

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { loadLocalEnv } = require("./load-env");

loadLocalEnv();

const args = process.argv.slice(2);
const repoRoot = path.join(__dirname, "..");
const localExecutableName = process.platform === "win32" ? "playwright.cmd" : "playwright";
const localExecutablePath = path.join(repoRoot, "node_modules", ".bin", localExecutableName);
const shouldUseLocalBinary = fs.existsSync(localExecutablePath);

const command = shouldUseLocalBinary ? localExecutablePath : process.platform === "win32" ? "npx.cmd" : "npx";
const commandArgs = shouldUseLocalBinary ? ["test", ...args] : ["--yes", "playwright", "test", ...args];

const child = spawn(command, commandArgs, {
  stdio: "inherit",
  env: process.env,
  cwd: repoRoot,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code === undefined ? 1 : code);
});

child.on("error", (error) => {
  console.error("Failed to launch Playwright:", error.message);
  process.exit(1);
});
