// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    // Whitelist channels
    let validChannels = ['open-codigos-window'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});