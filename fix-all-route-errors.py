#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Directory containing route files
api_dir = Path("C:/Users/Khell/Desktop/Ashley AI/services/ash-admin/src/app/api")

# Find all route.ts files
route_files = list(api_dir.rglob("route.ts"))

print(f"Found {len(route_files)} route.ts files\n")

files_fixed = 0
total_fixes = 0

for file_path in route_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    fixes_in_file = 0

    # Fix 1: Missing }); before } catch
    content = re.sub(r'(\s+)\}\s+(} catch \()', r'\1  });\1\2', content)

    # Fix 2: Missing }); after return NextResponse.json({ ... })
    content = re.sub(r'(return NextResponse\.json\(\{[^}]+\},?\s*\n\s*)\}(\s+} catch)', r'\1});\2', content)

    # Fix 3: Missing } after throw statement in if blocks
    content = re.sub(r'(throw [^;]+;)\s*\n\s*\n\s*(//|const |if |return |async )', r'\1\n  }\n\n  \2', content)

    # Fix 4: Missing }); before export const (missing requireAuth closure)
    content = re.sub(r'(\s+)\}\s+\}\s+(export const (GET|POST|PUT|DELETE|PATCH))', r'\1  });\1});\1\1\2', content)

    # Fix 5: Missing }); after Prisma create/update before next line
    content = re.sub(r'(\s+)\},\s+\}\s+(//|const|if|return|await)', r'\1    });\1  }\1\1\2', content)

    # Fix 6: Missing }); after forEach
    content = re.sub(r'(\s+)\}\);\s+\n\s+(return )', r'\1  });\1\1  \2', content)

    # Fix 7: Missing });} at end of requireAuth wrapper
    content = re.sub(r'(\s+throw error;)\s+\}\s+\}\s+\n\s*(async function)', r'\1\1  }\1});\1\1\2', content)

    # Fix 8: Extra }); at very end of file
    content = re.sub(r'\}\s*\}\)\;?\s*$', '});', content)

    # Fix 9: Missing }); after prisma queries in specific patterns
    content = re.sub(r'(\s+\}\s*\)\s*;)\s*\n\s*\n\s*(if |return |const )', r'\1\n\n  \2', content)

    # Count fixes
    if content != original:
        fixes_in_file = len([m for m in re.finditer(r'\}\);', content)]) - len([m for m in re.finditer(r'\}\);', original)])

        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)

        files_fixed += 1
        total_fixes += abs(fixes_in_file)

        rel_path = file_path.relative_to(Path("C:/Users/Khell/Desktop/Ashley AI"))
        print(f"✓ Fixed: {rel_path}")

print(f"\n=== Summary ===")
print(f"Files fixed: {files_fixed}")
print(f"Total estimated fixes: {total_fixes}")
print(f"Files scanned: {len(route_files)}")
