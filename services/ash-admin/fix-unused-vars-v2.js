#!/usr/bin/env node
/**
 * Automated script to fix unused variable errors - Version 2
 * Handles edge cases missed by v1:
 * - Variables already prefixed with _ or __
 * - Better function parameter matching
 * - Destructuring patterns
 * - Import statements
 */

const fs = require('fs');
const path = require('path');

// Read the remaining unused vars list
const unusedVarsFile = path.join(__dirname, 'remaining-unused-vars.txt');
const content = fs.readFileSync(unusedVarsFile, 'utf-8');
const unusedVars = content.split('\n').filter(line => line.trim());

console.log(`📋 Found ${unusedVars.length} unused variable errors to fix\n`);

const fixes = {};

// Parse each error line
unusedVars.forEach(line => {
  // Match pattern: src/path/file.ts(line,col): error TS6133: 'varName' is declared but...
  // Handle both with and without line number prefix
  const match = line.match(/(?:\s*\d+→)?(.+?)\((\d+),(\d+)\): error TS6133: '(.+?)' is declared but/);
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

console.log(`📁 Found ${Object.keys(fixes).length} files to fix\n`);

let totalFixed = 0;
let filesFixed = 0;

// Process each file
Object.keys(fixes).forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  const errors = fixes[filePath];
  let content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n');
  let fixedCount = 0;

  // Sort errors by line number (descending) to process from bottom to top
  errors.sort((a, b) => b.line - a.line);

  errors.forEach(({ line, varName }) => {
    if (line > lines.length) return;

    const lineContent = lines[line - 1];

    // Determine the new variable name
    let newVarName;
    if (varName.startsWith('__')) {
      // Already has double underscore, add another
      newVarName = '_' + varName;
    } else if (varName.startsWith('_')) {
      // Already has single underscore, add another
      newVarName = '_' + varName;
    } else {
      // No underscore prefix
      newVarName = '_' + varName;
    }

    // Create regex patterns to match this variable declaration
    const patterns = [
      // Function parameters: (foo, bar) => OR function(foo, bar) OR async (foo) =>
      {
        regex: new RegExp(`([,(]\\s*)${escapeRegex(varName)}(\\s*[,):=])`, 'g'),
        replacement: `$1${newVarName}$2`,
        name: 'function parameter'
      },
      // Variable declarations: const foo = OR let foo = OR var foo =
      {
        regex: new RegExp(`(const|let|var)(\\s+)${escapeRegex(varName)}(\\s*[=:,;])`, 'g'),
        replacement: `$1$2${newVarName}$3`,
        name: 'variable declaration'
      },
      // Destructuring in declarations: const { foo } = OR let { foo, bar } =
      {
        regex: new RegExp(`([{,]\\s*)${escapeRegex(varName)}(\\s*[},])`, 'g'),
        replacement: `$1${newVarName}$2`,
        name: 'destructuring'
      },
      // Import statements: import { foo } from OR import foo from
      {
        regex: new RegExp(`(import\\s*{[^}]*?)\\b${escapeRegex(varName)}\\b([^}]*?})`, 'g'),
        replacement: `$1${newVarName}$2`,
        name: 'import statement'
      },
      {
        regex: new RegExp(`(import\\s+)${escapeRegex(varName)}(\\s+from)`, 'g'),
        replacement: `$1${newVarName}$2`,
        name: 'default import'
      },
    ];

    let modified = false;
    for (const pattern of patterns) {
      const newLineContent = lineContent.replace(pattern.regex, pattern.replacement);
      if (newLineContent !== lineContent) {
        lines[line - 1] = newLineContent;
        fixedCount++;
        modified = true;
        break;
      }
    }
  });

  if (fixedCount > 0) {
    // Write the modified content back
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    console.log(`✅ Fixed ${path.relative(__dirname, filePath)}: ${fixedCount} errors`);
    totalFixed += fixedCount;
    filesFixed++;
  }
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

console.log(`\n✅ COMPLETE!`);
console.log(`📊 Files processed: ${filesFixed}/${Object.keys(fixes).length}`);
console.log(`📊 Total errors fixed: ${totalFixed}`);
console.log(`\n🔍 Run 'pnpm tsc --noEmit' to verify fixes`);
