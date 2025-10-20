# PowerShell script to replace hardcoded workspace IDs with workspace utility
# This script updates all TypeScript files to use the new workspace management system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Workspace ID Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src"
$filesUpdated = 0
$filesSkipped = 0

# Files to update (found from grep search)
$filesToUpdate = @(
    "$rootPath\app\merchandising\page.tsx",
    "$rootPath\app\api\health\route.ts",
    "$rootPath\lib\auth-middleware.ts",
    "$rootPath\components\ai-chat\ChatWidget.tsx",
    "$rootPath\app\api\seed\route.ts",
    "$rootPath\app\api\orders\[id]\route.ts",
    "$rootPath\app\api\orders\[id]\color-variants\route.ts",
    "$rootPath\app\api\orders\[id]\activity-logs\route.ts",
    "$rootPath\app\api\mobile\stats\route.ts",
    "$rootPath\app\api\mobile\scan\route.ts",
    "$rootPath\app\api\dashboard\stats\route.ts",
    "$rootPath\app\api\clients\[id]\route.ts"
)

foreach ($file in $filesToUpdate) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow

        $content = Get-Content $file -Raw
        $originalContent = $content

        # Check if file already has workspace import
        $hasWorkspaceImport = $content -match "from '@/lib/workspace'"

        # For TypeScript/JavaScript API files
        if ($file -match "\.ts$" -or $file -match "route\.ts$") {
            # Add import if not present
            if (-not $hasWorkspaceImport) {
                # Find the last import statement
                if ($content -match "(?s)(import .+ from .+;)\s*\n") {
                    $lastImport = $Matches[1]
                    $content = $content -replace [regex]::Escape($lastImport), "$lastImport`nimport { getWorkspaceIdFromRequest } from '@/lib/workspace';"
                }
            }

            # Replace DEFAULT_WORKSPACE_ID constant declarations
            $content = $content -replace "(?m)^const DEFAULT_WORKSPACE_ID = ['""]demo-workspace-1['""];?\s*$", ""

            # Replace workspace_id: DEFAULT_WORKSPACE_ID with workspace_id: workspaceId
            $content = $content -replace "workspace_id:\s*DEFAULT_WORKSPACE_ID", "workspace_id: workspaceId"

            # Add workspaceId extraction at function start (if not already present)
            if ($content -notmatch "const workspaceId = getWorkspaceIdFromRequest") {
                # For GET requests
                $content = $content -replace "(?m)^(\s*)(export async function GET\(request: NextRequest\) \{\s*try \{)", "`$1`$2`n`$1  const workspaceId = getWorkspaceIdFromRequest(request);"

                # For POST requests
                $content = $content -replace "(?m)^(\s*)(export async function POST\(request: NextRequest\) \{\s*try \{)", "`$1`$2`n`$1  const workspaceId = getWorkspaceIdFromRequest(request);"

                # For PUT requests
                $content = $content -replace "(?m)^(\s*)(export async function PUT\(request: NextRequest\) \{\s*try \{)", "`$1`$2`n`$1  const workspaceId = getWorkspaceIdFromRequest(request);"

                # For DELETE requests
                $content = $content -replace "(?m)^(\s*)(export async function DELETE\(request: NextRequest\) \{\s*try \{)", "`$1`$2`n`$1  const workspaceId = getWorkspaceIdFromRequest(request);"
            }
        }

        # For React component files
        if ($file -match "\.tsx$" -and $file -notmatch "route\.ts") {
            # Replace hardcoded string in fetch calls
            $content = $content -replace "const workspaceId = ['""]demo-workspace-1['""]", "// Workspace ID is now handled by cookies/headers"
            $content = $content -replace "workspaceId=demo-workspace-1", "workspaceId=' + (typeof window !== 'undefined' ? document.cookie.match(/workspace_id=([^;]+)/)?.[1] || 'demo-workspace-1' : 'demo-workspace-1') + '"
        }

        # Only write if content changed
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  ✓ Updated successfully" -ForegroundColor Green
            $filesUpdated++
        } else {
            Write-Host "  - No changes needed" -ForegroundColor Gray
            $filesSkipped++
        }
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files updated: $filesUpdated" -ForegroundColor Green
Write-Host "Files skipped: $filesSkipped" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the changes in each file"
Write-Host "2. Test the API endpoints"
Write-Host "3. Commit the changes to git"
Write-Host ""
