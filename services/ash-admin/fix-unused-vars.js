#!/usr/bin/env node
/**
 * Automated script to fix unused variable errors
 * Prefixes unused vars with underscore to suppress TypeScript errors
 */

const fs = require('fs');
const path = require('path');

// Read the unused vars list
const unusedVarsFile = path.join(__dirname, 'unused-vars.txt');
const unusedVars = fs.readFileSync(unusedVarsFile, 'utf-8').split('\n');

const fixes = {};

// Parse each error line
unusedVars.forEach(line => {
  const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS6133: '(.+?)' is declared but/);
  if (match) {
    const [, filePath, lineNum, col, varName] = match;
    const fullPath = path.join(__dirname, filePath);

    if (!fixes[fullPath]) {
      fixes[fullPath] = [];
    }

    fixes[fullPath].push({
      line: parseInt(lineNum),
      col: parseInt(col),
      varName,
      originalLine: line
    });
  }
});

console.log(`Found ${Object.keys(fixes).length} files with unused variables`);
console.log(`Total errors to fix: ${unusedVars.length}`);

let totalFixed = 0;

// Fix each file
Object.entries(fixes).forEach(([filePath, errors]) => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Sort errors by line number (descending) to avoid offset issues
  errors.sort((a, b) => b.line - a.line);

  errors.forEach(({ line, varName }) => {
    const lineIndex = line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const originalLine = lines[lineIndex];

      // Skip if already prefixed
      if (originalLine.includes(`_${varName}`)) return;

      // Different patterns to handle
      const patterns = [
        // Function parameters: (foo, bar) => OR function(foo, bar)
        { regex: new RegExp(`([,(]\\s*)${varName}(\\s*[,):])`, 'g'), replacement: `$1_${varName}$2` },
        // Variable declarations: const foo = OR let foo =
        { regex: new RegExp(`(const|let|var)(\\s+)${varName}(\\s*[=:])`, 'g'), replacement: `$1$2_${varName}$3` },
        // Destructuring: { foo } = OR [ foo ] =
        { regex: new RegExp(`([{,]\\s*)${varName}(\\s*[},])`, 'g'), replacement: `$1_${varName}$2` },
        // Import: import { foo }
        { regex: new RegExp(`(import\\s*{[^}]*?)${varName}([^}]*?})`, 'g'), replacement: `$1_${varName}$2` },
      ];

      let modified = false;
      patterns.forEach(({ regex, replacement }) => {
        if (regex.test(originalLine)) {
          lines[lineIndex] = originalLine.replace(regex, replacement);
          modified = true;
        }
      });

      if (modified) {
        totalFixed++;
      }
    }
  });

  // Write back
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  console.log(`Fixed ${filePath}: ${errors.length} errors`);
});

console.log(`\n✅ Total errors fixed: ${totalFixed}`);
console.log(`Run 'pnpm tsc --noEmit' to verify fixes`);
