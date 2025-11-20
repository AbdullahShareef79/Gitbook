@echo off
REM Build DevSocial Desktop Application for Windows

echo ========================================
echo   Building DevSocial Desktop App
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Must run from apps/desktop directory
    echo.
    echo Usage:
    echo   cd apps\desktop
    echo   .\build-installer.bat
    pause
    exit /b 1
)

echo Step 1: Installing dependencies...
call pnpm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Building Windows installer...
call pnpm build:win
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Installers created in dist\ folder:
echo.
dir /b dist\*.exe 2>nul
echo.
echo You can now distribute these files to users.
echo.
pause
