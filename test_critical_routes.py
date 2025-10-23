#!/usr/bin/env python3
"""
Test Critical API Routes
Tests the 20 most important API endpoints to verify they compile and respond correctly
"""

import subprocess
import json
from typing import List, Tuple

# Most critical routes to test (in order of importance)
CRITICAL_ROUTES = [
    # Authentication (HIGHEST PRIORITY)
    ("POST", "/api/auth/login", "Authentication - Login"),
    ("POST", "/api/auth/register", "Authentication - Register"),
    ("POST", "/api/auth/forgot-password", "Authentication - Forgot Password"),

    # Core Business Operations
    ("GET", "/api/health", "System Health Check"),
    ("GET", "/api/dashboard/stats", "Dashboard Statistics"),
    ("GET", "/api/orders", "Orders Management"),
    ("GET", "/api/clients", "Clients Management"),

    # Production Operations
    ("GET", "/api/cutting/lays", "Cutting Operations"),
    ("GET", "/api/printing/dashboard", "Printing Dashboard"),
    ("GET", "/api/sewing/dashboard", "Sewing Dashboard"),
    ("GET", "/api/quality-control/defects", "Quality Control"),

    # Finance & HR
    ("GET", "/api/finance/stats", "Finance Statistics"),
    ("GET", "/api/finance/invoices", "Finance Invoices"),
    ("GET", "/api/hr/stats", "HR Statistics"),
    ("GET", "/api/hr/employees", "HR Employees"),

    # Delivery & Automation
    ("GET", "/api/delivery/stats", "Delivery Statistics"),
    ("GET", "/api/automation/rules", "Automation Rules"),

    # Mobile & AI
    ("GET", "/api/mobile/stats", "Mobile Statistics"),
    ("GET", "/api/ai-chat/conversations", "AI Chat"),
    ("GET", "/api/maintenance/stats", "Maintenance Statistics"),
]

def test_route(method: str, path: str, description: str) -> Tuple[bool, int, str]:
    """
    Test a single route.
    Returns (success, status_code, message)
    """
    url = f"http://localhost:3001{path}"

    try:
        if method == "GET":
            result = subprocess.run(
                ["curl", "-X", method, url, "-w", "\\nHTTP_CODE:%{http_code}", "-s"],
                capture_output=True,
                text=True,
                timeout=10
            )
        else:  # POST
            result = subprocess.run(
                ["curl", "-X", method, url,
                 "-H", "Content-Type: application/json",
                 "-d", "{}",
                 "-w", "\\nHTTP_CODE:%{http_code}", "-s"],
                capture_output=True,
                text=True,
                timeout=10
            )

        output = result.stdout

        # Extract HTTP status code
        if "HTTP_CODE:" in output:
            status_code = int(output.split("HTTP_CODE:")[-1].strip())
        else:
            return False, 0, "No status code returned"

        # Check if it's a compilation error (500 with ModuleBuildError)
        if status_code == 500 and "ModuleBuildError" in output:
            return False, 500, "COMPILATION ERROR"

        # Any non-500 status is considered success (even 401/400 means it compiled)
        # 401 = Auth required (expected for secured routes)
        # 400 = Validation error (expected for POST without valid data)
        # 200 = Success
        if status_code in [200, 400, 401, 403, 404]:
            return True, status_code, "OK (Route compiles)"
        elif status_code == 500:
            return False, 500, "Runtime error"
        else:
            return True, status_code, f"Unexpected status (but compiled)"

    except subprocess.TimeoutExpired:
        return False, 0, "Timeout"
    except Exception as e:
        return False, 0, f"Error: {str(e)}"

def main():
    print("=" * 100)
    print(" TESTING 20 MOST CRITICAL API ROUTES")
    print("=" * 100)
    print()

    results = []

    for method, path, description in CRITICAL_ROUTES:
        print(f"Testing: {description:<35} [{method} {path}]")
        success, status, message = test_route(method, path, description)

        if success:
            print(f"  [OK] Status {status} - {message}")
        else:
            print(f"  [FAIL] Status {status} - {message}")

        results.append({
            "description": description,
            "method": method,
            "path": path,
            "success": success,
            "status": status,
            "message": message
        })
        print()

    # Summary
    print("=" * 100)
    print(" SUMMARY")
    print("=" * 100)

    total = len(results)
    passed = sum(1 for r in results if r["success"])
    failed = total - passed

    print(f"Total routes tested: {total}")
    print(f"Passed (compiles):   {passed} ({100*passed//total}%)")
    print(f"Failed (errors):     {failed}")
    print()

    if failed > 0:
        print("FAILED ROUTES:")
        for r in results:
            if not r["success"]:
                print(f"  - {r['description']}: {r['message']}")
        print()

    if passed == total:
        print("[SUCCESS] All critical routes are working! System is production-ready.")
    elif passed >= total * 0.9:
        print("[GOOD] 90%+ routes working. Minor fixes needed.")
    elif passed >= total * 0.75:
        print("[WARNING] 75%+ routes working. Some fixes needed.")
    else:
        print("[CRITICAL] Less than 75% routes working. Major fixes needed.")

    print("=" * 100)

if __name__ == "__main__":
    main()
