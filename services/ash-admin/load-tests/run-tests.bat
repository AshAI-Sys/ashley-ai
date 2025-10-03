@echo off
REM Ashley AI Load Testing Runner (Windows)
REM This script runs all k6 load tests

echo.
echo ======================================
echo    Ashley AI Load Tests - Windows
echo ======================================
echo.

REM Check if k6 is installed
where k6 >nul 2>nul
if %errorlevel% neq 0 (
    echo X k6 is not installed
    echo.
    echo Install k6: https://k6.io/docs/getting-started/installation/
    echo For Windows: choco install k6
    echo Or download from: https://github.com/grafana/k6/releases
    exit /b 1
)

echo + k6 is installed
echo.

REM Check if server is running
echo Checking if server is running on localhost:3001...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo X Server is not running on localhost:3001
    echo.
    echo Start the server with: pnpm --filter @ash/admin dev
    exit /b 1
)

echo + Server is running
echo.

echo Test Plan:
echo   1. API Endpoints - Smoke Test (30s)
echo   2. Database Queries - Stress Test (4min)
echo   3. Authentication - Spike Test (2.5min)
echo.

REM Create results directory
if not exist "results" mkdir results
set TIMESTAMP=%date:~-4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set RESULT_DIR=results\%TIMESTAMP%
mkdir "%RESULT_DIR%"

echo Results will be saved to: %RESULT_DIR%
echo.

REM Run API Endpoints Test
echo.
echo ==========================================
echo  Running API Endpoints Test...
echo ==========================================
k6 run --out json="%RESULT_DIR%\api-endpoints-results.json" api-endpoints.test.js
if %errorlevel% neq 0 (
    echo X API Endpoints Test failed
) else (
    echo + API Endpoints Test completed
)
echo.
timeout /t 3 >nul

REM Run Database Queries Test
echo.
echo ==========================================
echo  Running Database Queries Test...
echo ==========================================
k6 run --out json="%RESULT_DIR%\database-queries-results.json" database-queries.test.js
if %errorlevel% neq 0 (
    echo X Database Queries Test failed
) else (
    echo + Database Queries Test completed
)
echo.
timeout /t 3 >nul

REM Run Authentication Test
echo.
echo ==========================================
echo  Running Authentication Workflow Test...
echo ==========================================
k6 run --out json="%RESULT_DIR%\auth-workflow-results.json" auth-workflow.test.js
if %errorlevel% neq 0 (
    echo X Authentication Test failed
) else (
    echo + Authentication Test completed
)
echo.

echo.
echo ==========================================
echo  All Tests Completed!
echo ==========================================
echo.
echo Results saved to: %RESULT_DIR%
echo.
echo View JSON results in the results folder
echo.
pause
