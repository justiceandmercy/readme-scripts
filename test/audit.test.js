'use strict';

const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { audit } = require('../src/audit');

function makeProject(readme, scripts) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'readme-scripts-'));
  fs.writeFileSync(
    path.join(directory, 'package.json'),
    JSON.stringify({ scripts }, null, 2)
  );
  fs.writeFileSync(path.join(directory, 'README.md'), readme);
  return directory;
}

const documented = makeProject(
  '# Project\n\nRun `npm run build` before releasing.\n',
  { build: 'node build.js', test: 'node --test' }
);
const documentedResult = audit({
  packagePath: path.join(documented, 'package.json'),
  readmePath: path.join(documented, 'README.md')
});
assert.deepEqual(documentedResult.undocumented, ['test']);
assert.equal(documentedResult.staleReferences.length, 0);

const stale = makeProject(
  '# Project\n\nRun `npm run deploy` to publish.\n',
  { build: 'node build.js' }
);
const staleResult = audit({
  packagePath: path.join(stale, 'package.json'),
  readmePath: path.join(stale, 'README.md')
});
assert.deepEqual(staleResult.undocumented, ['build']);
assert.equal(staleResult.staleReferences.length, 1);
assert.equal(staleResult.staleReferences[0].command, 'npm run deploy');

const shorthand = makeProject(
  '# Project\n\nUse `yarn build` and `pnpm test`.\n',
  { build: 'node build.js', test: 'node --test' }
);
const shorthandResult = audit({
  packagePath: path.join(shorthand, 'package.json'),
  readmePath: path.join(shorthand, 'README.md')
});
assert.deepEqual(shorthandResult.undocumented, []);
assert.equal(shorthandResult.staleReferences.length, 0);

console.log('All readme-scripts tests passed.');
