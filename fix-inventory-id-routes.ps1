# PowerShell script to fix [id] inventory routes
# Adds requireAuth wrapper and removes spoofable x-workspace-id header

$files = @(
    "services/ash-admin/src/app/api/inventory/suppliers/[id]/route.ts",
    "services/ash-admin/src/app/api/inventory/purchase-orders/[id]/route.ts",
    "services/ash-admin/src/app/api/inventory/auto-reorder/[id]/route.ts"
)

foreach ($file in $files) {
    Write-Host "Fixing $file..."

    $content = Get-Content $file -Raw

    # Add requireAuth import
    $content = $content -replace 'import \{ prisma \} from "@/lib/db";', 'import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";'

    # Fix GET handler
    $content = $content -replace 'export async function GET\(\s*request: NextRequest,\s*\{ params \}: \{ params: \{ id: string \} \}\s*\) \{',
        'export const GET = requireAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {'

    # Replace x-workspace-id with user.workspaceId
    $content = $content -replace 'const workspace_id = request\.headers\.get\("x-workspace-id"\) \|\| "default-workspace";',
        'const workspace_id = user.workspaceId; // Use authenticated workspace ID'

    # Also fix x-user-id if present
    $content = $content -replace 'const user_id = request\.headers\.get\("x-user-id"\) \|\| "system";',
        'const user_id = user.id; // Use authenticated user ID'

    Set-Content -Path $file -Value $content
}

Write-Host "Done! Now manually close handlers with });"
