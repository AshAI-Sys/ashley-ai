const fs = require('fs');
const path = require('path');

console.log('🔧 Automated TypeScript Syntax Fixer - Missing Closing Braces\n');

const apiDir = path.join(__dirname, 'src', 'app', 'api');

// Recursively find all route.ts files
function findRouteFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (item.name === 'route.ts') {
      files.push(fullPath);
    }
  }

  return files;
}

const files = findRouteFiles(apiDir);
console.log(`📁 Found ${files.length} route files to check\n`);

let fixedCount = 0;
let fileCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileFixed = false;

    // Fix 1: Missing }); after Prisma queries before variable assignment
    // Pattern: }) followed by newline and variable (missing semicolon)
    const fix1 = content.replace(/(\s+)\}(\s+\n\s+\n\s+)(tasks|totalPieces|const|let|var) = /g, (match, indent, middle, keyword) => {
      fileFixed = true;
      return `${indent}});${middle}${keyword} = `;
    });
    if (fix1 !== content) {
      content = fix1;
      fixedCount++;
    }

    // Fix 2: Missing } before catch block
    // Pattern: }); followed by newline then } catch
    const fix2 = content.replace(/(\s+)\}\);(\s+\n\s+)\} catch/g, (match, indent1, indent2) => {
      fileFixed = true;
      return `${indent1}});${indent2}} catch`;
    });
    if (fix2 !== content) {
      content = fix2;
      fixedCount++;
    }

    // Fix 3: Missing }); after Zod schemas
    const fix3 = content.replace(/(permissions: z\.object\(\{\}\)\.optional\(\),\s+)\}(\s+\n\s+\nexport const)/g, (match, before, after) => {
      fileFixed = true;
      return `${before}});${after}`;
    });
    if (fix3 !== content) {
      content = fix3;
      fixedCount++;
    }

    // Fix 4: Missing } before }); in requireAuth wrapper
    const fix4 = content.replace(/(\s+\);)(\s+\n\s+)\}(\s+\n\}\);)/g, (match, closeCall, indent1, indent2) => {
      fileFixed = true;
      return `${closeCall}${indent1}}${indent2}`;
    });
    if (fix4 !== content) {
      content = fix4;
      fixedCount++;
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const fileName = path.relative(apiDir, filePath);
      console.log(`✅ Fixed: ${fileName}`);
      fileCount++;
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files checked: ${files.length}`);
console.log(`   Files fixed: ${fileCount}`);
console.log(`   Total fixes applied: ${fixedCount}`);
console.log(`\n✨ Done! Run 'pnpm build' to verify.\n`);
