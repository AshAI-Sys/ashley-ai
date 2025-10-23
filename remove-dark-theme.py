#!/usr/bin/env python3
"""
Script to remove all dark theme classes from TypeScript/TSX files
"""

import re
import os
import sys

def remove_dark_classes(content):
    """Remove dark: prefixed Tailwind classes from content"""

    # Pattern 1: Remove dark:class-name from className strings
    # Handles cases like: dark:bg-gray-800, dark:text-white, etc.
    pattern1 = r'\s*dark:[a-zA-Z0-9\-\/\[\]\.]+(?:\s|"|\})'
    content = re.sub(pattern1, lambda m: m.group()[-1], content)

    # Pattern 2: Remove dark:class-name from the middle of className strings
    pattern2 = r'\bdark:[a-zA-Z0-9\-\/\[\]\.]+\s+'
    content = re.sub(pattern2, '', content)

    # Pattern 3: Remove trailing dark classes before quotes
    pattern3 = r'\s+dark:[a-zA-Z0-9\-\/\[\]\.]+(?=")'
    content = re.sub(pattern3, '', content)

    # Clean up any double spaces left behind
    content = re.sub(r'\s{2,}', ' ', content)

    # Clean up spaces before closing quotes
    content = re.sub(r'\s+"', '"', content)

    return content

def process_file(filepath):
    """Process a single file to remove dark classes"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        new_content = remove_dark_classes(content)

        if original_content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"[OK] Updated: {filepath}")
            return True
        else:
            print(f"  No changes: {filepath}")
            return False
    except Exception as e:
        print(f"[ERROR] Error processing {filepath}: {e}")
        return False

def main():
    """Main function"""
    base_dir = "services/ash-admin/src"

    # List of files to process
    files_to_process = [
        "app/admin/analytics/page.tsx",
        "app/admin/audit/page.tsx",
        "app/admin/onboarding/page.tsx",
        "app/admin/reports/page.tsx",
        "app/admin/tenants/page.tsx",
        "app/admin/users/page.tsx",
        "app/finance/page.tsx",
        "app/orders/new/page-content.tsx",
        "app/settings/account/page.tsx",
        "app/settings/appearance/page.tsx",
        "app/settings/audit-logs/page.tsx",
        "app/settings/notifications/page.tsx",
        "app/settings/password/page.tsx",
        "app/settings/sessions/page.tsx",
        "app/settings/workspace/page.tsx",
        "app/verify-email/page.tsx",
        "components/charts/EfficiencyGaugeChart.tsx",
        "components/charts/ProductionTrendChart.tsx",
        "components/dark-mode-toggle.tsx",
        "components/dashboard/CustomizableDashboard.tsx",
        "components/dashboard/RealTimeMetrics.tsx",
        "components/OptimizedImage.tsx",
        "components/order-intake/client-brand-section.tsx",
        "components/pwa-install-prompt.tsx",
        "components/pwa-register.tsx",
        "components/role-dashboards/AdminDashboard.tsx",
        "components/theme-toggle.tsx",
        "components/ui/alert.tsx",
        "components/ui/form-validation.tsx",
        "components/ui/responsive-table.tsx",
        "components/ui/skeleton.tsx",
        "components/ui/theme-toggle.tsx",
        "components/ui/toast-provider.tsx",
    ]

    print("Removing dark theme classes from files...\n")

    updated_count = 0
    for file_path in files_to_process:
        full_path = os.path.join(base_dir, file_path)
        if os.path.exists(full_path):
            if process_file(full_path):
                updated_count += 1
        else:
            print(f"WARNING: File not found: {full_path}")

    print(f"\nDONE! Updated {updated_count} files.")

if __name__ == "__main__":
    main()
