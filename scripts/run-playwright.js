#!/usr/bin/env node
"use strict";

const { spawn } = require("node:child_process");
const path = require("node:path");
const { loadLocalEnv } = require("./load-env");

loadLocalEnv();

const args = process.argv.slice(2);
const npxExecutable = process.platform === "win32" ? "npx.cmd" : "npx";
const npxArgs = ["--yes", "playwright", "test", ...args];

const child = spawn(npxExecutable, npxArgs, {
  stdio: "inherit",
  env: process.env,
  cwd: path.join(__dirname, ".."),
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
