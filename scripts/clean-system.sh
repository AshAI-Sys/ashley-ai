#!/bin/bash

# ========================================
# Ashley AI - System Cleanup Script (Linux/macOS)
# ========================================
# Removes unnecessary files, caches, and duplicates
# Safe to run - won't delete source code

set -e

echo "=========================================="
echo "Ashley AI - System Cleanup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get initial size
START_SIZE=$(du -sb . 2>/dev/null | cut -f1)
FILES_DELETED=0

# ========================================
# 1. Clean Build Artifacts
# ========================================
echo -e "${BLUE}Step 1: Cleaning build artifacts...${NC}"

BUILD_DIRS=".next dist build out .turbo"
for dir in $BUILD_DIRS; do
    find . -type d -name "$dir" ! -path "*/node_modules/*" 2>/dev/null | while read -r item; do
        echo -e "  ${YELLOW}Removing: $item${NC}"
        rm -rf "$item"
        FILES_DELETED=$((FILES_DELETED + 1))
    done
done

echo -e "${GREEN}✓ Build artifacts cleaned${NC}"
echo ""

# ========================================
# 2. Clean Cache Directories
# ========================================
echo -e "${BLUE}Step 2: Cleaning cache directories...${NC}"

CACHE_DIRS=".cache .temp .tmp tmp temp"
for dir in $CACHE_DIRS; do
    find . -type d -name "$dir" ! -path "*/node_modules/*" 2>/dev/null | while read -r item; do
        echo -e "  ${YELLOW}Removing: $item${NC}"
        rm -rf "$item"
        FILES_DELETED=$((FILES_DELETED + 1))
    done
done

echo -e "${GREEN}✓ Cache directories cleaned${NC}"
echo ""

# ========================================
# 3. Clean Temporary Files
# ========================================
echo -e "${BLUE}Step 3: Cleaning temporary files...${NC}"

# Log files
find . -type f -name "*.log" ! -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    echo -e "  ${YELLOW}Removing: $(basename "$file")${NC}"
    rm -f "$file"
    FILES_DELETED=$((FILES_DELETED + 1))
done

# Temp files
find . -type f -name "*.tmp" ! -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    echo -e "  ${YELLOW}Removing: $(basename "$file")${NC}"
    rm -f "$file"
    FILES_DELETED=$((FILES_DELETED + 1))
done

# macOS files
find . -type f -name ".DS_Store" 2>/dev/null | while read -r file; do
    echo -e "  ${YELLOW}Removing: .DS_Store${NC}"
    rm -f "$file"
    FILES_DELETED=$((FILES_DELETED + 1))
done

# Windows files
find . -type f -name "Thumbs.db" 2>/dev/null | while read -r file; do
    echo -e "  ${YELLOW}Removing: Thumbs.db${NC}"
    rm -f "$file"
    FILES_DELETED=$((FILES_DELETED + 1))
done

# Vim swap files
find . -type f \( -name "*.swp" -o -name "*.swo" -o -name "*~" \) ! -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    echo -e "  ${YELLOW}Removing: $(basename "$file")${NC}"
    rm -f "$file"
    FILES_DELETED=$((FILES_DELETED + 1))
done

echo -e "${GREEN}✓ Temporary files cleaned${NC}"
echo ""

# ========================================
# 4. Clean TypeScript Build Artifacts
# ========================================
echo -e "${BLUE}Step 4: Cleaning TypeScript artifacts...${NC}"

# Remove .d.ts files (except in node_modules and packages/database)
find . -type f -name "*.d.ts" ! -path "*/node_modules/*" ! -path "*/packages/database/*" ! -path "*/types/*" 2>/dev/null | while read -r file; do
    echo -e "  ${YELLOW}Removing: $(basename "$file")${NC}"
    rm -f "$file"
    FILES_DELETED=$((FILES_DELETED + 1))
done

# Remove .tsbuildinfo files
find . -type f -name "*.tsbuildinfo" ! -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    echo -e "  ${YELLOW}Removing: $(basename "$file")${NC}"
    rm -f "$file"
    FILES_DELETED=$((FILES_DELETED + 1))
done

echo -e "${GREEN}✓ TypeScript artifacts cleaned${NC}"
echo ""

# ========================================
# 5. Clean Test Coverage Reports
# ========================================
echo -e "${BLUE}Step 5: Cleaning test coverage...${NC}"

COVERAGE_DIRS="coverage .nyc_output test-results"
for dir in $COVERAGE_DIRS; do
    find . -type d -name "$dir" 2>/dev/null | while read -r item; do
        echo -e "  ${YELLOW}Removing: $item${NC}"
        rm -rf "$item"
        FILES_DELETED=$((FILES_DELETED + 1))
    done
done

