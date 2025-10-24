const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Fix 1: Missing }); before return NextResponse.json
  // Pattern: },\n      \n    \n      return NextResponse.json
  content = content.replace(
    /(},\s*\n\s+\n\s+\n\s+)return NextResponse\.json/g,
    '$1});\n\n    return NextResponse.json'
  );

  // Fix 2: Extra }); after if-statement conditions that should just be }
  // Pattern: }\n    });\n\n    if (
  content = content.replace(
    /(\s+}\s*\n\s+)\}\);(\s*\n\s*\n\s+if\s*\()/g,
    '$1}$2'
  );

  // Fix 3: Extra }); after if-statement that should be }
  // Pattern: }\n    });\n\n    const
  content = content.replace(
    /(\s+}\s*\n\s+)\}\);(\s*\n\s*\n\s+const\s+)/g,
    '$1}$2'
  );

  // Fix 4: Missing }); after getAuditLogs or similar function calls
  // Pattern: endDate,\n        \n      \n        return NextResponse
  content = content.replace(
    /(endDate,\s*\n\s+\n\s+\n\s+)return NextResponse/g,
    '$1});\n\n      return NextResponse'
  );

  // Fix 5: Similar pattern for other locations with blank lines before return
  content = content.replace(
    /(\s+}\s*,?\s*\n\s+\n\s+\n\s+)return NextResponse\.json/g,
    function(match, prefix) {
      // Check if we need });
      if (prefix.includes(',')) {
        return prefix + '});\n\n    return NextResponse.json';
      }
      return prefix + 'return NextResponse.json';
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        findRouteFiles(filePath, fileList);
      }
    } else if (file === 'route.ts' || file === 'route.tsx') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Main execution
const srcDir = path.join(__dirname, 'services', 'ash-admin', 'src', 'app', 'api');
console.log('Finding route files...');
const routeFiles = findRouteFiles(srcDir);
console.log(`Found ${routeFiles.length} route files\n`);

let filesFixed = 0;

routeFiles.forEach((file) => {
  const fixed = fixFile(file);
  if (fixed) {
    filesFixed++;
    console.log(`Fixed: ${file}`);
  }
});

console.log(`\n✅ DONE: Fixed ${filesFixed} files`);
