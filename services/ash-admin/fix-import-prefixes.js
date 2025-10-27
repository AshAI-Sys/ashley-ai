#!/usr/bin/env node
/**
 * Fix incorrectly prefixed imports from automated script
 * Removes underscore prefixes from import names
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript errors about incorrect imports
const output = execSync('pnpm tsc --noEmit 2>&1 || true', { encoding: 'utf-8' });
const lines = output.split('\n');

const fixes = {};

lines.forEach(line => {
  // Match: has no exported member named '_something'. Did you mean 'something'?
  const match = line.match(/^(.+?)\(\d+,\d+\): error TS2724: .* has no exported member named '(_\w+)'\. Did you mean '(\w+)'\?/);
  if (match) {
    const [, filePath, wrongName, correctName] = match;
    const fullPath = path.join(__dirname, filePath);

    if (!fixes[fullPath]) {
      fixes[fullPath] = [];
    }

    fixes[fullPath].push({ wrongName, correctName });
  }
});

console.log(`📋 Found ${Object.keys(fixes).length} files with incorrect import prefixes\n`);

let totalFixed = 0;

Object.keys(fixes).forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  fixes[filePath].forEach(({ wrongName, correctName }) => {
    // Replace in import statements
    const importRegex = new RegExp(`\\b${wrongName}\\b`, 'g');
    content = content.replace(importRegex, correctName);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed ${path.relative(__dirname, filePath)}: ${fixes[filePath].length} imports`);
    totalFixed += fixes[filePath].length;
  }
});

console.log(`\n✅ Total incorrect imports fixed: ${totalFixed}`);
console.log(`🔍 Run 'pnpm tsc --noEmit' to verify fixes`);
