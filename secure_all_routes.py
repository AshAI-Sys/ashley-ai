#!/usr/bin/env python3
"""
Secure all API routes by adding requireAuth middleware
"""
import os
import re
from pathlib import Path

def secure_route_file(filepath):
    """Add requireAuth to a route file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already secured
    if 'requireAuth' in content:
        return False

    # Add import at top (after other imports)
    if 'from "@/lib/auth-middleware"' not in content:
        # Find the last import statement
        import_pattern = r'(import.*?from.*?;)'
        imports = list(re.finditer(import_pattern, content, re.MULTILINE))
        if imports:
            last_import_end = imports[-1].end()
            content = (content[:last_import_end] +
                      '\nimport { requireAuth } from "@/lib/auth-middleware";' +
                      content[last_import_end:])

    # Convert each export function
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    for method in methods:
        # Pattern: export async function METHOD(
        old_pattern = f'export async function {method}\\('
        # Check for params pattern
        has_params = f'export async function {method}\\(\n  request: NextRequest,\n  \\{{ params \\}}' in content

        if has_params:
            # Has params (like [id] routes)
            new_pattern = f'export const {method} = requireAuth(async (\n  request: NextRequest,\n  user,\n  {{ params }}'
            content = re.sub(
                f'export async function {method}\\(\n  request: NextRequest,\n  \\{{ params \\}}',
                new_pattern,
                content
            )
        else:
            # No params
            old_full = f'export async function {method}\\(request: NextRequest\\)'
            new_full = f'export const {method} = requireAuth(async (request: NextRequest, user) =>'
            content = re.sub(old_full, new_full, content)

            # Also handle shortened version
            old_short = f'export async function {method}\\(req: NextRequest\\)'
            new_short = f'export const {method} = requireAuth(async (req: NextRequest, user) =>'
            content = re.sub(old_short, new_short, content)

    # Fix closing braces - find function end and add );
    # This is tricky, so we'll do a simple pattern match for common endings
    content = re.sub(
        r'(\n}\n)(\n// (GET|POST|PUT|DELETE|PATCH) /api/)',
        r'\n});\n\2',
        content
    )

    # Fix file ending
    if content.rstrip().endswith('\n}'):
        content = content.rstrip() + ';\n'
    elif content.rstrip().endswith('}') and not content.rstrip().endswith('});'):
        content = content.rstrip() + ');\n'

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return True

def main():
    base_path = Path(r'C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api')

    # Find all route.ts files
    route_files = list(base_path.rglob('route.ts'))

    secured_count = 0
    skipped_count = 0

    for route_file in route_files:
        try:
            if secure_route_file(route_file):
                print(f'[OK] Secured: {route_file.relative_to(base_path)}')
                secured_count += 1
            else:
                print(f'[SKIP] Already secured: {route_file.relative_to(base_path)}')
                skipped_count += 1
        except Exception as e:
            print(f'[ERROR] {route_file.relative_to(base_path)} - {e}')

    print(f'\nSummary: {secured_count} routes secured, {skipped_count} already secured')

if __name__ == '__main__':
    main()
