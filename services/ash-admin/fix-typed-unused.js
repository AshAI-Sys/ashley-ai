const fs = require('fs');
const path = require('path');

// Read the unused-vars.txt file
const unusedVarsFile = path.join(__dirname, 'unused-vars.txt');
const content = fs.readFileSync(unusedVarsFile, 'utf8');
const lines = content.split('\n').filter(l => l.trim());

console.log(`Processing ${lines.length} warnings...\n`);

const fileFixes = new Map();

// Parse each warning
lines.forEach(line => {
  // Format: "src/path/file.ts(10,20): error TS6133: 'varName' is declared but its value is never read."
  const match = line.match(/^([^(]+)\((\d+),(\d+)\).*'([^']+)'/);
  if (!match) return;

  const [_, filePath, lineNum, colNum, varName] = match;
  const fullPath = path.join(__dirname, filePath);

  if (!fileFixes.has(fullPath)) {
    fileFixes.set(fullPath, []);
  }

  fileFixes.get(fullPath).push({
    line: parseInt(lineNum),
    col: parseInt(colNum),
    varName
  });
});

console.log(`Found issues in ${fileFixes.size} files\n`);

let totalFixed = 0;
let filesModified = 0;

// Process each file
for (const [filePath, fixes] of fileFixes.entries()) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }

  let fileContent = fs.readFileSync(filePath, 'utf8');
  const fileLines = fileContent.split('\n');
  let modified = false;

  // Sort fixes by line number (descending) to avoid offset issues
  fixes.sort((a, b) => b.line - a.line);

  for (const fix of fixes) {
    const lineIdx = fix.line - 1;
    if (lineIdx < 0 || lineIdx >= fileLines.length) continue;

    const line = fileLines[lineIdx];
    const varName = fix.varName;

    // Skip import statements - don't modify imports
    if (line.trim().startsWith('import ')) {
      continue;
    }

    // Strategy: Prefix unused parameters with underscore
    // Only fix if the variable is a function parameter

    // Pattern 1: Function parameter like "async (request: Type, user)" -> "async (request: Type, _user)"
    if (line.includes(`${varName})`) && line.includes('async')) {
      const newLine = line.replace(new RegExp(`\\b${varName}\\)`, 'g'), `_${varName})`);
      if (newLine !== line) {
        fileLines[lineIdx] = newLine;
        modified = true;
        totalFixed++;
      }
    }
    // Pattern 2: Function parameter like "async (user, request)" -> "async (_user, request)"
    else if (line.includes(`(${varName},`) && line.includes('async')) {
      const newLine = line.replace(new RegExp(`\\(${varName},`, 'g'), `(_${varName},`);
      if (newLine !== line) {
        fileLines[lineIdx] = newLine;
        modified = true;
        totalFixed++;
      }
    }
    // Pattern 3: Destructuring like "{ user }" -> "{ user: _user }"
    else if (line.includes(`{ ${varName}`) || line.includes(`{${varName}`)) {
      const newLine = line.replace(
        new RegExp(`\\{\\s*${varName}\\s*:`),
        `{ ${varName}: _${varName} :`
      ).replace(
        new RegExp(`\\{\\s*${varName}\\s*\\}`),
        `{ ${varName}: _${varName} }`
      );
      if (newLine !== line) {
        fileLines[lineIdx] = newLine;
        modified = true;
        totalFixed++;
      }
    }
    // Pattern 4: Simple variable declaration - prefix with underscore
    else if (line.includes(`const ${varName}`) || line.includes(`let ${varName}`) || line.includes(`var ${varName}`)) {
      const newLine = line.replace(new RegExp(`\\b(const|let|var)\\s+${varName}\\b`), `$1 _${varName}`);
      if (newLine !== line) {
        fileLines[lineIdx] = newLine;
        modified = true;
        totalFixed++;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, fileLines.join('\n'), 'utf8');
    filesModified++;
    console.log(`✓ Fixed: ${path.relative(__dirname, filePath)} (${fixes.length} issues)`);
  }
}

console.log(`\n✅ Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total fixes applied: ${totalFixed}`);
console.log(`\nRun 'npx tsc --noEmit 2>&1 | findstr TS6133 | Measure-Object -Line' to verify\n`);
