const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix 1: Missing closing before catch block
  // Pattern: );\n   \n  } catch (error
  content = content.replace(
    /(\);)\s*\n\s+\n\s+(} catch \(error)/g,
    '$1\n\n  $2'
  );

  // Fix 2: Missing closing before catch - alternate pattern
  // Pattern: });\n     \n      return response;\n  } catch
  content = content.replace(
    /(}\);)\s*\n\s+\n\s+(return [^;]+;)\s*\n\s+(} catch)/g,
    '$1\n\n    $2\n  $3'
  );

  // Fix 3: Extra } before code blocks
  // Pattern: }\n\n    // Check if workspace...\n    const
  content = content.replace(
    /(\s+}\s*\n\s*\n\s+\/\/ Check if [^\n]+\n\s+const )/g,
    function(match, group) {
      // Remove the extra } if it's before a comment and const
      return group.replace(/}\s*\n\s*\n/, '\n\n');
    }
  );

  // Fix 4: Missing } before catch at end of requireAuth wrapper
  // Pattern: );\n  } catch (error: any) {\n... \n  }\n});
  content = content.replace(
    /(\s+\);)\s*\n\s+(} catch \(error[^{]+\{[\s\S]+?\n\s+}\s*\n}\);)/g,
    function(match, prefix, catchBlock) {
      // Check if we need an extra } before the catch
      return prefix + '\n\n  ' + catchBlock;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Fix all remaining auth files
const files = [
  'services/ash-admin/src/app/api/auth/refresh/route.ts',
  'services/ash-admin/src/app/api/auth/register/route.ts',
  'services/ash-admin/src/app/api/auth/resend-verification/route.ts',
  'services/ash-admin/src/app/api/auth/2fa/verify/route.ts',
  'services/ash-admin/src/app/api/automation/alerts/route.ts',
].map(f => path.join(__dirname, f));

console.log('Fixing remaining auth errors...\n');
let fixed = 0;

files.forEach(file => {
  if (fs.existsSync(file)) {
    if (fixFile(file)) {
      fixed++;
      console.log(`✓ Fixed: ${path.relative(__dirname, file)}`);
    } else {
      console.log(`  Skipped: ${path.relative(__dirname, file)} (no changes needed)`);
    }
  } else {
    console.log(`✗ Not found: ${path.relative(__dirname, file)}`);
  }
});

console.log(`\n✅ DONE: Fixed ${fixed} files`);
