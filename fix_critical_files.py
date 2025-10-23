#!/usr/bin/env python3
"""
Fix remaining critical auth, finance, orders, dashboard files
"""
import re
from pathlib import Path

def fix_critical_file(filepath):
    """Fix specific patterns in critical files"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix 1: Missing ); after z.object({ ... }
    # Pattern: z.object({ ... }\n\nexport
    content = re.sub(
        r'(z\.object\(\{[^}]+\}\))\s*\n\s*\n\s*(export)',
        r'\1);\n\n\2',
        content
    )

    # Fix 2: Extra }); should be }); in prisma calls
    # Pattern: prisma.xxx.findFirst({ ... });
    content = re.sub(
        r'(prisma\.\w+\.\w+\(\{[^}]+\})\s*\}\);',
        r'\1});',
        content
    )

    # Fix 3: Missing closing } for if blocks before other statements
    # Pattern: { status: 429 }\n        );\n      }\n\n    // Generate
    content = re.sub(
        r'(\{ status: \d+ \}\s*\n\s*\);)\s*\n\s*\}\s*\n\s*\n\s*(//[^\n]*\n\s*const)',
        r'\1\n      }\n\n    \2',
        content
    )

    # Fix 4: Missing closing ); for sendPasswordResetEmail
    # Pattern: reset_link: resetUrl,\n      }\n      console.log
    content = re.sub(
        r'(reset_link: [^,]+,)\s*\n\s*\}\s*\n\s*(console\.log)',
        r'\1\n      });\n      \2',
        content
    )

    # Fix 5: Missing final }); for requireAuth wrapper
    # Check if file ends with }; instead of });
    if content.rstrip().endswith('});'):
        pass  # Already correct
    elif content.rstrip().endswith('};'):
        # Replace final }; with });
        content = content.rstrip()[:-2] + '});' + content[len(content.rstrip()):]

    # Fix 6: userOrResponse pattern in logout
    # const userOrResponse = ... missing await before requireAuth
    content = re.sub(
        r'const userOrResponse = requireAuth\(request\);',
        r'const userOrResponse = await requireAuth(request);',
        content
    )

    # Fix 7: Missing closing for try-catch in various patterns
    # Look for specific problem patterns

    # Write back if changed
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    base_path = Path(r'C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api')

    # Critical files to fix
    critical_paths = [
        'auth/**/route.ts',
        'finance/**/route.ts',
        'orders/**/route.ts',
        'dashboard/**/route.ts',
    ]

    fixed = 0
    for pattern in critical_paths:
        for route_file in base_path.glob(pattern):
            try:
                if fix_critical_file(route_file):
                    print(f'[OK] {route_file.relative_to(base_path)}')
                    fixed += 1
            except Exception as e:
                print(f'[ERR] {route_file.relative_to(base_path)}: {e}')

    print(f'\n{fixed} files fixed')

if __name__ == '__main__':
    main()
