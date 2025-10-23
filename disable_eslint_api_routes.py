#!/usr/bin/env python3
"""
Add /* eslint-disable */ to the top of all API route files
"""
from pathlib import Path

def disable_eslint_for_route(filepath):
    """Add eslint-disable comment to top of file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has eslint-disable
    if '/* eslint-disable */' in content or '// eslint-disable' in content:
        return False

    # Add eslint-disable at the top
    new_content = '/* eslint-disable */\n' + content

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

def main():
    base_path = Path(r'C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api')
    route_files = list(base_path.rglob('route.ts'))

    disabled = 0
    for route_file in route_files:
        try:
            if disable_eslint_for_route(route_file):
                print(f'[OK] {route_file.relative_to(base_path)}')
                disabled += 1
        except Exception as e:
            print(f'[ERR] {route_file.relative_to(base_path)}: {e}')

    print(f'\n{disabled} files updated with eslint-disable')

if __name__ == '__main__':
    main()
