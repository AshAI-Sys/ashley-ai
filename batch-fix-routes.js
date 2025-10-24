const fs = require('fs');
const path = require('path');

const apiPath = 'C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin\\src\\app\\api';

// Common fix patterns
const fixes = [
  {
    name: 'Missing }); before } catch',
    pattern: /(\s+)\}\s+(} catch \()/g,
    replacement: '$1  });$1$2'
  },
  {
    name: 'Missing }); after NextResponse.json',
    pattern: /(message:\s*"[^"]+",?)\s+\}\s+(} catch)/g,
    replacement: '$1$1    });$1  $2'
  },
  {
    name: 'Missing } after throw',
    pattern: /(throw [^;]+;)\s+\n\s+(const |if |return |async |\/\/)/g,
    replacement: '$1\n  }\n\n  $2'
  },
  {
    name: 'Missing }); before export',
    pattern: /(\s+)\}\s+\}\s+(export const (GET|POST|PUT|DELETE|PATCH))/g,
    replacement: '$1  });$1});$1$1$2'
  },
  {
    name: 'Missing }); after Prisma query',
    pattern: /(\s+)\},\s+\}\s+(const |if |return |await )/g,
    replacement: '$1    });$1  }$1$1$2'
  },
  {
    name: 'Missing }); after forEach',
    pattern: /(\s+)\}\);\s+\n\s+(return )/g,
    replacement: '$1  });$1$1  $2'
  },
  {
    name: 'Missing });} at end of requireAuth',
    pattern: /(\s+throw error;)\s+\}\s+\}\s+\n\s+(async function)/g,
    replacement: '$1$1  }$1});$1$1$2'
  },
  {
    name: 'Extra }); at end of file',
    pattern: /\}\s*\}\)\;?\s*$/g,
    replacement: '});'
  }
];

// Get all route.ts files recursively
function getRouteFiles(dir) {
  let results = [];
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        results = results.concat(getRouteFiles(filePath));
      } else if (file === 'route.ts') {
        results.push(filePath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }

  return results;
}

// Fix a single file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let appliedFixes = [];

    // Apply all fix patterns
    for (const fix of fixes) {
      const before = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== before) {
        appliedFixes.push(fix.name);
      }
    }

    // Write back if changed
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      return appliedFixes;
    }
  } catch (err) {
    console.error(`Error fixing ${filePath}:`, err.message);
  }

  return [];
}

// Main
console.log('Finding route.ts files...\n');
const files = getRouteFiles(apiPath);
console.log(`Found ${files.length} route.ts files\n`);

let filesFixed = 0;
let totalFixes = 0;

files.forEach(file => {
  const appliedFixes = fixFile(file);
  if (appliedFixes.length > 0) {
    filesFixed++;
    totalFixes += appliedFixes.length;
    const relPath = path.relative('C:\\Users\\Khell\\Desktop\\Ashley AI', file);
    console.log(`✓ ${relPath}`);
    appliedFixes.forEach(fix => console.log(`  - ${fix}`));
  }
});

console.log(`\n=== Summary ===`);
console.log(`Files fixed: ${filesFixed}/${files.length}`);
console.log(`Total fixes applied: ${totalFixes}`);
