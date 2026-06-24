@echo off
title Build Dispatcher Summary V3
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js LTS from https://nodejs.org first.
  pause
  exit /b 1
)
call npm install
call npm run dist
echo.
echo Finished. Your installer will be inside the dist folder.
pause
