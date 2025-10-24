# PowerShell script to fix common syntax errors in route.ts files

$apiPath = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api"
$routeFiles = Get-ChildItem -Path $apiPath -Filter "route.ts" -Recurse

$fixCount = 0
$filesFixed = @()

foreach ($file in $routeFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileFixed = $false

    # Pattern 1: Fix missing }); before } catch
    $content = $content -replace '(\s+)\}\s+catch\s*\(', '$1  });$1} catch ('

    # Pattern 2: Fix missing }); at end of NextResponse.json before catch
    $content = $content -replace '(\s+message:\s*"[^"]+",?)\s+\}\s+catch', '$1$1    });$1  } catch'

    # Pattern 3: Fix missing }); before function definitions
    $content = $content -replace '(\s+)\}\s+(async\s+function|function)\s+', '$1  });$1$1$2 '

    # Pattern 4: Fix missing }); at end of requireAuth wrapper before next export
    $content = $content -replace '(\s+)\}\s+\}\s+(export\s+const\s+(GET|POST|PUT|DELETE|PATCH))', '$1  });$1});$1$1$2'

    # Pattern 5: Fix missing }); after Prisma queries
    $content = $content -replace '(\s+)\},\s+\}\s+catch', '$1    });$1  } catch'

    # Pattern 6: Fix trailing }); at end of file
    $content = $content -replace '\}\s*\}\)\;?\s*$', '});'

    # Pattern 7: Fix missing } after forEach
    $content = $content -replace '(\s+)\}\);\s+return\s+', '$1  });$1$1  return '

    # Pattern 8: Fix missing });} after async function in requireAuth
    $content = $content -replace '(\s+throw\s+error;)\s+\}\s+\}\s+(async\s+function)', '$1$1  }$1});$1$1$2'

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesFixed += $file.FullName
        $fileFixed = $true
        $fixCount++
    }
}

Write-Host "Fixed $fixCount files:" -ForegroundColor Green
foreach ($file in $filesFixed) {
    Write-Host "  - $file" -ForegroundColor Yellow
}
