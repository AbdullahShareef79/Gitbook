# DevSocial Desktop Application

Desktop application for DevSocial built with Electron.

## Features

- 🖥️ Native Windows application
- 📦 Single-click installer
- 🔄 Auto-updates
- ⚙️ Configurable settings
- 🌐 Can connect to local or remote servers
- 🎨 Native window controls
- 📱 Responsive desktop UI

## Building the Desktop App

### Prerequisites

- Node.js 18+
- pnpm

### Development

```bash
cd apps/desktop
pnpm install
pnpm start
```

### Building Installers

#### Windows Installer (.exe)
```bash
pnpm build:win
```

This creates:
- `DevSocial-Setup-1.0.0.exe` - Full installer with NSIS
- `DevSocial-Portable-1.0.0.exe` - Portable version (no installation)

#### Just Package (no installer)
```bash
pnpm pack
```

### Output

Built files will be in `dist/` folder:
- `DevSocial-Setup-1.0.0.exe` - Main installer
- `DevSocial-Portable-1.0.0.exe` - Portable version
- `win-unpacked/` - Unpacked application files

## Configuration

The app stores configuration in:
- Windows: `%APPDATA%\devsocial-desktop\config.json`

Default settings:
```json
{
  "apiUrl": "http://localhost:4000",
  "webUrl": "http://localhost:3000",
  "useLocalServer": true
}
```

## Features

### Settings Window
Access via `File > Settings` or `Ctrl+,`

Configure:
- Local or remote server connection
- API URL
- Web URL
- Window preferences

### Menu Bar

**File**
- Settings (Ctrl+,)
- Quit (Ctrl+Q)

**Edit**
- Standard editing commands

**View**
- Reload (Ctrl+R)
- Force Reload
- Zoom controls
- Toggle Fullscreen (F11)
- Developer Tools (F12)

**Help**
- Documentation
- Report Issue
- Check for Updates
- About

### Auto-Updates

The app checks for updates automatically:
- On startup (after 3 seconds)
- Via "Help > Check for Updates"

Updates download in background and prompt for restart.

## Packaging Options

### NSIS Installer (Recommended)
- Standard Windows installer
- Installation directory selection
- Desktop & Start Menu shortcuts
- Uninstaller included
- App data preserved on update

### Portable Version
- No installation required
- Run from USB drive
- Settings stored in app folder
- Great for testing

## Customization

### Icons

Replace icons in `assets/` folder:
- `icon.png` - App icon (512x512 recommended)
- `icon.ico` - Windows icon (must include multiple sizes)

### Branding

Edit `package.json`:
- `productName` - Application name
- `description` - App description
- `copyright` - Copyright text

### Installer Options

Edit `package.json` > `build.nsis`:
- `oneClick` - Single-click install
- `allowToChangeInstallationDirectory` - Let user choose location
- `createDesktopShortcut` - Desktop shortcut
- `createStartMenuShortcut` - Start menu entry

## Distribution

### Manual Distribution
1. Build the installer: `pnpm build:win`
2. Share `dist/DevSocial-Setup-1.0.0.exe`
3. Users double-click to install

### Release Publishing

For auto-updates, configure in `package.json`:
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

Then publish releases:
```bash
pnpm build:win --publish always
```

## Troubleshooting

### "Windows protected your PC" Warning
- Click "More info" then "Run anyway"
- Or: Code sign your app with a certificate

### App Won't Start
- Check if ports 3000/4000 are available
- Run local servers first: `pnpm dev` in root
- Check settings via Settings window

### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules dist
pnpm install
pnpm build:win
```

### Icons Not Showing
- Ensure `icon.ico` is in `assets/` folder
- ICO file must contain multiple sizes (16, 32, 48, 256)
- Use online tool to convert PNG to ICO

## Development Tips

### Debug in Development
```bash
NODE_ENV=development pnpm start
```

This enables:
- Developer Tools open by default
- Verbose logging
- No auto-update checks

### Test Installer
```bash
pnpm build:win
# Install and test
# Then uninstall from Windows Settings
```

### Quick Reload
- Press `Ctrl+R` to reload the app
- Press `F12` to open Developer Tools

## Architecture

```
apps/desktop/
├── main.js          # Main process (Electron)
├── preload.js       # Preload script (bridge)
├── renderer/        # Renderer process (HTML/CSS/JS)
│   └── settings.html
├── assets/          # Icons and images
│   └── icon.ico
├── build/           # Build configuration
│   └── installer.nsh
└── package.json     # Electron & build config
```

## Requirements

**For Users:**
- Windows 10/11
- ~150 MB disk space
- Internet connection (for remote mode)

**For Building:**
- Node.js 18+
- pnpm
- Windows (for Windows builds)

## License

Same as the main DevSocial project.
