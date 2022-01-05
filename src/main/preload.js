const { contextBridge, ipcRenderer } = require('electron');
const CHANNELS = require('./channels');

const validChannels = Object.values(CHANNELS);
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    requestFromStore(key) {
      ipcRenderer.send(CHANNELS.REQUEST_FROM_STORE, key);
    },
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
    setCheckerType(checkerType) {
      ipcRenderer.send(CHANNELS.SET_CHECKER_TYPE, checkerType);
    },
    setEpsilon(epsilon) {
      ipcRenderer.send(CHANNELS.SET_EPSILON, epsilon);
    },
    setIsCustomInvocation(isCustomInvocation) {
      ipcRenderer.send(CHANNELS.SET_IS_CUSTOM_INVOCATION, isCustomInvocation);
    },
    setCustomInvocationInput(customInvocationInput) {
      ipcRenderer.send(
        CHANNELS.SET_CUSTOM_INVOCATION_INPUT,
        customInvocationInput
      );
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
