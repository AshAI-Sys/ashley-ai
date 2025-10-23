#!/usr/bin/env python3
"""
Fix Zod Schema Definitions
Fixes missing closing ); in z.object({...}) schemas
"""

import os
import re
from pathlib import Path
from typing import List, Tuple

def fix_zod_schemas(filepath: str) -> Tuple[bool, List[str]]:
    """
    Fix Zod schema definitions missing closing );
    Returns (was_modified, list_of_fixes_applied)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        fixes_applied = []

        # Fix 1: z.object({...}) missing closing );
        # Pattern: const SomeSchema = z.object({\n  ...\n}\n\nexport
        # Should be: const SomeSchema = z.object({\n  ...\n});\n\nexport
        pattern1 = r'(const\s+\w+Schema\s*=\s*z\.object\(\{[^}]+\})\s*\n\s*\n\s*(export|const|//)'
        matches = list(re.finditer(pattern1, content, re.DOTALL))
        if matches:
            for match in reversed(matches):  # Reverse to preserve positions
                if not match.group(1).endswith(');'):
                    content = content[:match.end(1)] + ');\n\n' + match.group(2) + content[match.end(2):]
                    fixes_applied.append(f"Fixed Zod schema missing closing );")

        # Fix 2: Transaction callback missing closing });
        # Pattern: return { workspace, user };\n\nconst { workspace, user } = result;
        # Should be: return { workspace, user };\n});\n\nconst { workspace, user } = result;
        pattern2 = r'(return\s*\{[^}]+\};)\s*\n\s*\n\s*(const\s*\{[^}]+\}\s*=\s*result;)'
        if re.search(pattern2, content):
            content = re.sub(pattern2, r'\1\n});\n\n\2', content)
            fixes_applied.append("Fixed transaction callback missing closing });")

        # Fix 3: Function calls missing closing );
        # Pattern: await someFunction(...{\n  ...\n}\n\nconst
        pattern3 = r'(await\s+\w+\([^)]+\{[^}]+\})\s*\n\s*\n\s*(const|console|return)'
        matches3 = list(re.finditer(pattern3, content, re.DOTALL))
        if matches3:
            for match in reversed(matches3):
                if not match.group(1).endswith(');'):
                    content = content[:match.end(1)] + ');\n\n' + match.group(2) + content[match.end(2):]
                    fixes_applied.append("Fixed function call missing closing );")

        # Fix 4: Console.log calls missing closing );
        # Pattern: console.log(...{\n  ...\n  });
        # The issue is extra }); instead of just );
        pattern4 = r'(console\.log\([^)]+\{[^}]+\})\s*\);'
        if re.search(pattern4, content, re.DOTALL):
            content = re.sub(pattern4, r'\1);', content, flags=re.DOTALL)
            fixes_applied.append("Fixed console.log closing);")

        # Save if modified
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, fixes_applied

        return False, []

    except Exception as e:
        print(f"[ERROR] {filepath}: {e}")
        return False, []

def main():
    # Find all API route files
    api_dir = Path(r"C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api")
    route_files = list(api_dir.rglob("route.ts"))

    print(f"Scanning {len(route_files)} route files for Zod schema issues...")
    print("=" * 80)

    fixed_count = 0
    skipped_count = 0
    fix_summary = {}

    for filepath in route_files:
        relative_path = filepath.relative_to(api_dir.parent.parent.parent)

        was_modified, fixes = fix_zod_schemas(str(filepath))

        if was_modified:
            fixed_count += 1
            print(f"[FIXED] {relative_path}")
            for fix in fixes:
                print(f"  - {fix}")
                fix_summary[fix] = fix_summary.get(fix, 0) + 1
        else:
            skipped_count += 1

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total files: {len(route_files)}")
    print(f"Fixed: {fixed_count}")
    print(f"Already correct: {skipped_count}")

    if fix_summary:
        print("\nFixes Applied:")
        for fix_type, count in sorted(fix_summary.items(), key=lambda x: -x[1]):
            print(f"  {count:3d}x {fix_type}")

    print("=" * 80)

if __name__ == "__main__":
    main()
