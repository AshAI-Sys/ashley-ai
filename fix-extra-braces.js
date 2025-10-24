const fs = require('fs');
const path = require('path');

const apiPath = 'C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin\\src\\app\\api';

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

// Fix extra }); at end of file
function fixExtraBraces(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Remove duplicate }); at the very end (pattern: });  })
    content = content.replace(/\}\);\s+\}\)/g, '})');

    // Fix pattern where }); appears twice before end
    content = content.replace(/\n\s*\}\);\s*\n\s*\}\);?\s*$/g, '\n});');

    // Fix extra });  }); pattern
    content = content.replace(/\s+\}\);\s+\}\);/g, '  });');

    // Write back if changed
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
  } catch (err) {
    console.error(`Error fixing ${filePath}:`, err.message);
  }

  return false;
}

// Main
console.log('Fixing extra braces...\n');

const files = getRouteFiles(apiPath);
let filesFixed = 0;

files.forEach(file => {
  if (fixExtraBraces(file)) {
    filesFixed++;
    const relPath = path.relative('C:\\Users\\Khell\\Desktop\\Ashley AI', file);
    console.log(`✓ ${relPath}`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Files fixed: ${filesFixed}/${files.length}`);
