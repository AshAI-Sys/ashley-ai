#!/usr/bin/env python3
import os
import re

root = r"c:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api"

# Files that need simple closing brace fixes
files_needing_brace = [
    "ai/bottleneck/route.ts",
    "ai-chat/conversations/[id]/route.ts",
    "analytics/profit/route.ts",
    "automation/templates/route.ts",
    "designs/route.ts",
    "permissions/route.ts",
    "pod/route.ts",
    "quality-control/analytics/spc/route.ts",
]

fixed = 0

for file in files_needing_brace:
    filepath = os.path.join(root, file)
    if not os.path.exists(filepath):
        print(f"Not found: {file}")
        continue

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Add });\n at the end if not present
        if not content.rstrip().endswith("});"):
            content = content.rstrip() + "\n});\n"

        if content != original:
            with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            print(f"Fixed: {file}")
            fixed += 1
    except Exception as e:
        print(f"Error fixing {file}: {e}")

print(f"\nFixed {fixed} files")
