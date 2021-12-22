const { contextBridge, ipcRenderer } = require('electron');
const CHANNELS = require('./channels');

const validChannels = Object.values(CHANNELS);
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    checkDeps() {
      ipcRenderer.send(CHANNELS.CHECK_DEPS);
    },
    installDep(dep, installType, packageName) {
      ipcRenderer.send(CHANNELS.INSTALL_DEP, dep, installType, packageName);
    },
    setFile(key, isDirectory) {
      ipcRenderer.send(CHANNELS.SELECT_FILE, key, isDirectory);
    },
    setTimeLimit(limit) {
      ipcRenderer.send(CHANNELS.SET_TIME_LIMIT, limit);
    },
    judge() {
      ipcRenderer.send(CHANNELS.JUDGE);
    },
    openCaseInfo(caseID, infoType) {
      ipcRenderer.send(CHANNELS.OPEN_CASE_INFO, caseID, infoType);
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
