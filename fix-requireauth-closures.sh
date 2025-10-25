#!/bin/bash
# Auto-fix script for requireAuth closure patterns in Next.js route files
# Created: 2025-10-25
# Purpose: Fix common TypeScript closure/bracket errors in API routes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-$SCRIPT_DIR/services/ash-admin/src/app/api}"

echo "🔧 Auto-fixing requireAuth closure patterns in: $TARGET_DIR"
echo ""

# Counter for fixes
FIXES=0

# Pattern 1: Double requireAuth wrapper
# Example: export const GET = requireAuth(async (req) => { return requireAuth(async (req) => { ... })
echo "🔍 Fixing Pattern 1: Double requireAuth wrappers..."
while IFS= read -r -d '' file; do
  if grep -q "return requireAuth(async" "$file"; then
    echo "  ✓ Fixing: $file"
    # Remove the "return requireAuth(async" line and fix the closure
    sed -i '/return requireAuth(async/d' "$file"
    ((FIXES++))
  fi
done < <(find "$TARGET_DIR" -name "route.ts" -type f -print0)

# Pattern 2: Missing requireAuth closure `});` at end of file
echo "🔍 Fixing Pattern 2: Missing requireAuth closures..."
while IFS= read -r -d '' file; do
  # Check if file has requireAuth but doesn't end with `});`
  if grep -q "requireAuth(async" "$file" && ! tail -5 "$file" | grep -q "^});$"; then
    # Check if it ends with just `}` instead
    if tail -1 "$file" | grep -q "^}$"; then
      echo "  ✓ Fixing: $file"
      sed -i '$ s/^}$/});/' "$file"
      ((FIXES++))
    elif tail -1 "$file" | grep -q "^  }$"; then
      echo "  ✓ Fixing: $file"
      sed -i '$ s/^  }$/});/' "$file"
      ((FIXES++))
    fi
  fi
done < <(find "$TARGET_DIR" -name "route.ts" -type f -print0)

# Pattern 3: Extra closing braces (double `}` before final `});`)
echo "🔍 Fixing Pattern 3: Extra closing braces..."
while IFS= read -r -d '' file; do
  # Check for pattern: `  }\n  }\n});` at end of file
  if tail -3 "$file" | grep -Pzo "  }\n  }\n\});" > /dev/null 2>&1; then
    echo "  ✓ Fixing: $file"
    # Remove the second-to-last line if it's `  }`
    LINE_COUNT=$(wc -l < "$file")
    TARGET_LINE=$((LINE_COUNT - 1))
    sed -i "${TARGET_LINE}d" "$file"
    ((FIXES++))
  fi
done < <(find "$TARGET_DIR" -name "route.ts" -type f -print0)

# Pattern 4: Misplaced `});` in middle of function (after early returns)
echo "🔍 Fixing Pattern 4: Misplaced requireAuth closures..."
while IFS= read -r -d '' file; do
  # Find lines with standalone `});` that appear before the end
  LINE_COUNT=$(wc -l < "$file")

  # Get all `});` line numbers except the last one
  MISPLACED_LINES=$(grep -n "^});$" "$file" | head -n -1 | cut -d: -f1)

  if [ -n "$MISPLACED_LINES" ]; then
    echo "  ✓ Fixing: $file"
    # Replace misplaced `});` with `    }` (proper if statement closure)
    while IFS= read -r line_num; do
      sed -i "${line_num}s/^});$/    }/" "$file"
    done <<< "$MISPLACED_LINES"
    ((FIXES++))
  fi
done < <(find "$TARGET_DIR" -name "route.ts" -type f -print0)

# Pattern 5: Missing try-catch closing braces
echo "🔍 Fixing Pattern 5: Missing try-catch closures..."
while IFS= read -r -d '' file; do
  # Check for pattern where catch block doesn't close properly
  if grep -q "} catch (error" "$file"; then
    # Count opening { and closing }
    OPENS=$(grep -o "{" "$file" | wc -l)
    CLOSES=$(grep -o "}" "$file" | wc -l)

    if [ "$OPENS" -ne "$CLOSES" ]; then
      echo "  ⚠️  Imbalanced braces in: $file (opens=$OPENS, closes=$CLOSES)"
      # This requires manual inspection
    fi
  fi
done < <(find "$TARGET_DIR" -name "route.ts" -type f -print0)

echo ""
echo "✅ Auto-fix complete! Made $FIXES fixes."
echo ""
echo "📝 Next steps:"
echo "  1. Run: cd services/ash-admin && pnpm build"
echo "  2. Review any remaining errors manually"
echo "  3. Check git diff to verify changes"
echo ""

exit 0
