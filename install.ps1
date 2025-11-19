# DevSocial Windows Installer
# Run this script with: powershell -ExecutionPolicy Bypass -File install.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DevSocial Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator. Some features may not work." -ForegroundColor Yellow
    Write-Host "For best results, run PowerShell as Administrator." -ForegroundColor Yellow
    Write-Host ""
}

# Function to check if a command exists
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
}

# Function to get version
function Get-Version($command, $versionArg) {
    try {
        $version = & $command $versionArg 2>&1 | Select-Object -First 1
        return $version
    } catch {
        return "Unable to determine"
    }
}

Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
if (Test-Command "node") {
    $nodeVersion = Get-Version "node" "--version"
    Write-Host " Found: $nodeVersion" -ForegroundColor Green
    
    # Check if version is >= 18
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber -split '\.')[0]
    if ($majorVersion -lt 18) {
        Write-Host "   WARNING: Node.js 18+ is recommended. Current: $nodeVersion" -ForegroundColor Yellow
    }
} else {
    Write-Host " Not found" -ForegroundColor Red
    Write-Host "   Please install Node.js 18+ from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   After installation, restart this script." -ForegroundColor Yellow
    exit 1
}

# Check pnpm
Write-Host "Checking pnpm..." -NoNewline
if (Test-Command "pnpm") {
    $pnpmVersion = Get-Version "pnpm" "--version"
    Write-Host " Found: $pnpmVersion" -ForegroundColor Green
} else {
    Write-Host " Not found" -ForegroundColor Red
    Write-Host "   Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   pnpm installed successfully" -ForegroundColor Green
    } else {
        Write-Host "   Failed to install pnpm" -ForegroundColor Red
        exit 1
    }
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -NoNewline
if (Test-Command "psql") {
    $pgVersion = Get-Version "psql" "--version"
    Write-Host " Found: $pgVersion" -ForegroundColor Green
} else {
    Write-Host " Not found" -ForegroundColor Yellow
    Write-Host "   PostgreSQL is required. Options:" -ForegroundColor Yellow
    Write-Host "   1. Install PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "   2. Use Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Do you want to continue without PostgreSQL? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Check Docker (optional)
Write-Host "Checking Docker..." -NoNewline
if (Test-Command "docker") {
    $dockerVersion = Get-Version "docker" "--version"
    Write-Host " Found: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host " Not found (optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Running pnpm install..." -ForegroundColor Cyan
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Check for .env files
Write-Host "Step 3: Checking configuration files..." -ForegroundColor Green
Write-Host ""

$envFiles = @(
    @{Path="apps\api\.env"; Template="apps\api\.env.example"},
    @{Path="apps\web\.env.local"; Template="apps\web\.env.local.example"},
    @{Path="apps\collab\.env"; Template="apps\collab\.env.example"}
)

foreach ($envFile in $envFiles) {
    Write-Host "Checking $($envFile.Path)..." -NoNewline
    if (Test-Path $envFile.Path) {
        Write-Host " Exists" -ForegroundColor Green
    } else {
        Write-Host " Missing" -ForegroundColor Yellow
        if (Test-Path $envFile.Template) {
            Write-Host "   Creating from template: $($envFile.Template)" -ForegroundColor Cyan
            Copy-Item $envFile.Template $envFile.Path
            Write-Host "   Created - Please edit $($envFile.Path) with your settings" -ForegroundColor Green
        } else {
            Write-Host "   WARNING: Template not found: $($envFile.Template)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Step 4: Setting up database..." -ForegroundColor Green
Write-Host ""

if (Test-Path "apps\api\.env") {
    Write-Host "Would you like to run database migrations now? (Y/n)" -NoNewline
    $runMigrations = Read-Host
    
    if ($runMigrations -eq "" -or $runMigrations -eq "y" -or $runMigrations -eq "Y") {
        Write-Host "Running Prisma migrations..." -ForegroundColor Cyan
        Set-Location "apps\api"
        pnpm prisma migrate deploy
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database migrations completed" -ForegroundColor Green
            
            Write-Host ""
            Write-Host "Would you like to seed the database with demo data? (y/N)" -NoNewline
            $seedDb = Read-Host
            
            if ($seedDb -eq "y" -or $seedDb -eq "Y") {
                Write-Host "Seeding database..." -ForegroundColor Cyan
                pnpm prisma db seed
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Database seeded successfully" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "Database migrations failed" -ForegroundColor Red
            Write-Host "   Please check your DATABASE_URL in apps\api\.env" -ForegroundColor Yellow
        }
        
        Set-Location "..\..\"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Edit configuration files if needed:" -ForegroundColor White
Write-Host "   - apps\api\.env" -ForegroundColor Gray
Write-Host "   - apps\web\.env.local" -ForegroundColor Gray
Write-Host "   - apps\collab\.env" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the development servers:" -ForegroundColor White
Write-Host "   pnpm dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Or start individual services:" -ForegroundColor White
Write-Host "   pnpm dev:api     # Backend API (port 4000)" -ForegroundColor Cyan
Write-Host "   pnpm dev:web     # Frontend (port 3000)" -ForegroundColor Cyan
Write-Host "   pnpm dev:collab  # Collab service (port 3001)" -ForegroundColor Cyan
Write-Host "   pnpm dev:worker  # Background worker" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Access the application:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more information, see:" -ForegroundColor White
Write-Host "   - README.md" -ForegroundColor Gray
Write-Host "   - DEPLOYMENT.md" -ForegroundColor Gray
Write-Host ""

# Create desktop shortcut (optional)
Write-Host ""
Write-Host "Would you like to create a desktop shortcut? (y/N)" -NoNewline
$createShortcuts = Read-Host

if ($createShortcuts -eq "y" -or $createShortcuts -eq "Y") {
    try {
        $currentPath = Get-Location
        $desktopPath = [Environment]::GetFolderPath("Desktop")
        
        # Create start script
        $batContent = "@echo off`r`ncd /d `"$currentPath`"`r`nstart cmd /k `"pnpm dev`""
        $startScriptPath = Join-Path $currentPath "start-devsocial.bat"
        Set-Content -Path $startScriptPath -Value $batContent -Encoding ASCII
        
        # Create shortcut
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut("$desktopPath\DevSocial.lnk")
        $Shortcut.TargetPath = $startScriptPath
        $Shortcut.WorkingDirectory = $currentPath
        $Shortcut.Description = "Start DevSocial"
        $Shortcut.Save()
        
        Write-Host " Desktop shortcut created" -ForegroundColor Green
    } catch {
        Write-Host " Failed to create shortcut: $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Installation complete! Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
