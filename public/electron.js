const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const nmapDetector = require('./nmap-detector');
const nmapScanner = require('./nmap-scanner');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-features', 'AudioServiceOutOfProcess');
app.commandLine.appendSwitch('ffmpeg-path', '');


const isDev = process.env.ELECTRON_IS_DEV === '1';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    backgroundColor: '#0f0f23',
    vibrancy: 'ultra-dark',
    backgroundMaterial: 'acrylic',
    transparent: false,
    hasShadow: true,
    roundedCorners: true
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    mainWindow.setOpacity(0);
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.05;
      mainWindow.setOpacity(opacity);
      if (opacity >= 1) {
        clearInterval(fadeIn);
      }
    }, 16);
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('window-minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('Minimizing window');
    mainWindow.minimize();
    return true;
  }
  return false;
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('Toggling maximize state');
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return mainWindow.isMaximized();
  }
  return false;
});

ipcMain.handle('window-close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('Closing window');
    mainWindow.close();
    return true;
  }
  return false;
});

ipcMain.handle('window-is-maximized', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow.isMaximized();
  }
  return false;
});

ipcMain.handle('check-nmap', async () => {
  try {
    console.log('Checking Nmap availability...');
    const result = await nmapDetector.findNmapCommand();
    console.log('Nmap check result:', result !== null);
    return result !== null;
  } catch (error) {
    console.error('Error checking Nmap:', error);
    return false;
  }
});

ipcMain.handle('discover-network', async () => {
  try {
    console.log('Starting network discovery...');
    const result = await nmapScanner.discoverNetwork();
    
    if (result && typeof result === 'object') {
      if (Array.isArray(result)) {
        console.log(`Network discovery complete: ${result.length} devices found`);
        return {
          devices: result,
          networkInfo: null
        };
      } else if (result.devices) {
        console.log(`Network discovery complete: ${result.devices.length} devices found`);
        if (result.warning) {
          console.log(`Warning: ${result.warning}`);
        }
        return result;
      }
    }
    
    console.log('Network discovery returned unexpected format:', result);
    return {
      devices: [],
      warning: 'NETWORK_CONFIG_ERROR',
      networkInfo: null
    };
    
  } catch (error) {
    console.error('Network discovery error:', error);
    
    if (error.message === 'NETWORK_DISCONNECTED') {
      throw new Error('NETWORK_DISCONNECTED');
    } else if (error.message === 'PUBLIC_IP_DETECTED') {
      throw new Error('PUBLIC_IP_DETECTED');
    } else if (error.message === 'NO_VALID_INTERFACE') {
      throw new Error('NO_VALID_INTERFACE');
    } else if (error.message === 'NETWORK_CONFIG_ERROR') {
      throw new Error('NETWORK_CONFIG_ERROR');
    } else {
      throw error;
    }
  }
});

ipcMain.handle('scan-device', async (event, ip) => {
  try {
    console.log(`Starting device scan for: ${ip}`);
    const result = await nmapScanner.scanDevice(ip);
    console.log(`Device scan complete for ${ip}`);
    return result;
  } catch (error) {
    console.error(`Device scan error for ${ip}:`, error);
    throw error;
  }
});
