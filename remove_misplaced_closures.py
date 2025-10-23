#!/usr/bin/env python3
"""
Remove misplaced }); after return statements
"""
import os
import re
from pathlib import Path

def fix_file(filepath):
    """Remove misplaced }); that appear after return NextResponse.json statements"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern: return NextResponse.json(...); followed by }); on next line
    # This is wrong - should just be }
    # Example:
    #   return NextResponse.json(
    #     { error: "..." },
    #     { status: 400 }
    #   );
    # });  <-- This is wrong, should be just }

    # Fix: Replace );[\s\n]*\}\); with );\n}
    content = re.sub(
        r'\);\s*\n\s*\}\);',
        ');\n    }',
        content
    )

    # Also fix: { status: XXX }\n);  }); -> { status: XXX }\n);  }
    content = re.sub(
        r'(\{ status: \d+ \})\s*\n\s*\);\s*\n\s*\}\);',
        r'\1\n      );\n    }',
        content
    )

    # Write back if changed
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    base_path = Path(r'C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api')
    route_files = list(base_path.rglob('route.ts'))

    fixed = 0
    for route_file in route_files:
        try:
            if fix_file(route_file):
                print(f'[OK] {route_file.relative_to(base_path)}')
                fixed += 1
        except Exception as e:
            print(f'[ERR] {route_file.relative_to(base_path)}: {e}')

    print(f'\n{fixed} files fixed')

if __name__ == '__main__':
    main()
