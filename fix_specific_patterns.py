#!/usr/bin/env python3
"""
Fix specific error patterns found in manual review
"""
import os
import re
from pathlib import Path

def fix_file(filepath):
    """Fix specific syntax error patterns"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix 1: const [...] =; await → const [...] = await
    # Pattern: =;\n      await → = await
    content = re.sub(r'=\s*;\s*\n\s*await', '= await', content)

    # Fix 2: Conditional spread with extra semicolon
    # Pattern: { field });), → { field }),
    content = re.sub(r'\{\s*(\w+)\s*\}\);?\s*\),', r'{ \1 }),', content)

    # Fix 3: Extra }); after if blocks that shouldn't close anything
    # Pattern: if (...) { ... }\n    }); with no requireAuth/function above
    lines = content.split('\n')
    fixed_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Check for extra }); that appears alone and shouldn't be there
        if stripped == '});' and i > 0:
            # Check if this is the final closure for requireAuth
            # Look for export const METHOD = requireAuth in previous lines
            is_final_closure = False
            for j in range(max(0, i - 100), i):
                if 'export const' in lines[j] and 'requireAuth' in lines[j]:
                    # Check if there's already a }); between that line and this one
                    has_other_closure = False
                    for k in range(j + 1, i):
                        if lines[k].strip() == '});':
                            has_other_closure = True
                            break
                    if not has_other_closure:
                        is_final_closure = True
                        break

            # If not final closure and next line is empty or has minimal content
            if not is_final_closure and i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                # If next line is return or another statement, this }); is wrong
                if next_line.startswith('return') or next_line.startswith('const') or next_line.startswith('await'):
                    # Skip this line (remove the extra });)
                    i += 1
                    continue

        fixed_lines.append(line)
        i += 1

    content = '\n'.join(fixed_lines)

    # Fix 4: Missing closing ); after data objects in prisma calls
    # Pattern: },\n      }\n    });  should have ); after first }
    # This is complex, using regex:
    # data: { ... },\n      }\n    }); → data: { ... },\n      });\n    });

    # Actually let's be more specific about pattern in conditional spreads:
    # ...(condition && { field });\n should be ...(condition && { field }),\n
    content = re.sub(
        r'\.\.\.\([^)]+&&\s*\{\s*\w+:\s*\w+\s*\}\s*\);',
        lambda m: m.group(0).replace('});', '},'),
        content
    )

    # Fix 5: Remove line breaks in const declarations with Promise.all
    # const [a, b] =\n      await → const [a, b] =\n      await (no change, but ensure semicolon)
    # This is already handled by Fix 1

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
