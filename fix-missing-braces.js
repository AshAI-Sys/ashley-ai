/**
 * Fix missing closing braces for if blocks
 * Pattern: if (...) { ... return ...; } // <-- missing } before next statement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing missing closing braces for if blocks...\n');

// Get all files with TS1005 'try' expected errors (indicates code not in try block)
const errors = execSync(
  'cd "C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin" && pnpm type-check 2>&1 | grep "error TS1005.*try.*expected"',
  { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
).trim().split('\n').filter(line => line.trim());

console.log(`Found ${errors.length} files with "try expected" errors\n`);

const fileMap = new Map();
errors.forEach(line => {
  const match = line.match(/^(.+?)\((\d+),/);
  if (match) {
    const [, relPath, lineNum] = match;
    const filePath = path.join('C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin', relPath);
    if (!fileMap.has(filePath)) {
      fileMap.set(filePath, []);
    }
    fileMap.get(filePath).push(parseInt(lineNum));
  }
});

let filesFixed = 0;
let totalFixes = 0;

for (const [filePath, errorLines] of fileMap.entries()) {
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;

  // For each error line, check if we need to add a closing brace before it
  for (const errorLine of errorLines.sort((a, b) => b - a)) { // Process from bottom to top
    // Look backwards to find if there's an unclosed if block
    const targetIdx = errorLine - 1; // Convert to 0-based index

    if (targetIdx <= 0 || targetIdx >= lines.length) continue;

    // Check if the previous line ends with }); or });
    const prevLine = lines[targetIdx - 1];
    const prevPrevLine = targetIdx >= 2 ? lines[targetIdx - 2] : '';

    // Pattern: return NextResponse.json({...}); followed by new statement
    // Need to add closing } for the if block

    if (prevLine.trim().match(/^\}\);?\s*$/)) {
      // Look further back to find the if statement
      let foundIf = false;
      let braceCount = 0;

      for (let i = targetIdx - 2; i >= 0; i--) {
        const line = lines[i];

        // Count braces backwards
        for (let j = line.length - 1; j >= 0; j--) {
          if (line[j] === '}') braceCount++;
          if (line[j] === '{') braceCount--;
        }

        // If we find an if statement and braces are balanced, we might need a closing brace
        if (line.trim().startsWith('if (') && braceCount < 0) {
          foundIf = true;
          break;
        }

        // If we hit another export or function, stop
        if (line.match(/^export const/) || line.match(/^async function/) || line.match(/^function/)) {
          break;
        }
      }

      if (foundIf && braceCount < 0) {
        // Add closing brace before the current error line
        const indent = lines[targetIdx].match(/^(\s*)/)[1];
        lines.splice(targetIdx, 0, `${indent.slice(0, -2)}}`); // Add } with less indent
        modified = true;
        totalFixes++;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    filesFixed++;
    const relativePath = filePath.replace('C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin\\', '');
    console.log(`  ✓ Fixed: ${relativePath}`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`  Files fixed: ${filesFixed}`);
console.log(`  Total fixes: ${totalFixes}\n`);

if (filesFixed > 0) {
  console.log('✅ Running type-check to verify...\n');
  try {
    execSync('cd "C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin" && pnpm type-check 2>&1 | grep "error TS" | wc -l', {
      encoding: 'utf-8',
      stdio: 'inherit'
    });
  } catch (error) {
    // Errors expected
  }
}
