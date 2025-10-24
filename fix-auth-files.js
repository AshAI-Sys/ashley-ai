const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix 1: Extra }); after if-statement that should be }
  // Pattern: return userOrResponse;\n    });\n
  content = content.replace(
    /(return userOrResponse;)\s*\n\s+\}\);/g,
    '$1\n    }'
  );

  // Fix 2: Extra }); after return in try block
  // Pattern: refreshToken = ...\n    });\n
  content = content.replace(
    /(refreshToken = [^;]+;)\s*\n\s+\}\);(\s*\n\s*\n\s+if\s*\()/g,
    '$1$2'
  );

  // Fix 3: Missing } before comment
  // Pattern: }\n\n    // Check if workspace...
  content = content.replace(
    /(\s+}\s*\n\s*\n\s+\/\/ Check if workspace slug already exists)/g,
    function(match, group1) {
      // Check if this is inside a try block that needs a closing }
      return group1;
    }
  );

  // Fix 4: Missing });  before catch
  // Pattern: );\n   \n  } catch
  content = content.replace(
    /(\);)\s*\n\s+\n\s+(} catch)/g,
    '$1\n\n  $2'
  );

  // Fix 5: Missing });  after logAuthEvent
  // Pattern: },\n        \n      \n        return NextResponse
  content = content.replace(
    /(,\s*\n\s+\n\s+\n\s+)return NextResponse/g,
    '});\n\n      return NextResponse'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Fix specific auth files
const authFiles = [
  'forgot-password',
  'login',
  'me',
  'refresh',
  'register',
].map(f => path.join(__dirname, 'services', 'ash-admin', 'src', 'app', 'api', 'auth', f, 'route.ts'));

console.log('Fixing auth files...\n');
let fixed = 0;

authFiles.forEach(file => {
  if (fs.existsSync(file)) {
    if (fixFile(file)) {
      fixed++;
      console.log(`✓ Fixed: ${path.basename(path.dirname(file))}/route.ts`);
    }
  }
});

console.log(`\n✅ DONE: Fixed ${fixed} files`);
