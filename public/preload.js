const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  checkNmap: () => ipcRenderer.invoke('check-nmap'),
  discoverNetwork: () => ipcRenderer.invoke('discover-network'),
  scanDevice: (ip) => ipcRenderer.invoke('scan-device', ip),
});