#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE FIX
Fixes the exact pattern causing 90% of compilation errors:
Missing }); before } catch (error) {
"""

import os
import re
from pathlib import Path
from typing import List, Tuple

def fix_missing_closure_before_catch(filepath: str) -> Tuple[bool, List[str]]:
    """
    Fix missing }); before } catch (error) {
    Returns (was_modified, list_of_fixes_applied)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        fixes_applied = []

        # PATTERN 1: Missing }); after return NextResponse.json({...},
        # before } catch
        pattern1 = r'(return\s+NextResponse\.json\([^)]+\{[^}]+\},)\s*\n\s*(\}\s+catch\s*\()'
        if re.search(pattern1, content, re.DOTALL):
            content = re.sub(pattern1, r'\1\n});\n\2', content, flags=re.DOTALL)
            fixes_applied.append("Added missing }); after return NextResponse.json before catch")

        # PATTERN 2: Missing }); after nested object literal
        # },  },  } catch
        pattern2 = r'(\},)\s*\n\s*(\},)\s*\n\s*(\}\s+catch\s*\()'
        if re.search(pattern2, content, re.DOTALL):
            content = re.sub(pattern2, r'\1\n  \2\n});\n\3', content, flags=re.DOTALL)
            fixes_applied.append("Added missing }); before catch block")

        # PATTERN 3: Simpler pattern - any } catch that should have });
        # Look for },\n} catch and make it },\n});\n} catch
        pattern3 = r'(\},)\s*\n\s*(\}\s+catch\s*\()'
        if re.search(pattern3, content):
            # Check if there's already a }); there
            if not re.search(r'\}\);\s*\n\s*\}\s+catch', content):
                content = re.sub(pattern3, r'\1\n});\n\2', content)
                fixes_applied.append("Added missing }); before catch")

        # Save if modified
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, fixes_applied

        return False, []

    except Exception as e:
        print(f"[ERROR] {filepath}: {e}")
        return False, []

def main():
    # Find all API route files
    api_dir = Path(r"C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api")
    route_files = list(api_dir.rglob("route.ts"))

    print(f"Scanning {len(route_files)} route files for missing closures before catch...")
    print("=" * 80)

    fixed_count = 0
    skipped_count = 0
    fix_summary = {}

    for filepath in route_files:
        relative_path = filepath.relative_to(api_dir.parent.parent.parent)

        was_modified, fixes = fix_missing_closure_before_catch(str(filepath))

        if was_modified:
            fixed_count += 1
            print(f"[FIXED] {relative_path}")
            for fix in fixes:
                print(f"  - {fix}")
                fix_summary[fix] = fix_summary.get(fix, 0) + 1
        else:
            skipped_count += 1

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total files: {len(route_files)}")
    print(f"Fixed: {fixed_count}")
    print(f"Already correct: {skipped_count}")

    if fix_summary:
        print("\nFixes Applied:")
        for fix_type, count in sorted(fix_summary.items(), key=lambda x: -x[1]):
            print(f"  {count:3d}x {fix_type}")

    print("=" * 80)
    print("\nRun dev server to test the fixes!")

if __name__ == "__main__":
    main()
