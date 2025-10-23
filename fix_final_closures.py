#!/usr/bin/env python3
"""
Fix Missing Final Closures
Ensures all route files end with proper }); to close requireAuth/withErrorHandling wrappers
"""

import os
import re
from pathlib import Path
from typing import Tuple, List

def fix_final_closure(filepath: str) -> Tuple[bool, str]:
    """
    Fix missing final }); closure for wrapper functions
    Returns (was_modified, fix_description)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        fix_desc = None

        # Remove trailing whitespace and newlines
        content_stripped = content.rstrip()

        # Check if file ends with });
        if content_stripped.endswith('});'):
            return False, None  # Already correct

        # Pattern 1: File ends with }); but missing newline
        if content_stripped.endswith('}):'):
            content = content_stripped + ';\n'
            fix_desc = "Added missing semicolon and newline"

        # Pattern 2: File ends with ); but needs })
        elif content_stripped.endswith(');'):
            # Check if this is inside createSuccessResponse or similar
            # Look at last 10 lines to understand context
            lines = content_stripped.split('\n')
            last_lines = lines[-10:]

            # Check if we're inside a return statement
            has_return = any('return' in line for line in last_lines)
            has_create_success = any('createSuccessResponse' in line or 'NextResponse.json' in line for line in last_lines)

            if has_return and has_create_success:
                # This is a return statement, needs });
                content = content_stripped + '\n});\n'
                fix_desc = "Added missing }); closure for wrapper function"

        # Pattern 3: File ends with } but needs });
        elif content_stripped.endswith('}'):
            # Check last 20 lines for context
            lines = content_stripped.split('\n')
            last_lines = lines[-20:]

            # Check if this looks like end of try-catch block
            has_try_catch = any('catch' in line and 'error' in line for line in last_lines)

            if has_try_catch:
                # This is end of catch block, needs })
                content = content_stripped + '\n});\n'
                fix_desc = "Added missing }); closure for wrapper function after catch block"

        # Pattern 4: File ends with unexpected closure like } ) or } ;
        elif re.search(r'\}\s*\)\s*$', content_stripped) or re.search(r'\}\s*;\s*$', content_stripped):
            content = content_stripped + '\n});\n'
            fix_desc = "Fixed malformed closure and added proper });"

        # Save if modified
        if content != original_content and fix_desc:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, fix_desc

        return False, None

    except Exception as e:
        print(f"[ERROR] {filepath}: {e}")
        return False, None

def main():
    # Find all API route files
    api_dir = Path(r"C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api")
    route_files = list(api_dir.rglob("route.ts"))

    print(f"Checking {len(route_files)} route files for missing final closures...")
    print("=" * 80)

    fixed_count = 0
    skipped_count = 0
    fix_summary = {}

    for filepath in route_files:
        relative_path = filepath.relative_to(api_dir.parent.parent.parent)

        was_modified, fix_desc = fix_final_closure(str(filepath))

        if was_modified:
            fixed_count += 1
            print(f"[FIXED] {relative_path}")
            print(f"  - {fix_desc}")
            fix_summary[fix_desc] = fix_summary.get(fix_desc, 0) + 1
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
