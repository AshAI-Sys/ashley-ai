#!/usr/bin/env python3
"""
Add missing closing parentheses and semicolons to function calls
"""
import os
import re
from pathlib import Path

def fix_missing_closures(filepath):
    """Add missing ); after function calls"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    lines = content.split('\n')
    fixed_lines = []

    i = 0
    while i < len(lines):
        line = lines[i]

        # Check for common patterns that need closing );
        # Pattern 1: Function calls ending with }
        # Examples: logAuthEvent(..., { ... }
        #           prisma.user.findFirst({ ... }
        #           response.cookies.set("...", { ... }

        # If current line ends with } or }) and next line doesn't start with ; or ) or },
        # and the line appears to be a function call, add );
        stripped = line.rstrip()

        if stripped.endswith('}') and not stripped.endswith('});') and not stripped.endswith('})'):
            # Check if this is inside a function call
            # Look back to see if there's an unclosed function call
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()

                # If next line doesn't start with ) or ; or } or catch/finally, this likely needs );
                if next_line and not next_line.startswith(')') and not next_line.startswith(';') and not next_line.startswith('}') and not next_line.startswith('catch') and not next_line.startswith('finally'):
                    # Count braces and parens to determine if we need to close
                    # Look back up to 30 lines to find the opening
                    brace_count = 0
                    paren_count = 0

                    for j in range(max(0, i - 30), i + 1):
                        check_line = lines[j]
                        # Count opening/closing braces and parens
                        for char in check_line:
                            if char == '(':
                                paren_count += 1
                            elif char == ')':
                                paren_count -= 1
                            elif char == '{':
                                brace_count += 1
                            elif char == '}':
                                brace_count -= 1

                    # If we have more opening parens than closing, and braces are balanced, add );
                    if paren_count > 0 and brace_count == 0:
                        fixed_lines.append(line + ');')
                        i += 1
                        continue

        fixed_lines.append(line)
        i += 1

    content = '\n'.join(fixed_lines)

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
            if fix_missing_closures(route_file):
                print(f'[OK] {route_file.relative_to(base_path)}')
                fixed += 1
        except Exception as e:
            print(f'[ERR] {route_file.relative_to(base_path)}: {e}')

    print(f'\n{fixed} files fixed')

if __name__ == '__main__':
    main()
