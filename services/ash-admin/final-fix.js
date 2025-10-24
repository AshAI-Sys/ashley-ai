const fs = require('fs');

console.log('🔧 FINAL FIX - 5 FILES');

const fixes = [
  {
    file: 'src/app/api/automation/stats/route.ts',
    replacements: [
      { from: /(\n  }\n}\n)$/, to: '\n  }\n});\n' }
    ]
  },
  {
    file: 'src/app/api/automation/templates/route.ts',
    replacements: [
      { from: /(\n  }\n}\);\n\n\/\/ PUT)/, to: '\n  }\n});\n\n// PUT' }
    ]
  },
  {
    file: 'src/app/api/backups/route.ts',
    replacements: [
      { from: /(\n  }\);\n$)/, to: '\n  }\n});\n' }
    ]
  },
  {
    file: 'src/app/api/brands/route.ts',
    replacements: [
      { from: /(\n  }\);\n$)/, to: '\n  }\n});\n' }
    ]
  },
  {
    file: 'src/app/api/clients/[id]/brands/[brandId]/route.ts',
    replacements: [
      { from: /(message: "Brand updated successfully",\n  } catch)/, to: 'message: "Brand updated successfully",\n    });\n  } catch' }
    ]
  }
];

fixes.forEach(({ file, replacements }) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ ${file}`);
    } else {
      console.log(`⏭️  ${file} - no match`);
    }
  } catch (err) {
    console.error(`❌ ${file}:`, err.message);
  }
});

console.log('\n🚀 NOW RUN: pnpm build');
