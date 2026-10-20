#!/usr/bin/env node

'use strict';

const path = require('path');
const { audit } = require('./audit');

function parseArgs(argv) {
  const options = {
    packagePath: null,
    readmePath: null,
    json: false,
    strict: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--package' || arg === '-p') {
      options.packagePath = argv[++i];
    } else if (arg === '--readme' || arg === '-r') {
      options.readmePath = argv[++i];
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (options.packagePath) {
    options.packagePath = path.resolve(options.packagePath);
  }
  if (options.readmePath) {
    options.readmePath = path.resolve(options.readmePath);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: readme-scripts [options]

Options:
  -p, --package <path>  Path to package.json (default: ./package.json)
  -r, --readme <path>   Path to README.md (default: ./README.md)
  --json                Print machine-readable JSON
  --strict              Exit with status 1 when issues are found
  -h, --help            Show this help
`);
}

function printReport(result) {
  console.log('README scripts audit\n');
  console.log(`Package:       ${result.packagePath}`);
  console.log(`README:        ${result.readmePath}\n`);
  console.log(`Scripts:       ${result.scripts.length}`);
  console.log(`Documented:    ${result.mentioned.length}`);
  console.log(`Undocumented:  ${result.undocumented.length}`);
  console.log(`Stale refs:    ${result.staleReferences.length}\n`);

  if (result.undocumented.length > 0) {
    console.log('Undocumented scripts:');
    result.undocumented.forEach((name) => console.log(`  - ${name}`));
    console.log('');
  }

  if (result.staleReferences.length > 0) {
    console.log('Stale references:');
    result.staleReferences.forEach((item) => {
      console.log(`  - ${result.readmePath}:${item.line}: ${item.command}`);
    });
    console.log('');
  }

  if (result.ok) {
    console.log('No README script issues found.');
  }
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }

  let result;
  try {
    result = audit(options);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printReport(result);
  }

  if (options.strict && !result.ok) {
    process.exit(1);
  }
}

main();
