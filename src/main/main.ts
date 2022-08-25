/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import CHANNELS from './channels';
import {
  selectFile,
  judge,
  setTimeLimit,
  openCaseInfo,
  setMultiCaseCheckerType,
  setCustomInvocationCheckerType,
  setEpsilon,
  requestFromStore,
  setIsCustomInvocation,
  setCustomInvocationInput,
  setCppStandard,
} from './runner/judge';
import { clearCache, touchCache } from './utils';
import { checkDeps, installDep } from './depHandler';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

// Subscribe to events
ipcMain.on(CHANNELS.REQUEST_FROM_STORE, requestFromStore);
ipcMain.on(CHANNELS.CHECK_DEPS, checkDeps);
ipcMain.on(CHANNELS.SELECT_FILE, selectFile);
ipcMain.on(CHANNELS.SET_TIME_LIMIT, setTimeLimit);
ipcMain.on(CHANNELS.SET_MULTI_CASE_CHECKER_TYPE, setMultiCaseCheckerType);
ipcMain.on(
  CHANNELS.SET_CUSTOM_INVOCATION_CHECKER_TYPE,
  setCustomInvocationCheckerType
);
ipcMain.on(CHANNELS.SET_EPSILON, setEpsilon);
ipcMain.on(CHANNELS.SET_IS_CUSTOM_INVOCATION, setIsCustomInvocation);
ipcMain.on(CHANNELS.SET_CUSTOM_INVOCATION_INPUT, setCustomInvocationInput);
ipcMain.on(CHANNELS.SET_CPP_STANDARD, setCppStandard);
ipcMain.on(CHANNELS.JUDGE, judge);
ipcMain.on(CHANNELS.OPEN_CASE_INFO, openCaseInfo);
ipcMain.on(CHANNELS.INSTALL_DEP, installDep);

// Clear our cache, and then make sure it exists
clearCache();
touchCache();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 450,
    height: 600,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
