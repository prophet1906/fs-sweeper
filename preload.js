const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld(
  'electron',
  {
    readConfig: () => ipcRenderer.sendSync('read-config'),
    writeConfig: (config) => ipcRenderer.sendSync('write-config', { config }),
    readLogs: () => ipcRenderer.sendSync('read-logs'),
    readInstructions: () => ipcRenderer.sendSync('read-instructions'),
    reconfigureSweeper: () => ipcRenderer.sendSync('reconfigure-sweeper'),
  }
)