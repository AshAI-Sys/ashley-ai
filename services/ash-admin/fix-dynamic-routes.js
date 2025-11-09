const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all route.ts files
const routes = glob.sync('src/app/api/**/route.ts', { cwd: process.cwd() });

console.log(`Found ${routes.length} API routes`);

let fixed = 0;

routes.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if already has dynamic export
  if (content.includes("export const dynamic")) {
    return; // Skip if already configured
  }
  
  // Add dynamic export after imports
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find last import or first export
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertIndex = i + 1;
    }
    if (lines[i].trim().startsWith('export ')) {
      break;
    }
  }
  
  // Insert dynamic export
  lines.splice(insertIndex, 0, '', "export const dynamic = 'force-dynamic';", '');
  
  fs.writeFileSync(fullPath, lines.join('\n'));
  fixed++;
  console.log(`Fixed: ${file}`);
});

console.log(`\n✅ Fixed ${fixed} routes`);
