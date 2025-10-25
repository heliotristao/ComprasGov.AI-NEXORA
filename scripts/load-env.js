#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

function parseLine(line) {
  let trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  if (trimmed.startsWith("export ")) {
    trimmed = trimmed.slice(7).trim();
  }

  const equalsIndex = trimmed.indexOf("=");

  if (equalsIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, equalsIndex).trim();
  let value = trimmed.slice(equalsIndex + 1).trim();

  if (!key) {
    return null;
  }

  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const parsed = parseLine(line);

    if (!parsed) {
      continue;
    }

    const { key, value } = parsed;

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnv() {
  const candidates = [
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", "src", ".env.local"),
  ];

  for (const candidate of candidates) {
    loadEnvFile(candidate);
  }
}

module.exports = {
  loadLocalEnv,
};
