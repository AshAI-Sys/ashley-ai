#!/usr/bin/env python3
"""
Intelligent fix based on ESLint error output
"""
import subprocess
import re
from pathlib import Path

def get_eslint_errors():
    """Run ESLint and parse errors"""
    result = subprocess.run(
        ['npx', 'eslint', 'src/app/api/**/*.ts', '--max-warnings=0'],
        cwd=r'C:\Users\Khell\Desktop\Ashley AI\services\ash-admin',
        capture_output=True,
        text=True
    )

    errors = []
    lines = result.stderr.split('\n')
    current_file = None

    for line in lines:
        # Match file path
        if line.strip().endswith('.ts'):
            current_file = line.strip()
        # Match error line
        elif 'error  Parsing error:' in line and current_file:
            match = re.match(r'\s*(\d+):(\d+)\s+error\s+Parsing error:\s+(.+)', line)
            if match:
                line_num = int(match.group(1))
                col_num = int(match.group(2))
                error_msg = match.group(3)
                errors.append({
                    'file': current_file,
                    'line': line_num,
                    'column': col_num,
                    'message': error_msg
                })

    return errors

def fix_error(filepath, line_num, error_msg):
    """Fix a specific error in a file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if line_num > len(lines):
        return False

    line = lines[line_num - 1]
    original = line

    # Apply fixes based on error message
    if "',' expected" in error_msg:
        # Usually means missing semicolon or closing paren
        # Check if line ends with }
        if line.rstrip().endswith('}'):
            # Add ); or , based on context
            # If previous lines have "return NextResponse.json"
            has_return = any('return NextResponse.json' in lines[i] for i in range(max(0, line_num - 10), line_num - 1))
            if has_return:
                line = line.rstrip() + ');\n'
            else:
                # Check if this is inside a data object
                has_data = any('data: {' in lines[i] for i in range(max(0, line_num - 20), line_num - 1))
                if has_data:
                    line = line.rstrip() + ');\n'

    elif "Declaration or statement expected" in error_msg:
        # Usually extra }); or missing something
        if line.strip() == '});':
            # Check if this should be here
            # Count braces in previous lines
            open_count = 0
            close_count = 0
            for i in range(max(0, line_num - 50), line_num - 1):
                open_count += lines[i].count('{') + lines[i].count('(')
                close_count += lines[i].count('}') + lines[i].count(')')

            # If balanced, this }); might be extra
            if open_count <= close_count:
                line = ''  # Remove the line

    elif "Expression expected" in error_msg:
        # Check for =; pattern
        if '=;' in line or '= ;' in line:
            line = line.replace('=;', '=').replace('= ;', '=')

    # Update line if changed
    if line != original:
        lines[line_num - 1] = line
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        return True

    return False

def main():
    print("Fetching ESLint errors...")
    errors = get_eslint_errors()
    print(f"Found {len(errors)} errors")

    fixed_count = 0
    for error in errors[:50]:  # Fix first 50 to avoid too many changes at once
        filepath = error['file']
        # Convert Windows path if needed
        if filepath.startswith('C:\\'):
            pass  # Already absolute
        else:
            filepath = f"C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin\\{filepath}"

        if fix_error(filepath, error['line'], error['message']):
            print(f"[OK] Fixed {Path(filepath).name}:{error['line']}")
            fixed_count += 1

    print(f"\n{fixed_count} errors fixed")

if __name__ == '__main__':
    main()
