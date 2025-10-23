#!/usr/bin/env python3
"""
Fix missing }); after function calls like logAuthEvent, prisma calls, etc.
"""
import re
from pathlib import Path

def fix_missing_closures(filepath):
    """Fix missing }); closures"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    original = ''.join(lines)
    fixed_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Pattern: Line ends with a field name followed by comma, then blank line, then 'return' or 'if' or 'const'
        # This usually means a function call object is not closed
        # Examples:
        #   reason: "...",
        #
        #   return ...
        #
        # Should be:
        #   reason: "...",
        # });
        #
        #   return ...

        if i + 1 < len(lines) and i + 2 < len(lines):
            next_line = lines[i + 1].strip()
            next_next_line = lines[i + 2].strip()

            # Check if current line ends with a comma or closing brace
            if (stripped.endswith(',') or stripped.endswith('}')) and next_line == '':
                # Check if line after blank is a statement (return, if, const, await, //)
                if (next_next_line.startswith('return') or
                    next_next_line.startswith('if') or
                    next_next_line.startswith('const') or
                    next_next_line.startswith('let') or
                    next_next_line.startswith('await') or
                    next_next_line.startswith('//')):

                    # Look back to see if there's an unclosed function call
                    # Check previous 30 lines for patterns like:
                    # - await logAuthEvent(..., {
                    # - await prisma.xxx.yyy({
                    # - await createSession(
                    has_unclosed_call = False
                    paren_count = 0
                    brace_count = 0

                    for j in range(max(0, i - 30), i + 1):
                        check_line = lines[j]
                        # Count braces and parens
                        paren_count += check_line.count('(') - check_line.count(')')
                        brace_count += check_line.count('{') - check_line.count('}')

                    # If we have unclosed parens/braces, add });
                    if paren_count > 0 or brace_count > 0:
                        fixed_lines.append(line)
                        fixed_lines.append('      });\n')  # Add closing
                        fixed_lines.append(lines[i + 1])  # Add blank line
                        i += 2  # Skip the blank line
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
