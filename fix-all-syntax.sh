#!/bin/bash

# Script to fix common syntax errors in all route.ts files

API_DIR="C:/Users/Khell/Desktop/Ashley AI/services/ash-admin/src/app/api"
FILES_FIXED=0

echo "Starting syntax fix for all route.ts files..."
echo ""

# Find all route.ts files and fix them
find "$API_DIR" -name "route.ts" -type f | while read -r file; do
    TEMP_FILE="${file}.tmp"
    FIXED=0

    # Create backup
    cp "$file" "${file}.bak"

    # Fix 1: Missing }); before }); (requireAuth wrapper)
    # Fix pattern: }  } -> });  })
    sed -i 's/^\(\s*\)}\s*}\s*$/\1  });\n\1});/g' "$file"

    # Fix 2: Missing }); after return NextResponse.json
    # Pattern: message: "...",  } catch -> message: "...",  });  } catch
    sed -i 's/\(\s*message:\s*"[^"]*",\?\)\s*}\s*} catch/\1\n    });\n  } catch/g' "$file"

    # Fix 3: Missing } after throw in if blocks
    # Pattern: throw error;  const -> throw error;  }  const
    sed -i 's/\(throw [^;]*;\)\s*\n\s*\(const\|if\|return\|async\|\/\/\)/\1\n  }\n\n  \2/g' "$file"

    # Fix 4: Missing }); after forEach
    sed -i 's/\(\s*\)});\s*\n\s*return\s/\1  });\n\1\n\1  return /g' "$file"

    # Fix 5: Missing }); after Prisma queries
    sed -i 's/\(\s*\)},\s*}\s*\n\s*\(const\|if\|return\)/\1    });\n\1  }\n\1\n\1\2/g' "$file"

    # Check if file was modified
    if ! cmp -s "$file" "${file}.bak"; then
        FIXED=1
        FILES_FIXED=$((FILES_FIXED + 1))
        REL_PATH=$(realpath --relative-to="C:/Users/Khell/Desktop/Ashley AI" "$file")
        echo "✓ Fixed: $REL_PATH"
    fi

    # Remove temp files
    rm -f "${file}.bak"
done

echo ""
echo "=== Summary ==="
echo "Files fixed: $FILES_FIXED"
echo "Script complete!"
