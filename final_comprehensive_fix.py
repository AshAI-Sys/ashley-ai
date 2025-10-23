#!/usr/bin/env python3
"""
Final comprehensive fix for all remaining syntax errors
"""
import os
import re
from pathlib import Path

def fix_file(filepath):
    """Fix remaining syntax errors"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    original = ''.join(lines)
    fixed_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Fix 1: Prisma/database calls missing );
        # Pattern: .create({ ... }\n      } without );
        # Pattern: .findMany({ ... }\n      } without );
        # Pattern: .update({ ... }\n      } without );
        if i + 1 < len(lines):
            next_line = lines[i + 1].strip()

            # If current line ends with } and next line starts with } (closing nested objects)
            # and this is inside a Prisma call, add );
            if (stripped.endswith('}') and not stripped.endswith('});') and not stripped.endswith('})')
                and next_line.startswith('}') and not next_line.startswith('});')):

                # Check if we're in a Prisma call by looking back
                in_prisma_call = False
                for j in range(max(0, i - 20), i):
                    if 'prisma.' in lines[j] or '.create(' in lines[j] or '.update(' in lines[j] or '.findMany(' in lines[j] or '.findFirst(' in lines[j]:
                        in_prisma_call = True
                        break

                if in_prisma_call:
                    fixed_lines.append(line.rstrip() + ');\n')
                    i += 1
                    continue

        fixed_lines.append(line)
        i += 1

    content = ''.join(fixed_lines)

    # Fix 2: Missing semicolons after variable declarations with conditional spread
    # Pattern: const variable = ...\n without semicolon before next statement
    content = re.sub(
        r'(const \w+ = [^;]+)\n(\s*)(const|let|var|if|return|await)',
        r'\1;\n\2\3',
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
