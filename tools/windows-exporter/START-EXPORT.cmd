@echo off
cd /d "%~dp0"
title YourLTA PSN Exporter
echo YourLTA PSN Exporter
where node.exe >nul 2>nul
if errorlevel 1 goto missing
if not exist "node_modules\psn-api\package.json" goto install
goto run
:install
echo Installing PlayStation library...
call npm.cmd install --no-audit --no-fund
if errorlevel 1 goto failed
:run
echo Opening PlayStation sign-in page...
start "" "https://www.playstation.com/en-us/playstation-network/"
echo.
echo Sign in to your PlayStation account in the browser.
echo After signing in, return here and press any key to open the NPSSO page.
pause >nul
echo Opening Sony NPSSO page...
start "" "https://ca.account.sony.com/api/v1/ssocookie"
node.exe export.mjs
if errorlevel 1 goto failed
echo.
echo Export successful. JSON saved in this folder.
pause
exit /b 0
:missing
echo Node.js is required. Install it from https://nodejs.org
goto failed
:failed
echo.
echo Export did not complete. Read the error above.
pause
exit /b 1
