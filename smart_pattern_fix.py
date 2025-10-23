#!/usr/bin/env python3
"""
Smart pattern-based fix using lessons from auth/login manual fix
"""
import re
from pathlib import Path

def smart_fix(filepath):
    """Apply smart fixes based on auth/login patterns"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern 1: Missing closing brace after return NextResponse.json(...)
    # Before: { status: 423 }\n      ); // 423 Locked\n\n    // Find user
    # After:  { status: 423 }\n      ); // 423 Locked\n    }\n\n    // Find user
    content = re.sub(
        r'(\{ status: \d+ \}\s*\n\s*\);[^\n]*\n)\s*\n\s*(//[^\n]*\n\s*(?:const|if|await|return))',
        r'\1    }\n\n    \2',
        content
    )

    # Pattern 2: Extra }); in function calls - should be );
    # Before: generateTokenPair({...});
    # After:  generateTokenPair({...});
    # Look for common function patterns
    for func in ['generateTokenPair', 'prisma.user.update', 'prisma.user.findFirst',
                 'prisma.user.create', 'logAuthEvent', 'authLogger.info',
                 'authLogger.error', 'response.cookies.set', 'createSession']:
        # Pattern: function({...});
        content = re.sub(
            rf'({re.escape(func)}\([^)]+\{{[^}}]+\}}\s*)\}}\);',
            r'\1});',
            content
        )

    # Pattern 3: Missing closing brace for if blocks before comments
    # Before: errorMessage += "...";   \n\n      return NextResponse
    # After:  errorMessage += "...";   \n      }\n\n      return NextResponse
    content = re.sub(
        r'(errorMessage \+= [^;]+;)\s*\n\s*\n\s*(return NextResponse)',
        r'\1\n      }\n\n      \2',
        content
    )

    # Pattern 4: Missing final }); for requireAuth wrapper
    # Check if file has requireAuth export but no closing });
    if 'export const' in content and 'requireAuth(' in content:
        # Check if file ends with just } instead of });
        lines = content.split('\n')
        if len(lines) > 2:
            # Check last few non-empty lines
            for i in range(len(lines) - 1, max(len(lines) - 5, 0), -1):
                stripped = lines[i].strip()
                if stripped == '}':
                    # This might be the final closing - add ); after it
                    lines[i] = '});'
                    content = '\n'.join(lines)
                    break
                elif stripped and stripped != '':
                    break

    # Pattern 5: Extra }); on its own line after function closing
    # This is a duplicate we already handled, but let's be specific about cookies.set
    content = re.sub(
        r'(response\.cookies\.set\([^)]+,\s*\{[^}]+\})\s*\}\);',
        r'\1});',
        content
    )

    # Pattern 6: Missing closing for conditional blocks
    # if (...) { ... errorMessage += ...; <newline><newline> return
    # Should have closing } before return
    lines = content.split('\n')
    fixed_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Check if this line has errorMessage += and next significant line is return
        if 'errorMessage +=' in line and i + 1 < len(lines):
            # Look ahead for next non-empty line
            j = i + 1
            while j < len(lines) and lines[j].strip() == '':
                j += 1

            if j < len(lines) and 'return NextResponse' in lines[j]:
                # We need a closing } between them
                # Count the number of empty lines
                empty_count = j - i - 1

                fixed_lines.append(line)
                fixed_lines.append('      }')
                # Add back the empty lines minus one
                for _ in range(empty_count):
                    fixed_lines.append('')
                i = j
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
            if smart_fix(route_file):
                print(f'[OK] {route_file.relative_to(base_path)}')
                fixed += 1
        except Exception as e:
            print(f'[ERR] {route_file.relative_to(base_path)}: {e}')

    print(f'\n{fixed} files fixed')

if __name__ == '__main__':
    main()
