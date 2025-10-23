#!/usr/bin/env node
/**
 * Fix missing closing parenthesis for requireAuth wrapper in API routes
 *
 * Pattern to fix:
 * export const GET = requireAuth(async (request: NextRequest, _user) => {
 *   try {
 *     ...
 *   } catch (error) {
 *     ...
 *   }
 * }  // <-- Missing )
 *
 * Should be:
 * })  // <-- Correct
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files with errors
const errorOutput = execSync(
  'cd "C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin" && pnpm type-check 2>&1 | grep "error TS"',
  { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
);

// Parse error lines to get files with issues
const errorLines = errorOutput.split('\n').filter(line => line.trim());
const fileErrors = new Map();

errorLines.forEach(line => {
  const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
  if (match) {
    const [, filePath, lineNum, colNum, errorCode, errorMsg] = match;
    if (!fileErrors.has(filePath)) {
      fileErrors.set(filePath, []);
    }
    fileErrors.get(filePath).push({
      line: parseInt(lineNum),
      col: parseInt(colNum),
      code: errorCode,
      msg: errorMsg
    });
  }
});

console.log(`Found ${fileErrors.size} files with TypeScript errors`);

let filesFixed = 0;
let changesMade = 0;

// Process each file
for (const [relPath, errors] of fileErrors.entries()) {
  const filePath = path.join('C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin', relPath);

  if (!fs.existsSync(filePath)) {
    console.log(`  Skipping ${relPath} (file not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  const lines = content.split('\n');

  // Look for patterns that need fixing
  let modified = false;

  // Fix 1: Missing closing ) for requireAuth wrapper
  // Pattern: export const METHOD = requireAuth(async (...) => {\n...\n}
  // Should be: export const METHOD = requireAuth(async (...) => {\n...\n})

  const requireAuthLines = [];
  lines.forEach((line, idx) => {
    if (line.match(/export const \w+ = requireAuth\(async/)) {
      requireAuthLines.push(idx);
    }
  });

  for (const startLine of requireAuthLines) {
    // Find the closing brace for this function
    let braceCount = 0;
    let foundStart = false;
    let closingLine = -1;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];

      // Count braces
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          foundStart = true;
        } else if (char === '}') {
          braceCount--;
          if (foundStart && braceCount === 0) {
            closingLine = i;
            break;
          }
        }
      }

      if (closingLine !== -1) break;
    }

    if (closingLine !== -1) {
      // Check if this line ends with just } instead of })
      const closingLineContent = lines[closingLine].trim();
      if (closingLineContent === '}' || closingLineContent === '};') {
        // Check if there's a ) on the next line
        const nextLine = lines[closingLine + 1];
        if (!nextLine || !nextLine.trim().startsWith(')')) {
          // Fix: add ) to the closing brace
          if (closingLineContent === '};') {
            lines[closingLine] = lines[closingLine].replace(/};?\s*$/, '});');
          } else {
            lines[closingLine] = lines[closingLine].replace(/}\s*$/, '})');
          }
          modified = true;
          changesMade++;
        }
      }
    }
  }

  // Fix 2: Missing try block
  // Pattern: const METHOD = requireAuth(async (...) => {\n  const data = ...
  // Should have: const METHOD = requireAuth(async (...) => {\n  try {
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    if (line.match(/export const \w+ = requireAuth\(async/) &&
        !nextLine.includes('try {') &&
        nextLine.trim() !== '') {
      // Insert try block
      const indent = nextLine.match(/^(\s*)/)[1];
      lines.splice(i + 1, 0, `${indent}try {`);

      // Find where to add closing } catch (error)
      // Look for the closing brace of the async function
      let braceCount = 0;
      let foundClosing = false;
      for (let j = i + 1; j < lines.length; j++) {
        for (const char of lines[j]) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        if (braceCount === 0 && j > i + 2) {
          // Insert catch block before this closing brace
          lines.splice(j, 0,
            `${indent}} catch (error) {`,
            `${indent}  console.error('Error:', error);`,
            `${indent}  return NextResponse.json(`,
            `${indent}    { success: false, error: 'Internal server error' },`,
            `${indent}    { status: 500 }`,
            `${indent}  );`,
            `${indent}}`
          );
          foundClosing = true;
          break;
        }
      }

      if (foundClosing) {
        modified = true;
        changesMade++;
      }
    }
  }

  if (modified) {
    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    filesFixed++;
    console.log(`  ✓ Fixed ${relPath}`);
  }
}

console.log(`\nFixed ${filesFixed} files with ${changesMade} changes`);
console.log('\nRunning type-check to verify...');

try {
  execSync('cd "C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin" && pnpm type-check 2>&1', {
    encoding: 'utf-8',
    stdio: 'inherit'
  });
  console.log('\n✓ Type check passed!');
} catch (error) {
  console.log('\n⚠ Some errors remain. Running targeted fixes...');
}
