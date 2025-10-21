# PowerShell script to check Ashley AI database

Write-Host "🔍 Checking Ashley AI Database" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

$dbPath = "C:\Users\Khell\Desktop\Ashley AI\packages\database\prisma\dev.db"

if (Test-Path $dbPath) {
    Write-Host "✅ Database file found: $dbPath" -ForegroundColor Green
    $dbSize = (Get-Item $dbPath).Length / 1KB
    Write-Host "   Size: $([math]::Round($dbSize, 2)) KB" -ForegroundColor Gray
} else {
    Write-Host "❌ Database file NOT found: $dbPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Database Information:" -ForegroundColor Cyan

# Check if we can use sqlite3
$hasSqlite = Get-Command sqlite3 -ErrorAction SilentlyContinue

if ($hasSqlite) {
    Write-Host ""
    Write-Host "1️⃣ Checking workspace 'reefer'..." -ForegroundColor Yellow
    $result = sqlite3 $dbPath "SELECT COUNT(*) FROM Workspace WHERE slug = 'reefer';"
    if ($result -eq "1") {
        Write-Host "   ⚠️  Workspace 'reefer' EXISTS in database" -ForegroundColor Red
        sqlite3 $dbPath "SELECT id, name, slug FROM Workspace WHERE slug = 'reefer';" | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ✅ Workspace 'reefer' is available" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "2️⃣ Checking email 'kelvinmorfe17@gmail.com'..." -ForegroundColor Yellow
    $result = sqlite3 $dbPath "SELECT COUNT(*) FROM User WHERE email = 'kelvinmorfe17@gmail.com';"
    if ($result -eq "1") {
        Write-Host "   ⚠️  Email 'kelvinmorfe17@gmail.com' EXISTS in database" -ForegroundColor Red
        sqlite3 $dbPath "SELECT id, email, first_name, last_name, role FROM User WHERE email = 'kelvinmorfe17@gmail.com';" | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ✅ Email 'kelvinmorfe17@gmail.com' is available" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "3️⃣ All Workspaces:" -ForegroundColor Yellow
    $workspaces = sqlite3 $dbPath "SELECT COUNT(*) FROM Workspace;"
    Write-Host "   Total: $workspaces workspace(s)" -ForegroundColor Gray
    if ($workspaces -gt 0) {
        sqlite3 $dbPath "SELECT name, slug FROM Workspace;" | ForEach-Object {
            Write-Host "   - $_" -ForegroundColor Gray
        }
    }

    Write-Host ""
    Write-Host "4️⃣ All Users:" -ForegroundColor Yellow
    $users = sqlite3 $dbPath "SELECT COUNT(*) FROM User;"
    Write-Host "   Total: $users user(s)" -ForegroundColor Gray
    if ($users -gt 0) {
        sqlite3 $dbPath "SELECT email, first_name, last_name, role FROM User;" | ForEach-Object {
            Write-Host "   - $_" -ForegroundColor Gray
        }
    }

} else {
    Write-Host "⚠️  SQLite3 command not found - cannot query database directly" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 To check the database, you can:" -ForegroundColor Cyan
    Write-Host "   1. Use Prisma Studio: cd packages\database && npx prisma studio" -ForegroundColor Gray
    Write-Host "   2. Download DB Browser for SQLite: https://sqlitebrowser.org/" -ForegroundColor Gray
    Write-Host "   3. Install sqlite3: choco install sqlite (requires Chocolatey)" -ForegroundColor Gray
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   - If conflicts found: Use different workspace name/email" -ForegroundColor Gray
Write-Host "   - To view database visually: cd packages\database && npx prisma studio" -ForegroundColor Gray
Write-Host "   - To delete conflicts: I can create a cleanup script" -ForegroundColor Gray
Write-Host ""
