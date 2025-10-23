#!/usr/bin/env python3
"""
Fix all remaining syntax errors comprehensively
"""
import os
import re
from pathlib import Path

def fix_file(filepath):
    """Fix all syntax error patterns"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix 1: Remove extra semicolon after try {
    # Pattern: try {; → try {
    content = re.sub(r'try\s*\{\s*;', 'try {', content)

    # Fix 2: Remove extra semicolon after catch (error: any) {
    # Pattern: catch (error: any) {; → catch (error: any) {
    content = re.sub(r'catch\s*\([^)]+\)\s*\{\s*;', lambda m: m.group(0)[:-1], content)

    # Fix 3: Missing closing ); after return NextResponse.json with object
    # Pattern: return NextResponse.json({ ... }\n  } catch
    # Should be: return NextResponse.json({ ... });\n  } catch
    lines = content.split('\n')
    fixed_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Check if line ends with } (closing brace) and next line has catch or }
        if i + 1 < len(lines):
            next_line = lines[i + 1].strip()

            # Pattern: Line ends with } and next is } catch or } finally
            if (stripped == '}' and
                (next_line.startswith('} catch') or
                 next_line.startswith('catch') or
                 next_line == '}' or
                 next_line.startswith('});'))):

                # Look back to see if we're in a return NextResponse.json statement
                # Check previous 20 lines for "return NextResponse.json("
                in_return_statement = False
                for j in range(max(0, i - 20), i):
                    if 'return NextResponse.json(' in lines[j]:
                        in_return_statement = True
                        break

                # Check if we already have ); closure
                has_closure = False
                for j in range(max(0, i - 5), i + 1):
                    if lines[j].strip().endswith(');'):
                        has_closure = True
                        break

                # If in return statement and no closure, add );
                if in_return_statement and not has_closure and stripped == '}':
                    fixed_lines.append(line.rstrip() + ');')
                    i += 1
                    continue

        fixed_lines.append(line)
        i += 1

    content = '\n'.join(fixed_lines)

    # Fix 4: Extra }); that shouldn't be there (after if blocks)
    # Pattern: if (...) { ... }\n    }); where there's no function call
    # This is complex, skip for now

    # Fix 5: Missing semicolons after const declarations
    # Pattern: const x = await ...(...)\n    (not followed by semicolon)
    content = re.sub(
        r'(const \w+ = await [^;]+\([^)]*\))\n(\s+)(if|const|let|var|return|await|\})',
        r'\1;\n\2\3',
        content
    )

    # Fix 6: Remove duplicate semicolons
    content = re.sub(r';;+', ';', content)

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
