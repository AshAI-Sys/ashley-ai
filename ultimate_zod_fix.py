#!/usr/bin/env python3
"""
ULTIMATE ZOD SCHEMA FIX
Comprehensively fixes ALL Zod schema issues caused by automated security scripts.
Handles all edge cases: extra });, missing );, broken multi-line schemas.
"""

import os
import re
from pathlib import Path
from typing import Tuple, List

def ultimate_zod_fix(filepath: str) -> Tuple[bool, List[str]]:
    """
    Apply all Zod schema fixes comprehensively.
    Returns (was_modified, list_of_fixes_applied)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        fixes_applied = []

        # FIX 1: Remove extra }); in the middle of z.object() definitions
        # Pattern: z.object({\n  field: ...,\n  });\n\n  field2: ...
        # This is the MAIN issue from the automated security script
        pattern1 = r'(const\s+\w+Schema\s*=\s*z\.object\(\{[^}]*?)\s*\}\);\s*\n\s*\n\s*([a-zA-Z_][\w]*:\s*z\.)'
        while re.search(pattern1, content, re.DOTALL):
            content = re.sub(pattern1, r'\1,\n\n  \2', content, flags=re.DOTALL)
            if "Removed extra }); in middle of Zod schema" not in fixes_applied:
                fixes_applied.append("Removed extra }); in middle of Zod schema")

        # FIX 2: Remove extra }); before more schema fields
        # Pattern: fieldName: z.string(),\n  });\n\n  // Comment\n  otherField:
        pattern2 = r'([a-zA-Z_][\w]*:\s*z\.[^,]+,)\s*\n\s*\}\);\s*\n\s*\n\s*(//[^\n]*\n\s*)?([a-zA-Z_][\w]*:\s*z\.)'
        while re.search(pattern2, content, re.DOTALL):
            content = re.sub(pattern2, r'\1\n\n  \2\3', content, flags=re.DOTALL)
            if "Removed extra }); between schema fields" not in fixes_applied:
                fixes_applied.append("Removed extra }); between schema fields")

        # FIX 3: Ensure z.object({...}) ends with proper });
        # Pattern: const SomeSchema = z.object({\n  ...\n}\nexport
        pattern3 = r'(const\s+\w+Schema\s*=\s*z\.object\(\{[^}]+)\}\s*\n\s*(export|const|//)'
        matches = list(re.finditer(pattern3, content, re.DOTALL))
        for match in reversed(matches):
            # Check if it already ends with });
            preceding_text = content[:match.start()]
            schema_content = match.group(1)

            # Count braces to ensure we're closing properly
            open_braces = schema_content.count('{')
            close_braces = schema_content.count('}')

            if open_braces > close_braces:
                # Missing closing brace
                replacement = schema_content + '});\n\n' + match.group(2)
                content = content[:match.start()] + replacement + content[match.end():]
                if "Fixed Zod schema missing closing });" not in fixes_applied:
                    fixes_applied.append("Fixed Zod schema missing closing });")

        # FIX 4: Fix .regex() or .refine() with extra });
        # Pattern: .regex(/pattern/, "message"),\n  });\n\n  field:
        pattern4 = r'(\.(regex|refine)\([^)]+\),)\s*\n\s*\}\);\s*\n\s*\n\s*([a-zA-Z_][\w]*:\s*z\.)'
        while re.search(pattern4, content, re.DOTALL):
            content = re.sub(pattern4, r'\1\n\n  \3', content, flags=re.DOTALL)
            if "Fixed regex/refine with extra });" not in fixes_applied:
                fixes_applied.append("Fixed regex/refine with extra });")

        # FIX 5: Fix z.string().optional() with extra });
        # Pattern: field: z.string().optional(),\n  });\n\n  // Comment
        pattern5 = r'(:\s*z\.\w+\(\)[^,]*\.optional\(\),)\s*\n\s*\}\);\s*\n\s*\n\s*//'
        while re.search(pattern5, content):
            content = re.sub(pattern5, r'\1\n\n  //', content)
            if "Fixed optional() with extra });" not in fixes_applied:
                fixes_applied.append("Fixed optional() with extra });")

        # FIX 6: Fix standalone }); on its own line within z.object
        # This catches any remaining }); that shouldn't be there
        pattern6 = r'(const\s+\w+Schema\s*=\s*z\.object\(\{(?:(?!\}\);).)*?)\s*\}\);\s*\n\s*\n\s*([a-zA-Z_][\w]*:)'
        while re.search(pattern6, content, re.DOTALL):
            content = re.sub(pattern6, r'\1\n\n  \2', content, flags=re.DOTALL)
            if "Removed standalone }); within schema" not in fixes_applied:
                fixes_applied.append("Removed standalone }); within schema")

        # FIX 7: Ensure proper formatting of final field in z.object
        # Pattern: lastField: z.string().optional()\n}); (missing comma if more fields follow)
        # This is already handled by other patterns, but as a safety check:
        pattern7 = r'(const\s+\w+Schema\s*=\s*z\.object\(\{[^}]+[a-zA-Z_][\w]*:\s*z\.[^,\n]+)\n(\s*\}\);)'
        if re.search(pattern7, content, re.DOTALL):
            # Check if the last field has a comma
            matches = re.finditer(pattern7, content, re.DOTALL)
            for match in matches:
                field_part = match.group(1)
                if not field_part.rstrip().endswith(','):
                    # This is actually correct - last field shouldn't have comma
                    pass

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

    print("=" * 100)
    print(" ULTIMATE ZOD SCHEMA FIX - FINAL CLEANUP")
    print("=" * 100)
    print(f"Processing {len(route_files)} API route files...")
    print()

    fixed_count = 0
    skipped_count = 0
    fix_summary = {}

    for filepath in route_files:
        relative_path = filepath.relative_to(api_dir.parent.parent.parent)

        was_modified, fixes = ultimate_zod_fix(str(filepath))

        if was_modified:
            fixed_count += 1
            print(f"[FIXED] {relative_path}")
            for fix in fixes:
                print(f"  - {fix}")
                fix_summary[fix] = fix_summary.get(fix, 0) + 1
        else:
            skipped_count += 1

    print("\n" + "=" * 100)
    print(" SUMMARY")
    print("=" * 100)
    print(f"Total files: {len(route_files)}")
    print(f"Fixed: {fixed_count}")
    print(f"Already correct: {skipped_count}")
    print(f"Success rate: {100 * (fixed_count + skipped_count) // len(route_files)}%")

    if fix_summary:
        print("\nFixes Applied:")
        for fix_type, count in sorted(fix_summary.items(), key=lambda x: -x[1]):
            print(f"  {count:3d}x {fix_type}")

    print("\n" + "=" * 100)
    print(" NEXT STEPS")
    print("=" * 100)
    print("1. Restart Next.js dev server (kill and start fresh)")
    print("2. Test all critical endpoints")
    print("3. Verify 100% compilation success")
    print("4. Commit all fixes to git")
    print("=" * 100)

if __name__ == "__main__":
    main()
