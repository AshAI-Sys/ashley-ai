#!/usr/bin/env python3
"""
Fix remaining ESLint errors systematically
"""
import os
import re
from pathlib import Path

def fix_file(filepath):
    """Fix all common error patterns in a route file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix 1: Remove misplaced closing }); in the middle of functions
    # Pattern: }); followed by more code (not end of file)
    # Look for }); that's NOT at the end and has non-whitespace/comment after
    lines = content.split('\n')
    fixed_lines = []

    for i, line in enumerate(lines):
        # Check if line contains });
        if re.match(r'^\s*\}\);', line):
            # Check if this is near the end of file (within last 3 lines)
            if i >= len(lines) - 3:
                # Keep it - it's the final closure
                fixed_lines.append(line)
            else:
                # Check if next few lines have actual code (not just whitespace/comments)
                has_code_after = False
                for j in range(i+1, min(i+10, len(lines))):
                    next_line = lines[j].strip()
                    if next_line and not next_line.startswith('//') and next_line != '':
                        has_code_after = True
                        break

                if has_code_after:
                    # This is a misplaced });  - replace with just }
                    fixed_lines.append(line.replace('});', '}'))
                else:
                    # Keep it - it's the final closure
                    fixed_lines.append(line)
        else:
            fixed_lines.append(line)

    content = '\n'.join(fixed_lines)

    # Fix 2: Ensure final closing is }); for requireAuth wrapped functions
    # Pattern: export const METHOD = requireAuth(... ends with just }
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

    for method in methods:
        # Check if this file has requireAuth wrapped export
        if f'export const {method} = requireAuth(' in content:
            # Check if it ends with just }; instead of });
            # Find the last occurrence of }; or } at the end
            if content.rstrip().endswith('};'):
                # Replace final }; with });
                content = content.rstrip()[:-2] + '});' + content[len(content.rstrip()):]
            elif content.rstrip().endswith('}'):
                # Add ); after final }
                content = content.rstrip() + ');' + content[len(content.rstrip()):]

    # Fix 3: Fix conditional spread syntax errors
    # Pattern: ...(condition ? {} : { field: value });), should be ...(condition ? {} : { field: value }),
    content = re.sub(r'\.\.\.\([^)]+\s*:\s*\{[^}]+\}\s*\);?\s*\),',
                     lambda m: m.group(0).replace('});),', '}),').replace(');),', '),'),
                     content)

    # Fix 4: Fix unnecessary semicolons after closing braces
    content = re.sub(r'\};;\s*$', '};', content, flags=re.MULTILINE)
    content = re.sub(r';;+', ';', content)

    # Fix 5: Fix try blocks without catch/finally
    # Pattern: try { ... } without catch or finally
    # This is complex, skip for now

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
