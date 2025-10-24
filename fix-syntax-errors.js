#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiDir = path.join(__dirname, 'services', 'ash-admin', 'src', 'app', 'api');

// Get all route.ts files
function getAllRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllRouteFiles(filePath));
    } else if (file === 'route.ts') {
      results.push(filePath);
    }
  });

  return results;
}

// Fix common syntax patterns
function fixSyntaxErrors(content) {
  let fixed = content;
  let changes = [];

  // Pattern 1: Missing }); before } catch
  const pattern1 = /(\s+)\}\s+(} catch \()/g;
  if (pattern1.test(fixed)) {
    fixed = fixed.replace(pattern1, '$1  });$1$2');
    changes.push('Added missing }); before catch block');
  }

  // Pattern 2: Missing }); at end of return NextResponse.json
  const pattern2 = /(return NextResponse\.json\(\{[^}]+\},?\s*)(\s+} catch)/g;
  if (pattern2.test(fixed)) {
    fixed = fixed.replace(pattern2, '$1});$2');
    changes.push('Added missing }); after NextResponse.json');
  }

  // Pattern 3: Missing }); before export const
  const pattern3 = /(\s+)\}\s+\}\s+(export const (GET|POST|PUT|DELETE|PATCH))/g;
  if (pattern3.test(fixed)) {
    fixed = fixed.replace(pattern3, '$1  });$1});$1$1$2');
    changes.push('Added missing }); before next export');
  }

  // Pattern 4: Missing } after if blocks
  const pattern4 = /(\s+throw [^;]+;)\s+(\s+\/\/ [^\n]+|const |if |return )/g;
  const matches4 = content.match(pattern4);
  if (matches4 && !content.includes('  }')) {
    fixed = fixed.replace(pattern4, '$1$1  }$1$1$2');
    changes.push('Added missing } after throw statement');
  }

  // Pattern 5: Missing }); after forEach
  const pattern5 = /(\s+)\}\);\s+(return [^;]+;)/g;
  if (pattern5.test(fixed)) {
    fixed = fixed.replace(pattern5, '$1  });$1$1  $2');
    changes.push('Added missing }); after forEach');
  }

  // Pattern 6: Missing }); at end of Prisma queries before next statement
  const pattern6 = /(\s+)\},\s+\}\s+(?=\s+(\/\/|const|if|return|await))/g;
  if (pattern6.test(fixed)) {
    fixed = fixed.replace(pattern6, '$1    });$1  }$1$1');
    changes.push('Added missing }); after Prisma query');
  }

  return { fixed, changes };
}

// Main execution
console.log('Starting syntax error fix...\n');

const routeFiles = getAllRouteFiles(apiDir);
console.log(`Found ${routeFiles.length} route.ts files\n`);

let filesFixed = 0;
let totalChanges = 0;

routeFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const { fixed, changes } = fixSyntaxErrors(content);

  if (changes.length > 0) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    filesFixed++;
    totalChanges += changes.length;

    const relativePath = path.relative(__dirname, filePath);
    console.log(`✓ Fixed: ${relativePath}`);
    changes.forEach(change => console.log(`  - ${change}`));
    console.log('');
  }
});

console.log(`\n=== Summary ===`);
console.log(`Files fixed: ${filesFixed}`);
console.log(`Total changes: ${totalChanges}`);
console.log(`Files scanned: ${routeFiles.length}`);
