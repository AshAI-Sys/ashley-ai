/**
 * Fix missing closing parentheses for requireAuth wrappers
 * Simple pattern: Find } at end of try/catch blocks in requireAuth functions and add )
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing requireAuth wrapper closures...\n');

const basePath = 'C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin\\src\\app\\api';
let filesFixed = 0;
let totalChanges = 0;

// Recursively find all route.ts files
function findRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findRouteFiles(filePath));
    } else if (file === 'route.ts') {
      results.push(filePath);
    }
  });

  return results;
}

const routeFiles = findRouteFiles(basePath);

console.log(`Found ${routeFiles.length} route files\n`);

routeFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  let changed = false;

  // Pattern 1: Fix missing ) after requireAuth wrapper
  // Look for: export const METHOD = requireAuth(async (...) => {...}
  //                                                                ^--- missing )
  //
  // Strategy: Find all "export const METHOD = requireAuth(async" lines
  // Then find their corresponding closing } and check if it needs )

  const lines = content.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Is this a requireAuth export line?
    if (line.match(/^export const \w+ = requireAuth\(async/)) {
      // Mark that we're in a requireAuth function
      newLines.push(line);

      // Find the closing brace for this function
      let braceDepth = 0;
      let started = false;
      let closingLineIndex = -1;

      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];

        // Count braces
        for (const char of currentLine) {
          if (char === '{') {
            braceDepth++;
            started = true;
          } else if (char === '}') {
            braceDepth--;
            if (started && braceDepth === 0) {
              closingLineIndex = j;
              break;
            }
          }
        }

        if (closingLineIndex !== -1) break;
      }

      // Process the lines between i+1 and closingLineIndex
      if (closingLineIndex !== -1) {
        for (let k = i + 1; k < closingLineIndex; k++) {
          newLines.push(lines[k]);
        }

        // At closing line - check if it needs )
        const closingLine = lines[closingLineIndex];
        const trimmed = closingLine.trim();

        // If it's just } or }; then it needs )
        if (trimmed === '}' || trimmed === '};') {
          // Check next line to confirm it's the end
          const nextLine = lines[closingLineIndex + 1];
          if (!nextLine || nextLine.trim() === '' ||
              nextLine.match(/^export/) ||
              nextLine.match(/^async function/) ||
              nextLine.match(/^function/)) {

            // Add the closing with )
            const indent = closingLine.match(/^(\s*)/)[1];
            if (trimmed === '};') {
              newLines.push(`${indent}});`);
            } else {
              newLines.push(`${indent}})`);
            }
            changed = true;
            totalChanges++;

            // Skip to next line after closing
            i = closingLineIndex;
            continue;
          }
        }

        newLines.push(closingLine);
        i = closingLineIndex;
      }
    } else {
      newLines.push(line);
    }
  }

  if (changed) {
    newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    filesFixed++;
    const relativePath = filePath.replace(basePath + '\\', '');
    console.log(`  ✓ Fixed: ${relativePath}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`  Files fixed: ${filesFixed}`);
console.log(`  Total changes: ${totalChanges}\n`);

if (filesFixed > 0) {
  console.log('✅ Fix completed! Run type-check to verify.\n');
} else {
  console.log('ℹ️  No files needed fixing\n');
}
