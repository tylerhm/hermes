const { contextBridge, ipcRenderer } = require('electron');
const CHANNELS = require('./channels');

const validChannels = Object.values(CHANNELS);
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    getChannels() {
      return CHANNELS;
    },
    setFile(key) {
      ipcRenderer.send(CHANNELS.SELECT_FILE, key);
    },
    on(channel, func) {
      // Deliberately strip event as it includes `sender`
      if (validChannels.includes(channel))
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    once(channel, func) {
      if (validChannels.includes(channel))
        ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
    removeListener(channel, func) {
      if (validChannels.includes(channel))
        ipcRenderer.removeListener(channel, (event, ...args) => func(...args));
    },
  },
});
