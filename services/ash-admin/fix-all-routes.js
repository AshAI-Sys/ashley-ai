const fs = require('fs');
const path = require('path');

let fixed = 0;
let errors = 0;

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const apiDir = path.join(__dirname, 'src', 'app', 'api');
const files = getAllFiles(apiDir);

console.log(`🔧 Fixing ${files.length} TypeScript files...`);

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Fix pattern: `  });` at end of file should be `  }\n});`
    // Match catch blocks ending with `  });`
    content = content.replace(
      /( {2}} catch \([^)]+\) \{[\s\S]+? {4}\);\n {2}}\);)$/gm,
      (match) => match.replace(/ {2}}\);$/, '  }\n});')
    );

    // Fix pattern: missing } before });
    content = content.replace(/(\n {4}\);\n {2}}\);)/g, '\n    );\n  }\n});');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      fixed++;
      console.log(`✅ Fixed: ${path.basename(file)}`);
    }
  } catch (err) {
    console.error(`❌ Error fixing ${path.basename(file)}:`, err.message);
    errors++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`  Fixed: ${fixed} files`);
console.log(`  Errors: ${errors} files`);
console.log(`\n🚀 Now run: pnpm build`);
