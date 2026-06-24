const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('licenseApi', {
  getMachineId: () => ipcRenderer.invoke('get-machine-id')
});
