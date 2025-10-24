const fs = require('fs');
const path = require('path');

console.log('🔧 Comprehensive TypeScript Syntax Fixer v2.0\n');
console.log('Fixing all common syntax error patterns...\n');

const apiDir = path.join(__dirname, 'src', 'app', 'api');
let totalFixed = 0;
let fileCount = 0;

// Recursively find all route.ts files
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

// Fix patterns
const fixes = [
  {
    name: 'Missing closing brace after Prisma queries',
    pattern: /(\s+)\}(\s+\n\s+\n\s+)(const|let|var|return|if|for|switch|while) /g,
    replacement: '$1});$2$3 ',
  },
  {
    name: 'Missing closing brace in if statements',
    pattern: /(\s+if\s*\([^)]+\)\s*\{[^}]*)\n(\s+)(const|let|var|if|return)/g,
    replacement: '$1\n$2}\n$2$3',
  },
  {
    name: 'Extra semicolon in map/filter functions',
    pattern: /(\s+\w+\s*=\s*\w+\.(?:map|filter)\([^{]+\{);/g,
    replacement: '$1',
  },
  {
    name: 'Missing closing brace before catch',
    pattern: /(\s+\);)(\s+\n\s+)\} catch/g,
    replacement: '$1$2}$2} catch',
  },
  {
    name: 'Extra closing brace in requireAuth wrapper',
    pattern: /(\s+\);)(\s+\n\s+)\}\);/g,
    replacement: '$1$2}$2});',
  },
  {
    name: 'Missing closing brace in Prisma count',
    pattern: /(\s+await\s+prisma\.\w+\.count\(\{[^}]+\},\s*\n\s+\}\s*,?\s*\n\s+)(const|let|var)/g,
    replacement: '$1});$2',
  },
  {
    name: 'Missing closing brace after map function',
    pattern: /(\s+\}\s*;?\s*\n\s+)\}\s*\n\s*\n\s+(const|let|var|return)/g,
    replacement: '$1});$2',
  },
  {
    name: 'Extra closing brace before export',
    pattern: /(\s+\})(\s+\n\s+)\}\s*\n\s*\nexport const/g,
    replacement: '$1$2});$2export const',
  },
  {
    name: 'Missing closing brace in switch cases',
    pattern: /(\s+break;\s*\n\s+)(case|default):/g,
    replacement: (match, indent, keyword) => {
      // Check if there's a missing closing brace
      return `${indent}}${indent}${keyword}:`;
    },
  },
  {
    name: 'Extra semicolon in Zod schema',
    pattern: /(permissions:\s*z\.object\(\{\}\)\.optional\(\),?\s*\n\s+)\}(\s+\n\s+\nexport const)/g,
    replacement: '$1});$2',
  },
];

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;

    // Apply each fix pattern
    fixes.forEach(fix => {
      const before = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== before) {
        fixesApplied++;
      }
    });

    // Additional specific fixes

    // Fix 1: Missing closing brace after prisma queries (more aggressive)
    content = content.replace(
      /(await\s+prisma\.\w+\.(?:findMany|findUnique|findFirst|count)\(\{[\s\S]{1,500}?\}\s*,?\s*\n\s+\})\s*\n\s+\n\s+(const|let|var|return|if)/g,
      '$1);$2'
    );

    // Fix 2: Missing closing brace in map functions
    content = content.replace(
      /(\.map\([^{]+\{[\s\S]{1,300}?\}\s*\);?\s*\n\s+)\}\s*\n\s+\n\s+(const|let|var|return)/g,
      '$1});$2'
    );

    // Fix 3: Extra closing brace pattern `});` -> `}`
    content = content.replace(
      /(\s+\}\s*\n\s+)\}\);(\s+\n\s+}\s*\n\}\);)/g,
      '$1}$2'
    );

    // Fix 4: Missing closing brace in filter functions
    content = content.replace(
      /(\.filter\([^{]+\{[\s\S]{1,200}?return [^}]+\s*\n\s+)\}\s*;?\s*\n\s+\n\s+(const|let|var)/g,
      '$1});$2'
    );

    // Fix 5: Extra closing `});` in catch blocks
    content = content.replace(
      /(\} catch \(error\) \{[\s\S]{1,200}?\);[\s\S]{1,50}?\n\s+)\}\);/g,
      '$1}'
    );

    // Fix 6: Missing closing for if-statements before variable declarations
    content = content.replace(
      /(if\s*\([^)]+\)\s*\{[\s\S]{1,200}?where\.\w+\s*=\s*[^;]+;)\s*\n\s+\n\s+(if|const|let|var)/g,
      '$1$2}$2$3'
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const fileName = path.relative(apiDir, filePath);
      console.log(`✅ Fixed: ${fileName} (${fixesApplied} patterns)`);
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
console.log(`   Total patterns fixed: ${totalFixed}`);
console.log(`\n✨ Done! Run 'pnpm build' to verify.\n`);
