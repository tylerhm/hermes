const { contextBridge, ipcRenderer } = require('electron');

const validChannels = ['renderer-select-file', 'main-file-selected'];
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    setFile(key) {
      ipcRenderer.send('renderer-select-file', key);
    },
    on(channel, func) {
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
    removeListener(channel, func) {
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, (event, ...args) => func(...args));
      }
    },
  },
});
