const fs = require('fs');
const path = require('path');

// Pattern fixes for common TypeScript syntax errors
const fixes = [
  {
    name: 'Extra brace after if-statement opening',
    pattern: /(if\s*\([^)]+\)\s*\{\s*\n\s+)\}/g,
    replacement: '$1',
  },
  {
    name: 'Extra brace before return in if-block',
    pattern: /(\s+if\s*\([^)]+\)\s*\{)\s*\n\s+\}\s*\n(\s+return\s+NextResponse\.json)/g,
    replacement: '$1\n$2',
  },
  {
    name: 'Extra brace before const after if-statement',
    pattern: /(\s+\}\s*\n\s+)\}\s*\n(\s+const\s+)/g,
    replacement: '$1$2',
  },
  {
    name: 'Missing });  after Prisma queries before return',
    pattern: /(\s+},\s*\n\s+)\}\s*\n\s+\n(\s+return\s+NextResponse\.json)/g,
    replacement: '$1});\n\n$2',
  },
  {
    name: 'Extra brace in else if anthropic block',
    pattern: /(\} else if \(anthropic\) \{\s*\n\s+\/\/ Use Anthropic[^\n]*\n)\s+\}\s*\n(\s+const response)/g,
    replacement: '$1$2',
  },
  {
    name: 'Extra brace in reduce/map/filter functions',
    pattern: /(\s+\)\s*=>\s*\{[^}]+)\}\s*\n(\s+return\s+)/g,
    replacement: '$1$2',
  },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let changesCount = 0;

  fixes.forEach((fix) => {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      changesCount += matches.length;
      console.log(`  ✓ Applied "${fix.name}": ${matches.length} fixes`);
    }
  });

  if (changesCount > 0) {
    fs.writeFileSync(filePath, content);
    return changesCount;
  }
  return 0;
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

let totalFixed = 0;
let filesFixed = 0;

routeFiles.forEach((file) => {
  const fixes = fixFile(file);
  if (fixes > 0) {
    filesFixed++;
    totalFixed += fixes;
    console.log(`Fixed ${file}: ${fixes} changes\n`);
  }
});

console.log(`\n✅ DONE: Fixed ${totalFixed} patterns in ${filesFixed} files`);
