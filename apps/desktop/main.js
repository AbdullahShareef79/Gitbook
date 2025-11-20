const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');

const store = new Store();
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let serverProcess;

// Default configuration
const DEFAULT_CONFIG = {
  apiUrl: 'http://localhost:4000',
  webUrl: 'http://localhost:3000',
  useLocalServer: true,
  windowBounds: { width: 1200, height: 800 }
};

function createWindow() {
  const config = { ...DEFAULT_CONFIG, ...store.get('config', {}) };
  const bounds = config.windowBounds;

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    autoHideMenuBar: false,
    title: 'DevSocial'
  });

  // Save window bounds on resize
  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds();
    store.set('config.windowBounds', bounds);
  });

  // Load the app
  const startUrl = config.useLocalServer 
    ? config.webUrl 
    : 'https://devsocial.app'; // Replace with your production URL

  mainWindow.loadURL(startUrl);

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Handle navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(startUrl)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // Show settings window
            showSettings();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://github.com/AbdullahShareef79/Gitbook');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/AbdullahShareef79/Gitbook/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'About DevSocial',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About DevSocial',
              message: 'DevSocial',
              detail: `Version: ${app.getVersion()}\nA social platform for developers\n\n© 2025 DevSocial`,
              buttons: ['OK']
            });
          }
        },
        {
          label: 'Check for Updates',
          click: () => {
            checkForUpdates();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showSettings() {
  const config = { ...DEFAULT_CONFIG, ...store.get('config', {}) };

  const settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'renderer/settings.html'));
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  // Send current config to settings window
  settingsWindow.webContents.on('did-finish-load', () => {
    settingsWindow.webContents.send('config', config);
  });
}

function checkForUpdates() {
  if (isDev) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Updates',
      message: 'Updates are disabled in development mode.',
      buttons: ['OK']
    });
    return;
  }

  autoUpdater.checkForUpdatesAndNotify();
}

// IPC Handlers
ipcMain.handle('get-config', () => {
  return { ...DEFAULT_CONFIG, ...store.get('config', {}) };
});

ipcMain.handle('save-config', (event, config) => {
  store.set('config', { ...store.get('config', {}), ...config });
  return true;
});

ipcMain.handle('reset-config', () => {
  store.clear();
  return DEFAULT_CONFIG;
});

// Auto updater events
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: 'A new version is available. It will be downloaded in the background.',
    buttons: ['OK']
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update downloaded. The application will restart to install the update.',
    buttons: ['Restart', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Check for updates on startup (production only)
  if (!isDev) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Cleanup
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Error', `An error occurred: ${error.message}`);
});
