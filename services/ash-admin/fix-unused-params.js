const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
let fixCount = 0;

console.log('Starting to fix unused parameter warnings...\n');

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let changed = false;

  // Pattern 1: Fix "async (request: NextRequest, user)" -> "async (request: NextRequest, _user)"
  const pattern1 = /\basync\s+\(\s*([^:,]+)\s*:\s*(?:NextRequest|Request)\s*,\s*user\s*\)/g;
  if (pattern1.test(content)) {
    modified = content.replace(pattern1, 'async ($1: $2, _user)');
    changed = true;
  }

  // Pattern 2: Fix "async (req: NextRequest, user)" -> "async (req: NextRequest, _user)"
  const pattern2 = /\basync\s+\(\s*req\s*:\s*NextRequest\s*,\s*user\s*\)/g;
  if (pattern2.test(content)) {
    modified = modified.replace(pattern2, 'async (req: NextRequest, _user)');
    changed = true;
  }

  // Pattern 3: Fix "{ user }" destructuring -> "{ user: _user }"
  const pattern3 = /\{\s*user\s*:\s*(\w+)\s*\}/g;
  const matches = [...content.matchAll(pattern3)];
  for (const match of matches) {
    if (match[1] !== '_user' && match[1] !== 'userId') {
      // Only replace if not already prefixed
      const original = match[0];
      const replacement = original.replace(/user\s*:\s*(\w+)/, 'user: _user');
      modified = modified.replace(original, replacement);
      changed = true;
    }
  }

  // Pattern 4: Fix "async (request: NextRequest" where request is unused
  // We need to be careful here - only fix if the word 'request' doesn't appear again in the function

  if (changed) {
    fs.writeFileSync(filePath, modified, 'utf8');
    console.log(`✓ Fixed: ${path.relative(srcDir, filePath)}`);
    fixCount++;
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      try {
        processFile(filePath);
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
      }
    }
  }
}

walkDir(srcDir);

console.log(`\n✅ Total files fixed: ${fixCount}`);
console.log('\nRun "npx tsc --noEmit" to verify the fixes.\n');
