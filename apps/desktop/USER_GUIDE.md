# DevSocial Desktop - Quick Start Guide

## For Users: Installing DevSocial Desktop

### Option 1: Full Installer (Recommended)
1. Download `DevSocial-Setup-1.0.0.exe`
2. Double-click the file
3. Follow the installation wizard
4. Click "Install"
5. Launch DevSocial from:
   - Desktop shortcut
   - Start Menu
   - Search "DevSocial"

### Option 2: Portable Version
1. Download `DevSocial-Portable-1.0.0.exe`
2. Place it anywhere (Desktop, USB drive, etc.)
3. Double-click to run
4. No installation needed!

## First Launch

When you first open DevSocial Desktop:

1. **Choose Connection Mode:**
   - **Local Server** (Default): Connect to locally running servers
     - Make sure to run `pnpm dev` in the main project first
   - **Remote Server**: Connect to hosted version

2. **Configure Settings** (Optional):
   - Go to `File > Settings`
   - Set your API URL (default: `http://localhost:4000`)
   - Set your Web URL (default: `http://localhost:3000`)

## Using DevSocial Desktop

### Basic Operations

- **Reload Page**: `Ctrl + R` or `View > Reload`
- **Zoom In**: `Ctrl + +`
- **Zoom Out**: `Ctrl + -`
- **Reset Zoom**: `Ctrl + 0`
- **Fullscreen**: `F11`
- **Settings**: `Ctrl + ,`
- **Quit**: `Ctrl + Q`

### Settings

Access settings via `File > Settings` or press `Ctrl + ,`

**Available Settings:**
- ☑️ Use Local Server - Connect to local development servers
- 🌐 Web URL - Frontend application URL
- 🔌 API URL - Backend API URL
- 🪟 Window Preferences - Automatically saved

### Updates

DevSocial Desktop checks for updates automatically:
- On startup
- Via `Help > Check for Updates`

When an update is available:
1. It downloads in the background
2. You'll see a notification
3. Click "Restart" to install

## Running Local Servers

To use DevSocial Desktop with local servers:

1. **Open Terminal/PowerShell**
2. **Navigate to project:**
   ```bash
   cd path\to\gitbook
   ```
3. **Start all services:**
   ```bash
   pnpm dev
   ```
4. **Wait for servers to start:**
   - API: http://localhost:4000
   - Web: http://localhost:3000
   - Collab: http://localhost:3001
5. **Open DevSocial Desktop**

## Troubleshooting

### "Can't connect to server"

**Solution 1 - Start Local Servers:**
```bash
cd path\to\gitbook
pnpm dev
```

**Solution 2 - Check Settings:**
1. Open `File > Settings`
2. Verify URLs:
   - Web URL: `http://localhost:3000`
   - API URL: `http://localhost:4000`
3. Check "Use Local Server" is enabled

**Solution 3 - Check Firewall:**
- Allow DevSocial through Windows Firewall
- Allow Node.js through Windows Firewall

### "Windows protected your PC" Warning

This appears for unsigned apps:
1. Click "More info"
2. Click "Run anyway"

To avoid this, the app needs to be code-signed (requires certificate).

### App Won't Launch

1. **Check System Requirements:**
   - Windows 10 or Windows 11
   - 150 MB free disk space

2. **Reinstall:**
   - Uninstall via Windows Settings > Apps
   - Download fresh installer
   - Install again

3. **Run as Administrator:**
   - Right-click installer
   - Select "Run as administrator"

### Features Not Working

1. **Reload the app:** `Ctrl + R`
2. **Check browser console:** `F12` > Console tab
3. **Verify servers are running:** Visit http://localhost:3000 in browser
4. **Reset settings:**
   - `File > Settings`
   - Click "Reset"
   - Restart app

### Uninstalling

**Full Installation:**
1. Open Windows Settings
2. Go to Apps > Installed apps
3. Find "DevSocial"
4. Click "..." > Uninstall

**Portable Version:**
- Just delete the .exe file

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + ,` | Open Settings |
| `Ctrl + Q` | Quit Application |
| `Ctrl + R` | Reload Page |
| `Ctrl + Shift + R` | Force Reload |
| `Ctrl + +` | Zoom In |
| `Ctrl + -` | Zoom Out |
| `Ctrl + 0` | Reset Zoom |
| `F11` | Toggle Fullscreen |
| `F12` | Toggle Developer Tools |

## System Requirements

- **OS**: Windows 10 (64-bit) or Windows 11
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 150 MB for app + space for data
- **Internet**: Required for remote mode

## Data Storage

**Settings Location:**
```
C:\Users\<YourName>\AppData\Roaming\devsocial-desktop\
```

**What's Stored:**
- Window size and position
- Server URLs
- User preferences

**To Reset:**
- Delete the folder above, or
- Use "Reset" button in Settings

## Getting Help

- 📖 **Documentation**: `Help > Documentation`
- 🐛 **Report Bug**: `Help > Report Issue`
- ❓ **GitHub Issues**: https://github.com/AbdullahShareef79/Gitbook/issues

## Advanced: Connecting to Remote Server

To use with a deployed server:

1. Open Settings (`Ctrl + ,`)
2. Uncheck "Use Local Server"
3. Set Web URL to your deployment:
   ```
   https://your-devsocial.app
   ```
4. Set API URL to your API:
   ```
   https://api.your-devsocial.app
   ```
5. Click "Save"
6. Reload the app (`Ctrl + R`)

## Tips & Tricks

✨ **Pin to Taskbar**: Right-click icon > Pin to taskbar

✨ **Multiple Instances**: You can run multiple windows if needed

✨ **Portable Setup**: Use portable version on USB for travel

✨ **Development**: Use Developer Tools (`F12`) to debug

## Privacy

DevSocial Desktop:
- ✅ Does NOT collect analytics
- ✅ Does NOT track usage
- ✅ Only connects to servers you specify
- ✅ Stores settings locally on your PC

## License

Same as the main DevSocial project.
Open source and free to use!

---

**Enjoy using DevSocial Desktop! 🚀**

For more information, visit: https://github.com/AbdullahShareef79/Gitbook
