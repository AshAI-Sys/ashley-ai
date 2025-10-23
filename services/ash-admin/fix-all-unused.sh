#!/bin/bash
# Bash script to fix all unused variable warnings systematically

cd "c:/Users/Khell/Desktop/Ashley AI/services/ash-admin"

echo "Starting TypeScript unused variable fixes..."
echo ""

# Counter
FIXED=0

# Fix unused 'user' parameters in requireAuth callbacks
echo "Fixing unused 'user' parameters..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "requireAuth(async.*user)" "$file" 2>/dev/null; then
    # Check if 'user' is actually used in the file
    if ! grep -v "requireAuth(async" "$file" | grep -q "\buser\b"; then
      sed -i 's/requireAuth(async (\([^,]*\), user)/requireAuth(async (\1, _user)/g' "$file"
      sed -i 's/requireAuth(async (\([^,]*\),user)/requireAuth(async (\1, _user)/g' "$file"
      echo "  Fixed: $file"
      ((FIXED++))
    fi
  fi
done

# Fix unused 'request' parameters
echo ""
echo "Fixing unused 'request' parameters..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "async (request:" "$file" 2>/dev/null; then
    # Simple heuristic: if 'request' only appears once (in the parameter), it's unused
    count=$(grep -o "\brequest\b" "$file" | wc -l)
    if [ "$count" -eq "1" ]; then
      sed -i 's/async (request:/async (_request:/g' "$file"
      echo "  Fixed: $file"
      ((FIXED++))
    fi
  fi
done

# Fix unused 'req' parameters
echo ""
echo "Fixing unused 'req' parameters..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "async (req:" "$file" 2>/dev/null; then
    count=$(grep -o "\breq\b" "$file" | wc -l)
    if [ "$count" -le "2" ]; then  # Parameter declaration + possible one more reference
      sed -i 's/async (req:/async (_req:/g' "$file"
      echo "  Fixed: $file"
      ((FIXED++))
    fi
  fi
done

echo ""
echo "✓ Fixed approximately $FIXED file patterns"
echo ""
echo "Run 'npx tsc --noEmit 2>&1 | findstr TS6133 | wc -l' to check remaining warnings"
