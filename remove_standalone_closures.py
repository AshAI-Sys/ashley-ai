#!/usr/bin/env python3
"""
Remove standalone }); lines that appear after if/return blocks
"""
import re
from pathlib import Path

def remove_standalone_closures(filepath):
    """Remove incorrect standalone }); lines"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    original = ''.join(lines)
    fixed_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Check if this is a standalone }); (just whitespace + });)
        if stripped == '});':
            # Check previous line - if it's a closing }, this }); is likely wrong
            if i > 0 and lines[i - 1].strip() == '}':
                # Skip this line (remove the extra });)
                i += 1
                continue
            # Also check if previous line ends with );
            if i > 0 and lines[i - 1].strip().endswith(');'):
                # This }); is likely extra
                i += 1
                continue

        fixed_lines.append(line)
        i += 1

    content = ''.join(fixed_lines)

    # Write back if changed
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    # Start with just the critical auth files
    base_path = Path(r'C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api')

    # Get all route files
    route_files = list(base_path.rglob('route.ts'))

    fixed = 0
    for route_file in route_files:
        try:
            if remove_standalone_closures(route_file):
                print(f'[OK] {route_file.relative_to(base_path)}')
                fixed += 1
        except Exception as e:
            print(f'[ERR] {route_file.relative_to(base_path)}: {e}')

    print(f'\n{fixed} files fixed')

if __name__ == '__main__':
    main()
