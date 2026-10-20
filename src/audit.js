'use strict';

const fs = require('fs');
const path = require('path');

const EXPLICIT_COMMAND = /\b(?:npm|yarn|pnpm|bun)\s+run(?:-script)?\s+([A-Za-z0-9:._-]+)/g;
const SHORTHAND_COMMAND = /\b(?:yarn|pnpm|bun)\s+([A-Za-z0-9:._-]+)/g;
const NPM_LIFECYCLE = /\bnpm\s+(test|start|stop|restart)\b/g;

function readPackageJson(packagePath) {
  const content = fs.readFileSync(packagePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Could not parse ${packagePath}: ${error.message}`);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Expected an object in ${packagePath}`);
  }
  return parsed;
}

function audit(options = {}) {
  const packagePath = options.packagePath || path.join(process.cwd(), 'package.json');
  const readmePath = options.readmePath || path.join(process.cwd(), 'README.md');

  const packageJson = readPackageJson(packagePath);
  const scripts = Object.keys(packageJson.scripts || {}).sort();
  const readme = fs.readFileSync(readmePath, 'utf8');
  const lines = readme.split(/\r?\n/);

  const mentioned = new Set();
  const staleReferences = [];

  lines.forEach((line, index) => {
    for (const match of line.matchAll(EXPLICIT_COMMAND)) {
      const name = match[1];
      if (scripts.includes(name)) {
        mentioned.add(name);
      } else {
        staleReferences.push({
          line: index + 1,
          command: match[0].trim()
        });
      }
    }

    for (const match of line.matchAll(SHORTHAND_COMMAND)) {
      const name = match[1];
      if (scripts.includes(name)) {
        mentioned.add(name);
      }
    }

    for (const match of line.matchAll(NPM_LIFECYCLE)) {
      const name = match[1];
      if (scripts.includes(name)) {
        mentioned.add(name);
      }
    }
  });

  const undocumented = scripts.filter((name) => !mentioned.has(name));

  return {
    packagePath,
    readmePath,
    scripts,
    mentioned: [...mentioned].sort(),
    undocumented,
    staleReferences,
    ok: undocumented.length === 0 && staleReferences.length === 0
  };
}

module.exports = { audit };
