const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { validateDocs } = require('./validateDocs');

const docsDir = path.resolve(__dirname, '../docs');
const issues = validateDocs(docsDir);

assert.deepStrictEqual(issues, []);
assert(!issues.some(issue => issue.includes('duplicate permalink')), 'duplicate permalinks must be reported');

const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-docs-'));
fs.mkdirSync(path.join(fixtureDir, '01.foo'));
fs.mkdirSync(path.join(fixtureDir, '02.bar'));
fs.writeFileSync(path.join(fixtureDir, '01.foo', '01.a.md'), '---\npermalink: /same/\n---\n');
fs.writeFileSync(path.join(fixtureDir, '02.bar', '01.b.md'), '---\npermalink: /same/\n---\n');

const fixtureIssues = validateDocs(fixtureDir);
assert(
  fixtureIssues.some(issue => issue.includes('duplicate permalink')),
  'duplicate permalinks must be reported'
);
