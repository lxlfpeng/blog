const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function validateDocs(docsDir) {
  const issues = [];
  const permalinks = new Map();

  walk(docsDir, file => {
    const relativePath = toPosix(path.relative(docsDir, file));
    const filename = path.basename(file);

    if (filename === 'README.md' && path.dirname(relativePath) !== '.') {
      issues.push(`${relativePath}: README.md is not valid in vdoing structured sidebar directories`);
    }

    if (filename.endsWith('.md')) {
      recordPermalink(file, relativePath, permalinks);
      findUnescapedGitHubActionsExpressions(file, relativePath, issues);
    }
  });

  for (const [permalink, files] of permalinks.entries()) {
    if (files.length > 1) {
      issues.push(`duplicate permalink "${permalink}": ${files.join(', ')}`);
    }
  }

  return issues;
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir)) {
    if (entry === '.vuepress' || entry === '@pages') continue;

    const file = path.join(dir, entry);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      walk(file, visit);
    } else {
      visit(file);
    }
  }
}

function findUnescapedGitHubActionsExpressions(file, relativePath, issues) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let inFence = false;

  lines.forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }

    if (!inFence && line.includes('${{')) {
      issues.push(`${relativePath}:${index + 1}: escape GitHub Actions expression for VuePress`);
    }
  });
}

function recordPermalink(file, relativePath, permalinks) {
  const content = fs.readFileSync(file, 'utf8');
  const { data } = matter(content, {});
  const permalink = data && data.permalink;
  if (!permalink) return;

  const files = permalinks.get(permalink) || [];
  files.push(relativePath);
  permalinks.set(permalink, files);
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

module.exports = {
  validateDocs
};

if (require.main === module) {
  const docsDir = path.resolve(__dirname, '../docs');
  const issues = validateDocs(docsDir);

  if (issues.length) {
    console.error('[docs] validation failed:');
    issues.forEach(issue => console.error(`- ${issue}`));
    process.exit(1);
  }
}
