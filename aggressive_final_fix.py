#!/usr/bin/env python3
"""
Aggressive final fix - handle all remaining patterns
"""
import re
from pathlib import Path

def aggressive_fix(filepath):
    """Aggressively fix all syntax issues"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    original = ''.join(lines)
    fixed_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Pattern 1: Extra }); in the middle of the function (not at the end)
        if stripped == '});' and i + 2 < len(lines):
            # Check if there's more code after (within next 5 lines)
            has_code_after = False
            for j in range(i + 1, min(i + 6, len(lines))):
                if lines[j].strip() and not lines[j].strip().startswith('//'):
                    has_code_after = True
                    break

            # If there's code after, this is likely a misplaced });
            if has_code_after:
                # Check next line - if it's a return/const/await, skip this });
                next_stripped = lines[i + 1].strip()
                if (next_stripped.startswith('return') or
                    next_stripped.startswith('const') or
                    next_stripped.startswith('await') or
                    next_stripped.startswith('if') or
                    next_stripped == ''):
                    # Skip this line (remove extra });)
                    i += 1
                    continue

        fixed_lines.append(line)
        i += 1

    content = ''.join(fixed_lines)

    # Pattern 2: Conditional spread with extra semicolon or wrong syntax
    # { field }); → { field }
    # { field });), → { field }),
    content = re.sub(r'\{\s*(\w+):\s*(\w+)\s*\};?\s*\),', r'{ \1: \2 }),', content)
    content = re.sub(r'\{\s*(\w+)\s*\};?\s*\),', r'{ \1 }),', content)

    # Pattern 3: Missing closing ); for NextResponse.json
    # Look for return NextResponse.json followed by } without );
    content = re.sub(
        r'(return NextResponse\.json\([^)]+\),\s*\{\s*status:\s*\d+\s*\})\s*\n\s*\)\s*;',
        r'\1);',
        content,
        flags=re.MULTILINE
    )

    # Pattern 4: Double closing after catch blocks
    # } catch\n    }); → just } catch
    # Remove }); before } catch
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    while i < len(lines):
        if i + 1 < len(lines) and lines[i].strip() == '});' and '} catch' in lines[i + 1]:
            # Skip this });
            i += 1
            continue
        fixed_lines.append(lines[i])
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
            if aggressive_fix(route_file):
                print(f'[OK] {route_file.relative_to(base_path)}')
                fixed += 1
        except Exception as e:
            print(f'[ERR] {route_file.relative_to(base_path)}: {e}')

    print(f'\n{fixed} files fixed')

if __name__ == '__main__':
    main()
