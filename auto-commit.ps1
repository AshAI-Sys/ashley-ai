# Ashley AI - PowerShell Auto Commit Script
# Automatically commits pending changes with detailed commit messages

Write-Host "🚀 Ashley AI - Auto Commit Script" -ForegroundColor Green
Write-Host "📅 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Check if there are changes to commit
$status = git status --porcelain

if ([string]::IsNullOrEmpty($status)) {
    Write-Host "✅ No changes to commit - working tree is clean" -ForegroundColor Green
    Read-Host "Press Enter to continue..."
    exit 0
}

Write-Host "📋 Changes detected:" -ForegroundColor Cyan
git status --short

Write-Host "`n📁 Adding all changes..." -ForegroundColor Cyan
git add .

Write-Host "`n📊 Current status after adding:" -ForegroundColor Cyan
git status

# Create timestamp for commit
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$dateFormatted = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "`n💾 Creating auto-commit..." -ForegroundColor Cyan

$commitMessage = @"
Auto-commit: Ashley AI updates - $timestamp

🤖 Automatic commit of pending changes
📅 Date: $dateFormatted

🎯 Ashley AI System Updates:
- Stage progress maintenance
- Code improvements and fixes
- Documentation updates
- Configuration changes
- UI/UX enhancements

📊 System Status:
- Current: 9/14 Stages Complete (64%)
- Latest: Stage 9 - Finance Operations
- Next: Stage 10 - HR & Payroll

🚀 Generated with Ashley AI Auto-Commit Script

Co-Authored-By: Claude <noreply@anthropic.com>
"@

try {
    git commit -m $commitMessage
    Write-Host "✅ Auto-commit successful!" -ForegroundColor Green

    Write-Host "`n📊 Final status:" -ForegroundColor Cyan
    git status

    Write-Host "`n📈 Latest commits:" -ForegroundColor Cyan
    git log --oneline -n 3

} catch {
    Write-Host "❌ Auto-commit failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Auto-commit process completed" -ForegroundColor Green
Read-Host "Press Enter to continue..."