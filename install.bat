@echo off
REM DevSocial Quick Installer for Windows
REM This is a wrapper that launches the PowerShell installer

echo ========================================
echo    DevSocial Quick Installer
echo ========================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not found!
    echo Please ensure PowerShell is installed.
    pause
    exit /b 1
)

echo Launching PowerShell installer...
echo.
echo If you see a security warning, choose "Run" or "Allow"
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0install.ps1"

REM Check if the script ran successfully
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installation encountered an error.
    pause
    exit /b 1
)

exit /b 0
