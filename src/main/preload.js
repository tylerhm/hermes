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
    setChecker(checker) {
      ipcRenderer.send(CHANNELS.SET_CHECKER, checker);
    },
    setEpsilon(epsilon) {
      ipcRenderer.send(CHANNELS.SET_EPSILON, epsilon);
    },
    judge() {
      ipcRenderer.send(CHANNELS.JUDGE);
    },
    openCaseInfo(caseID, infoType) {
      ipcRenderer.send(CHANNELS.OPEN_CASE_INFO, caseID, infoType);
    },
    on(channel, func) {
      // Deliberately strip event as it includes `sender`
      if (validChannels.includes(channel)) {
        const subscription = (event, ...args) => func(...args);
        ipcRenderer.on(channel, subscription);
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      }
      return () => {};
    },
    once(channel, func) {
      if (validChannels.includes(channel))
        ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
  },
});
