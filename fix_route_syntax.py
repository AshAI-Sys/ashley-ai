#!/usr/bin/env python3
"""
Fix syntax errors in route files caused by automated conversion
"""
import os
import re
from pathlib import Path

def fix_route_file(filepath):
    """Fix syntax errors in a route file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes_made = []

    # Fix 1: Ensure requireAuth import exists
    if 'requireAuth' in content and 'from "@/lib/auth-middleware"' not in content:
        # Find the position after last import
        import_matches = list(re.finditer(r'^import.*?from.*?;$', content, re.MULTILINE))
        if import_matches:
            last_import_end = import_matches[-1].end()
            content = (content[:last_import_end] +
                      '\nimport { requireAuth } from "@/lib/auth-middleware";' +
                      content[last_import_end:])
            changes_made.append('Added requireAuth import')

    # Fix 2: Fix incomplete requireAuth wrapping - find patterns like:
    # export const GET = requireAuth(async (request: NextRequest) {
    # that are missing the closing });

    # Count opening and closing for each export const
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    for method in methods:
        # Pattern: export const METHOD = requireAuth(async
        pattern = rf'export const {method} = requireAuth\(async'
        if re.search(pattern, content):
            # Find the export const line
            match = re.search(rf'(export const {method} = requireAuth\(async[^)]*?\) => \{{)', content)
            if match:
                start_pos = match.start()

                # Find the next export const or end of file
                next_export = re.search(r'\nexport (const|async function)', content[match.end():])
                if next_export:
                    end_pos = match.end() + next_export.start()
                else:
                    end_pos = len(content)

                # Get the function body
                function_body = content[match.end():end_pos]

                # Check if it ends with }); or just }
                if function_body.rstrip().endswith('}'):
                    # Check if we need to add );
                    if not function_body.rstrip().endswith('});'):
                        # Replace the last } with });
                        last_brace_pos = function_body.rstrip().rfind('}')
                        function_body = function_body[:last_brace_pos] + '});' + function_body[last_brace_pos+1:]
                        content = content[:match.end()] + function_body + content[end_pos:]
                        changes_made.append(f'Fixed {method} closing bracket')

    # Fix 3: Fix incorrect patterns like "export const GET = requireAuth(async (request: NextRequest) {"
    # Should be "export const GET = requireAuth(async (request: NextRequest, user) => {"

    # Pattern without user parameter
    for method in methods:
        # Fix missing user parameter
        pattern1 = rf'export const {method} = requireAuth\(async \(request: NextRequest\) \{{'
        replacement1 = rf'export const {method} = requireAuth(async (request: NextRequest, user) => {{'
        if re.search(pattern1, content):
            content = re.sub(pattern1, replacement1, content)
            changes_made.append(f'Added user param to {method}')

        pattern2 = rf'export const {method} = requireAuth\(async \(req: NextRequest\) \{{'
        replacement2 = rf'export const {method} = requireAuth(async (req: NextRequest, user) => {{'
        if re.search(pattern2, content):
            content = re.sub(pattern2, replacement2, content)
            changes_made.append(f'Added user param to {method} (req)')

    # Fix 4: Fix routes with params pattern (like [id] routes)
    # Pattern: export const GET = requireAuth(async (
    #   request: NextRequest,
    #   { params }
    # Should add user parameter

    for method in methods:
        # Multi-line pattern with params but no user
        pattern = rf'export const {method} = requireAuth\(async \(\n  request: NextRequest,\n  \{{\{{ params \}}\}}'
        replacement = rf'export const {method} = requireAuth(async (\n  request: NextRequest,\n  user,\n  {{\{{ params \}}}}'
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes_made.append(f'Added user param to {method} with params')

    # Write back if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, changes_made

    return False, []

def main():
    base_path = Path(r'C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api')

    # Find all route.ts files
    route_files = list(base_path.rglob('route.ts'))

    fixed_count = 0
    skipped_count = 0

    print(f"Found {len(route_files)} route files to check\n")

    for route_file in route_files:
        try:
            changed, changes = fix_route_file(route_file)
            if changed:
                rel_path = route_file.relative_to(base_path)
                print(f'[FIXED] {rel_path}')
                for change in changes:
                    print(f'  - {change}')
                fixed_count += 1
            else:
                skipped_count += 1
        except Exception as e:
            rel_path = route_file.relative_to(base_path)
            print(f'[ERROR] {rel_path}: {e}')

    print(f'\nSummary: {fixed_count} files fixed, {skipped_count} files already correct')

if __name__ == '__main__':
    main()
