#!/usr/bin/env python3
"""
Simple fix for missing closing parentheses
"""
import os
import re
from pathlib import Path

def fix_file(filepath):
    """Add missing ); where needed"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern: } followed by newline and then non-) character
    # This catches function calls that need ); added
    # Example: logAuthEvent(..., { ... }\n\n  return ...
    # Should be: logAuthEvent(..., { ... });\n\n  return ...

    # Fix function calls missing );
    # Pattern: }\n followed by whitespace and then a keyword/statement (not ) or ; or })
    content = re.sub(
        r'(\s*)\}\n(\s*)(return|await|const|let|var|if|for|while|switch|case|throw|authLogger|\/\/)',
        r'\1});\n\2\3',
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
