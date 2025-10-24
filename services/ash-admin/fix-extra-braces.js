const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Extra Closing Braces v1.0\n');

const apiDir = path.join(__dirname, 'src', 'app', 'api');
let totalFixed = 0;
let fileCount = 0;

function findRouteFiles(dir) {
  const files = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...findRouteFiles(fullPath));
      } else if (item.name === 'route.ts') {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
  return files;
}

const files = findRouteFiles(apiDir);
console.log(`📁 Found ${files.length} route files to check\n`);

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;

    // Fix 1: Extra `});` after if statements that should just be `}`
    const before1 = content;
    content = content.replace(
      /(\s+if\s*\([^)]+\)\s*\{[\s\S]{1,300}?return[\s\S]{1,100}?\);[\s\S]{1,50}?\n\s+)\}\);(\s+\n)/g,
      '$1}$2'
    );
    if (content !== before1) fixesApplied++;

    // Fix 2: Double closing  braces like `}` followed by `});`
    const before2 = content;
    content = content.replace(
      /(\s+\})(\s+\n\s+)\}\);(\s+\n\s+\n\s+)(const|let|var|return)/g,
      '$1$2$4'
    );
    if (content !== before2) fixesApplied++;

    // Fix 3: Extra `});` in filter/map chains
    const before3 = content;
    content = content.replace(
      /(\.(?:filter|map)\([^{]+\{[\s\S]{1,200}?return\s+matches;\s*\n\s+)\}\);(\s+\n\s+\n\s+if\s*\()/g,
      '$1})$2'
    );
    if (content !== before3) fixesApplied++;

    // Fix 4: Remove extra `});` after simple if-statement blocks
    const before4 = content;
    content = content.replace(
      /(\s+if\s*\([^)]+\)\s*\{[\s\S]{1,150}?matches\s*=[\s\S]{1,100}?\n\s+)\}\);(\s+\n\s+\n\s+if\s*\()/g,
      '$1}$2'
    );
    if (content !== before4) fixesApplied++;

    // Fix 5: Extra closing before catch
    const before5 = content;
    content = content.replace(
      /(\s+\);[\s\S]{1,50}?\n\s+)\}(\s+\n\s+)\} catch/g,
      '$1$2} catch'
    );
    if (content !== before5) fixesApplied++;

    // Fix 6: Extra `});` before return statements
    const before6 = content;
    content = content.replace(
      /(\s+\n\s+)\}\);(\s+\n\s+\n\s+return NextResponse)/g,
      '$1$2'
    );
    if (content !== before6) fixesApplied++;

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const fileName = path.relative(apiDir, filePath);
      console.log(`✅ Fixed: ${fileName} (${fixesApplied} fixes)`);
      fileCount++;
      totalFixed += fixesApplied;
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files checked: ${files.length}`);
console.log(`   Files fixed: ${fileCount}`);
console.log(`   Total fixes applied: ${totalFixed}`);
console.log(`\n✨ Done! Run 'pnpm build' to verify.\n`);
