#!/usr/bin/env python3
"""
Comprehensive API Route Syntax Fixer
Fixes all syntax errors introduced by the automated security scripts.
Based on patterns from health/route.ts and dashboard/stats/route.ts
"""

import os
import re
from pathlib import Path
from typing import List, Tuple

def fix_route_syntax(filepath: str) -> Tuple[bool, List[str]]:
    """
    Fix all syntax errors in a route file.
    Returns (was_modified, list_of_fixes_applied)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        fixes_applied = []

        # Fix 1: Remove extra semicolon in function declarations
        # Pattern: async (request: NextRequest) => {;
        pattern1 = r'(async\s+\([^)]+\)\s*=>\s*\{);'
        if re.search(pattern1, content):
            content = re.sub(pattern1, r'\1', content)
            fixes_applied.append("Removed extra semicolon in function declaration")

        # Fix 2: Extra }); in Promise.all arrays between items
        # Pattern: }),\n      });\n\n      // Comment
        # Should be: }),\n\n      // Comment
        pattern2 = r'\}\),\s*\n\s*\}\);\s*\n\s*\n\s*(//.+)'
        if re.search(pattern2, content):
            content = re.sub(pattern2, r'}),\n\n      \1', content)
            fixes_applied.append("Fixed extra }); in Promise.all array")

        # Fix 3: Extra }); after prisma calls before blank lines
        # Pattern: }),\n      });\n\n      prisma
        pattern3 = r'(\}\),)\s*\n\s*\}\);\s*\n\s*\n\s*(prisma|await|const|if|return)'
        if re.search(pattern3, content):
            content = re.sub(pattern3, r'\1\n\n      \2', content)
            fixes_applied.append("Removed standalone }); before statements")

        # Fix 4: Extra }); after await prisma calls
        # Pattern: await prisma.*.count({\n  ...\n});\n});
        pattern4 = r'(await\s+prisma\.\w+\.\w+\([^)]+\{[^}]+\},\s*\n\s*\}\),)\s*\n\s*\}\);'
        if re.search(pattern4, content, re.DOTALL):
            content = re.sub(pattern4, r'\1', content, flags=re.DOTALL)
            fixes_applied.append("Removed extra }); after prisma calls")

        # Fix 5: Missing closing brace for try-catch
        # Pattern: { status: 500 }\n    );\n});\n
        # Should be: { status: 500 }\n    );\n  }\n});\n
        pattern5 = r'(\{\s*status:\s*\d+\s*\}\s*\n\s*\);)\s*\n(\}\);)\s*$'
        if re.search(pattern5, content, re.MULTILINE):
            content = re.sub(pattern5, r'\1\n  }\n\2', content, flags=re.MULTILINE)
            fixes_applied.append("Added missing closing brace for try-catch")

        # Fix 6: Extra }); after single prisma queries (not in Promise.all)
        # Pattern: const result = await prisma...});\n      });
        pattern6 = r'(const\s+\w+\s*=\s*await\s+prisma\.\w+\.\w+\([^;]+\}\),)\s*\n\s*\}\);'
        if re.search(pattern6, content, re.DOTALL):
            content = re.sub(pattern6, r'\1', content, flags=re.DOTALL)
            fixes_applied.append("Removed extra }); after const prisma query")

        # Fix 7: Extra }); in object parameters with gte/lte
        # Pattern: where: {\n  field: { gte: value },\n},\n});\n});
        pattern7 = r'(where:\s*\{[^}]+\},\s*\n\s*\}\),)\s*\n\s*\}\);'
        if re.search(pattern7, content, re.DOTALL):
            content = re.sub(pattern7, r'\1', content, flags=re.DOTALL)
            fixes_applied.append("Removed extra }); after where clause")

        # Fix 8: Multiple }); on same line or consecutive lines
        # Pattern: });\n});
        pattern8 = r'\}\);\s*\n\s*\}\);(?!\n\s*\n)'
        if re.search(pattern8, content):
            content = re.sub(pattern8, '});', content)
            fixes_applied.append("Removed duplicate }); closures")

        # Fix 9: Fix if blocks with return statements missing closing brace
        # Pattern: if (condition) {\n  return ...\n  );\n}\n  });\n
        # Should be: if (condition) {\n  return ...\n  );\n}\n
        pattern9 = r'(\)\s*\n\s*\}\s*\n)\s*\}\);(?=\s*\n\s*(//.+|if|const|await|return))'
        if re.search(pattern9, content):
            content = re.sub(pattern9, r'\1', content)
            fixes_applied.append("Removed extra }); after if blocks")

        # Fix 10: Extra }); between Promise.all items and closing ]
        # Pattern: ...\n  }),\n  });\n]);
        pattern10 = r'(\},\n\s*\}\),)\s*\n\s*\}\);\s*\n(\s*\]\);)'
        if re.search(pattern10, content):
            content = re.sub(pattern10, r'\1\n\2', content)
            fixes_applied.append("Removed extra }); before Promise.all closing")

        # Save if modified
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, fixes_applied

        return False, []

    except Exception as e:
        print(f"[ERROR] Failed to process {filepath}: {e}")
        return False, []

def main():
    # Find all API route files
    api_dir = Path(r"C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api")
    route_files = list(api_dir.rglob("route.ts"))

    print(f"Found {len(route_files)} API route files")
    print("=" * 80)

    fixed_count = 0
    skipped_count = 0
    error_count = 0

    fix_summary = {}

    for filepath in route_files:
        relative_path = filepath.relative_to(api_dir.parent.parent.parent)

        was_modified, fixes = fix_route_syntax(str(filepath))

        if was_modified:
            fixed_count += 1
            print(f"[FIXED] {relative_path}")
            for fix in fixes:
                print(f"  - {fix}")
                fix_summary[fix] = fix_summary.get(fix, 0) + 1
        else:
            skipped_count += 1
            # Don't print skipped files to reduce output

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total files: {len(route_files)}")
    print(f"Fixed: {fixed_count}")
    print(f"Already correct: {skipped_count}")
    print(f"Errors: {error_count}")

    if fix_summary:
        print("\nFixes Applied:")
        for fix_type, count in sorted(fix_summary.items(), key=lambda x: -x[1]):
            print(f"  {count:3d}x {fix_type}")

    print("\n" + "=" * 80)
    print("NEXT STEPS:")
    print("1. Restart Next.js dev server")
    print("2. Test critical endpoints")
    print("3. Check for any remaining compilation errors")
    print("=" * 80)

if __name__ == "__main__":
    main()