echo -e "${GREEN}✓ Test coverage cleaned${NC}"
echo ""

# ========================================
# 6. Clean Empty Directories
# ========================================
echo -e "${BLUE}Step 6: Cleaning empty directories...${NC}"

find . -type d -empty ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | while read -r dir; do
    echo -e "  ${YELLOW}Removing: $dir${NC}"
    rmdir "$dir" 2>/dev/null || true
    FILES_DELETED=$((FILES_DELETED + 1))
done

echo -e "${GREEN}✓ Empty directories cleaned${NC}"
echo ""

# ========================================
# 7. Clean Package Manager Caches (Optional)
# ========================================
echo -e "${YELLOW}Step 7: Do you want to clean package manager caches? (pnpm, npm)${NC}"
echo -e "${YELLOW}  This will remove downloaded packages but they'll be re-downloaded on next install${NC}"
read -p "Clean package caches? (y/n): " clean_pkg_cache

if [ "$clean_pkg_cache" = "y" ] || [ "$clean_pkg_cache" = "Y" ]; then
    echo -e "${BLUE}  Cleaning pnpm cache...${NC}"
    if command -v pnpm &> /dev/null; then
        pnpm store prune 2>&1 > /dev/null || true
        echo -e "${GREEN}  ✓ pnpm cache cleaned${NC}"
    else
        echo -e "${YELLOW}  ! pnpm not found${NC}"
    fi

    echo -e "${BLUE}  Cleaning npm cache...${NC}"
    if command -v npm &> /dev/null; then
        npm cache clean --force 2>&1 > /dev/null || true
        echo -e "${GREEN}  ✓ npm cache cleaned${NC}"
    else
        echo -e "${YELLOW}  ! npm not found${NC}"
    fi
else
    echo -e "${YELLOW}  Skipped package cache cleaning${NC}"
fi
echo ""

# ========================================
# 8. Clean Old Database Backups (Optional)
# ========================================
echo -e "${BLUE}Step 8: Checking for old database backups...${NC}"

BACKUP_COUNT=$(find . -type f \( -name "*.db.backup" -o -name "*.sql.backup" -o -name "backup*.db" -o -name "backup*.sql" \) ! -path "*/node_modules/*" 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}  Found $BACKUP_COUNT old database backups${NC}"
    read -p "  Do you want to remove them? (y/n): " clean_backups

    if [ "$clean_backups" = "y" ] || [ "$clean_backups" = "Y" ]; then
        find . -type f \( -name "*.db.backup" -o -name "*.sql.backup" -o -name "backup*.db" -o -name "backup*.sql" \) ! -path "*/node_modules/*" 2>/dev/null | while read -r file; do
            echo -e "  ${YELLOW}Removing: $(basename "$file")${NC}"
            rm -f "$file"
            FILES_DELETED=$((FILES_DELETED + 1))
        done
        echo -e "${GREEN}  ✓ Old backups cleaned${NC}"
    else
        echo -e "${YELLOW}  Skipped backup cleaning${NC}"
    fi
else
    echo -e "${GREEN}  No old backups found${NC}"
fi
echo ""

# ========================================
# 9. Clean Git Ignored Files (Optional)
# ========================================
echo -e "${YELLOW}Step 9: Do you want to clean all Git-ignored files?${NC}"
echo -e "${YELLOW}  This will remove everything in .gitignore (safe but thorough)${NC}"
read -p "Clean Git-ignored files? (y/n): " clean_git_ignored

if [ "$clean_git_ignored" = "y" ] || [ "$clean_git_ignored" = "Y" ]; then
    echo -e "${BLUE}  Running git clean...${NC}"
    if command -v git &> /dev/null && [ -d .git ]; then
        git clean -fdX 2>&1 > /dev/null || true
        echo -e "${GREEN}  ✓ Git-ignored files cleaned${NC}"
    else
        echo -e "${YELLOW}  ! Git not found or not a git repository${NC}"
    fi
else
    echo -e "${YELLOW}  Skipped Git clean${NC}"
fi
echo ""

# ========================================
# Summary
# ========================================
END_SIZE=$(du -sb . 2>/dev/null | cut -f1)
SAVED=$((START_SIZE - END_SIZE))
SAVED_GB=$(echo "scale=2; $SAVED / 1073741824" | bc)

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}Cleanup Complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${BLUE}Statistics:${NC}"
echo "  Files/Directories Removed: $FILES_DELETED"
echo "  Space Saved: ${SAVED_GB} GB"
echo ""
echo -e "${GREEN}Your Ashley AI system is now clean! ✨${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Run 'pnpm install' to ensure dependencies are installed"
echo "  2. Run 'pnpm build' to rebuild if needed"
echo "  3. Test your application"
echo ""