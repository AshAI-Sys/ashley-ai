#!/bin/bash
# Comprehensive fix for ALL remaining unsafe date parsing

cd "c:/Users/Khell/Desktop/Ashley AI/services/ash-admin/src"

echo "========================================="
echo "FIXING ALL UNSAFE DATE PARSING PATTERNS"
echo "========================================="
echo ""

fixed=0

# Find all files with unsafe patterns
files=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "*.d.ts" -exec grep -l "toLocaleDateString()\|toLocaleString()" {} \; | grep -v node_modules | grep -v ".next")

for file in $files; do
    echo "Processing: $file"

    # Add import if not present
    if ! grep -q 'from "@/lib/utils/date"' "$file"; then
        # Find the last import line
        last_import=$(grep -n '^import ' "$file" | tail -1 | cut -d: -f1)
        if [ ! -z "$last_import" ]; then
            sed -i "${last_import}a import { formatDate as formatDateUtil } from \"@/lib/utils/date\";" "$file"
        fi
    fi

    # Fix: new Date(x).toLocaleDateString() → x ? formatDateUtil(x) : "-"
    sed -i 's/new Date(\([^)]*\))\.toLocaleDateString()/(\1 ? formatDateUtil(\1) : "-")/g' "$file"

    # Fix: new Date(x).toLocaleString() → x ? formatDateUtil(x, "datetime") : "-"
    sed -i 's/new Date(\([^)]*\))\.toLocaleString()/(\1 ? formatDateUtil(\1, "datetime") : "-")/g' "$file"

    # Fix direct .toLocaleDateString() calls (more conservative)
    sed -i 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.toLocaleDateString()/(\1 ? formatDateUtil(\1) : "-")/g' "$file"

    # Fix: date: date.toLocaleDateString() patterns
    sed -i 's/date: date\.toLocaleDateString()/date: date ? formatDateUtil(date) : "-"/g' "$file"
    sed -i 's/time: date\.toLocaleTimeString()/time: date ? formatDateUtil(date, "time") : "-"/g' "$file"

    fixed=$((fixed + 1))
    echo "✅ Fixed: $file"
done

echo ""
echo "========================================="
echo "✅ FIXED $fixed FILES!"
echo "========================================="
