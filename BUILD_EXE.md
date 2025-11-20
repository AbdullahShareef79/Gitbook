# Building DevSocial Desktop Installer (.exe)

Complete guide to building a Windows executable installer for DevSocial.

## 🎯 What You Get

After building, you'll have:

1. **`DevSocial-Setup-1.0.0.exe`** (Main Installer)
   - Full Windows installer with wizard
   - Creates desktop and start menu shortcuts
   - Proper uninstaller
   - ~150 MB

2. **`DevSocial-Portable-1.0.0.exe`** (Portable Version)
   - No installation required
   - Run from anywhere (USB, Desktop, etc.)
   - Settings stored in app folder
   - ~150 MB

## 🚀 Quick Build

### Step 1: Navigate to Desktop App
```powershell
cd apps\desktop
```

### Step 2: Install Dependencies
```powershell
pnpm install
```

### Step 3: Build Installers
```powershell
pnpm build:win
```

Or use the batch file:
```cmd
.\build-installer.bat
```

### Step 4: Find Your Installers
```
apps\desktop\dist\
├── DevSocial-Setup-1.0.0.exe          (Full Installer)
├── DevSocial-Portable-1.0.0.exe       (Portable)
└── win-unpacked\                      (Raw files)
```

## 📦 Distribution

### For End Users

Share the installer files:
1. Upload `DevSocial-Setup-1.0.0.exe` to your releases
2. Users download and double-click
3. Follow installation wizard
4. Done!

### For Testing

Use the portable version:
- No admin rights needed
- No installation required
- Perfect for testing

## 🛠️ Build Options

### Full Installer Only
```powershell
pnpm exec electron-builder --win nsis
```

### Portable Only
```powershell
pnpm build:portable
```

### Pack Without Installer
```powershell
pnpm pack
```
This creates `win-unpacked/` folder with all files.

## ⚙️ Customization

### Change App Name
Edit `apps/desktop/package.json`:
```json
{
  "build": {
    "productName": "Your App Name"
  }
}
```

### Change Version
```json
{
  "version": "1.0.0"
}
```

### Add/Remove Features

Edit `package.json` > `build` > `nsis`:
```json
{
  "nsis": {
    "oneClick": false,                     // Wizard vs one-click
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "runAfterFinish": true                 // Launch after install
  }
}
```

### Custom Icon

1. Create/find a PNG logo (512x512)
2. Convert to ICO with multiple sizes:
   - Online: https://convertico.com/
   - Or use ImageMagick: `magick convert logo.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico`
3. Save as `apps/desktop/assets/icon.ico`
4. Rebuild

## 🎨 Branding

### Installer Icon
Replace `apps/desktop/assets/icon.ico`

### App Window Icon
Same file is used for window icon

### Installer Background (Optional)
Add to `package.json`:
```json
{
  "nsis": {
    "installerSidebar": "assets/installer-sidebar.bmp",  // 164x314
    "uninstallerSidebar": "assets/installer-sidebar.bmp"
  }
}
```

## 🔐 Code Signing (Optional)

To avoid "Windows protected your PC" warning:

### Get Certificate
1. Purchase code signing certificate (~$100-400/year)
2. From: DigiCert, Sectigo, GlobalSign, etc.

### Sign During Build
```powershell
# Set environment variables
$env:CSC_LINK="path\to\certificate.pfx"
$env:CSC_KEY_PASSWORD="your-password"

# Build with signing
pnpm build:win
```

Or use Azure Key Vault, etc. See: https://www.electron.build/code-signing

### Without Certificate
Users will see security warning but can still install:
1. Click "More info"
2. Click "Run anyway"

## 📋 Requirements

### Build Machine
- Windows 10/11
- Node.js 18+
- pnpm
- ~500 MB free space

### Target Users
- Windows 10/11 (64-bit)
- ~150 MB disk space
- No other requirements

## 🧪 Testing

### Test the Installer
```powershell
# Build
pnpm build:win

# Install
cd dist
.\DevSocial-Setup-1.0.0.exe

# Test the app
# Then uninstall via Windows Settings
```

### Test Portable Version
```powershell
cd dist
.\DevSocial-Portable-1.0.0.exe
# Just run it - no installation
```

### Development Mode
```powershell
# Run without building
pnpm start

# This is much faster for testing
```

## 🔧 Advanced Configuration

### Multiple Architectures
```json
{
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64", "ia32", "arm64"]
      }
    ]
  }
}
```

### Compression Level
```json
{
  "nsis": {
    "compression": "maximum"  // or "normal", "store"
  }
}
```

### Per-User vs Per-Machine Install
```json
{
  "nsis": {
    "perMachine": false  // true = requires admin
  }
}
```

## 📤 Auto-Updates

### Setup GitHub Releases
1. Edit `package.json`:
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "AbdullahShareef79",
      "repo": "Gitbook"
    }
  }
}
```

2. Set GitHub token:
```powershell
$env:GH_TOKEN="your-github-token"
```

3. Build and publish:
```powershell
pnpm build:win --publish always
```

### How It Works
- App checks for updates on startup
- Downloads updates in background
- Prompts user to restart
- Updates installed on next launch

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module 'electron'"**
```powershell
rm -rf node_modules
pnpm install
```

**Error: "Icon not found"**
- Add icon.ico to `assets/` folder
- Or remove icon references from package.json temporarily

**Out of Memory**
```powershell
# Increase Node memory
$env:NODE_OPTIONS="--max-old-space-size=4096"
pnpm build:win
```

### Large File Size

Installer is ~150 MB because it includes:
- Electron runtime (~100 MB)
- Node.js runtime
- Chromium browser
- Your app code

To reduce:
1. Remove unused dependencies
2. Use `asar` packaging (enabled by default)
3. Enable compression in NSIS options

### Slow Build

First build is slow (~5-10 minutes). Subsequent builds are faster.

To speed up:
```powershell
# Build without compression
pnpm exec electron-builder --win nsis --config.nsis.compression=store
```

## 📊 Build Output Explained

```
dist/
├── DevSocial-Setup-1.0.0.exe          # Main installer (NSIS)
├── DevSocial-Setup-1.0.0.exe.blockmap # Update metadata
├── DevSocial-Portable-1.0.0.exe       # Portable version
├── latest.yml                         # Auto-update manifest
└── win-unpacked/                      # Unpacked app files
    ├── DevSocial.exe                  # Main executable
    ├── resources/                     # App resources
    └── ...
```

## 🎯 Checklist Before Release

- [ ] Updated version in `package.json`
- [ ] Added custom icon
- [ ] Tested installer
- [ ] Tested portable version
- [ ] Tested on clean Windows machine
- [ ] Prepared release notes
- [ ] (Optional) Code signed
- [ ] (Optional) Setup auto-updates

## 📚 Resources

- **Electron Builder**: https://www.electron.build/
- **NSIS Options**: https://www.electron.build/configuration/nsis
- **Code Signing**: https://www.electron.build/code-signing
- **Auto Updates**: https://www.electron.build/auto-update

---

## 🎉 Example Build Session

```powershell
# Navigate to desktop app
cd apps\desktop

# Install dependencies
pnpm install

# Build installers
pnpm build:win

# Output:
# ⠋ Compiling TypeScript...
# ⠋ Packaging for Windows...
# ⠋ Building NSIS installer...
# ✓ Built: dist\DevSocial-Setup-1.0.0.exe
# ✓ Built: dist\DevSocial-Portable-1.0.0.exe
# Done in 5m 23s

# Test it!
cd dist
.\DevSocial-Setup-1.0.0.exe
```

**That's it! You now have a distributable Windows installer! 🚀**
