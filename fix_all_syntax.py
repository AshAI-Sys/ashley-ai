#!/usr/bin/env python3
"""
Comprehensive syntax fix for all route files
"""
import os
import re
from pathlib import Path

def comprehensive_fix(filepath):
    """Apply all necessary fixes to a route file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    content = ''.join(lines)
    original = content

    # Fix 1: Remove duplicate semicolons
    content = re.sub(r';;+', ';', content)

    # Fix 2: Remove unnecessary semicolons after closing braces
    content = re.sub(r'\};\s*\n\s*\};\s*$', '});\n', content, flags=re.MULTILINE)

    # Fix 3: Ensure all requireAuth wrapped functions end with });
    # Find all export const METHOD = requireAuth patterns
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

    for method in methods:
        # Pattern: export const METHOD = requireAuth(async (...) => {
        # Find where it starts
        pattern = rf'export const {method} = requireAuth\('
        matches = list(re.finditer(pattern, content))

        for match in reversed(matches):  # Process from end to start to maintain positions
            start = match.start()

            # Find the matching closing
            # Count braces to find where the function ends
            brace_count = 0
            paren_count = 0
            in_function = False
            func_start = -1

            for i in range(start, len(content)):
                char = content[i]

                if char == '(':
                    paren_count += 1
                elif char == ')':
                    paren_count -= 1
                elif char == '{' and paren_count == 1:
                    if func_start == -1:
                        func_start = i
                        in_function = True
                    brace_count += 1
                elif char == '}' and in_function:
                    brace_count -= 1
                    if brace_count == 0:
                        # This is the end of the function
                        # Check if we have ); after this
                        remaining = content[i+1:i+10]
                        if not remaining.startswith(');'):
                            # Insert );
                            content = content[:i+1] + ');' + content[i+1:]
                        break

    # Fix 4: Fix incorrect function signatures
    # export async function GET( -> export const GET = requireAuth(async (
    for method in methods:
        pattern = rf'export async function {method}\(\s*request: NextRequest\s*\)'
        if re.search(pattern, content):
            replacement = rf'export const {method} = requireAuth(async (request: NextRequest, user) =>'
            content = re.sub(pattern, replacement, content)
            # Find the end and add );
            # This is handled by Fix 3 above

    # Fix 5: Ensure user parameter exists in all requireAuth calls
    for method in methods:
        # Pattern without user
        pattern1 = rf'export const {method} = requireAuth\(async \(request: NextRequest\) =>'
        replacement1 = rf'export const {method} = requireAuth(async (request: NextRequest, user) =>'
        content = re.sub(pattern1, replacement1, content)

        pattern2 = rf'export const {method} = requireAuth\(async \(req: NextRequest\) =>'
        replacement2 = rf'export const {method} = requireAuth(async (req: NextRequest, user) =>'
        content = re.sub(pattern2, replacement2, content)

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
            if comprehensive_fix(route_file):
                print(f'[OK] {route_file.relative_to(base_path)}')
                fixed += 1
        except Exception as e:
            print(f'[ERR] {route_file.relative_to(base_path)}: {e}')

    print(f'\n{fixed} files fixed')

if __name__ == '__main__':
    main()
