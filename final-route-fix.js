const fs = require('fs');
const path = require('path');

const apiPath = 'C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin\\src\\app\\api';

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
    console.error(`Error: ${err.message}`);
  }
  return results;
}

function fixRouteFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Fix pattern: } catch ... }  }); at end of file needs to be } catch ... }  });  });
    // This handles requireAuth wrapper that's missing final closing
    content = content.replace(/(\s+} catch[^}]+\}\s+)\}\);?\s*$/gm, '$1  });\n});');

    // Fix pattern where file ends with just });  - need to add extra });
    const lines = content.split('\n');
    const lastNonEmpty = lines.filter(l => l.trim()).pop();
    if (lastNonEmpty && lastNonEmpty.trim() === '});') {
      // Check if this is inside requireAuth by looking for "export const X = requireAuth"
      if (/export const (GET|POST|PUT|DELETE|PATCH) = requireAuth\(/m.test(content)) {
        const exportMatches = content.match(/export const (GET|POST|PUT|DELETE|PATCH) = requireAuth\(/g);
        const closingMatches = content.match(/\}\);/g);

        // Each requireAuth needs 2 closing }); - one for async function, one for requireAuth wrapper
        const expectedClosings = exportMatches ? exportMatches.length * 2 : 0;
        const actualClosings = closingMatches ? closingMatches.length : 0;

        if (actualClosings < expectedClosings) {
          // Add missing });
          const missing = expectedClosings - actualClosings;
          for (let i = 0; i < missing; i++) {
            if (!content.endsWith('\n')) content += '\n';
            content += '});\n';
          }
        }
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
  } catch (err) {
    console.error(`Error fixing ${filePath}:`, err.message);
  }
  return false;
}

console.log('Applying final fixes...\n');
const files = getRouteFiles(apiPath);
let fixed = 0;

files.forEach(file => {
  if (fixRouteFile(file)) {
    fixed++;
    console.log(`✓ ${path.relative('C:\\Users\\Khell\\Desktop\\Ashley AI', file)}`);
  }
});

console.log(`\nFixed ${fixed}/${files.length} files`);
