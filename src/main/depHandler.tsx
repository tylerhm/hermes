/* eslint global-require: off, no-console: off, promise/always-return: off */
import { exec } from 'child_process';
import CHANNELS from './channels';

const python3Exists = () => {
  return new Promise<boolean>((resolve) => {
    exec('python3 --version', (err, _stdout, stderr) => {
      if (err != null || stderr !== '') resolve(false);
      resolve(true);
    });
  });
};

const apolloExists = () => {
  return new Promise<boolean>((resolve) => {
    exec('python3 -m apollo --help', (err, _stdout, stderr) => {
      if (err != null || stderr !== '') resolve(false);
      resolve(true);
    });
  });
};

const xdgOpenExists = () => {
  return new Promise<boolean>((resolve) => {
    exec('xdg-open --help', (err, _stdout, stderr) => {
      if (err != null || stderr !== '') resolve(false);
      resolve(true);
    });
  });
};

export const isWin = () => {
  return process.platform === 'win32';
};

const isWSL = () => {
  return new Promise<boolean>((resolve) => {
    exec('uname -r', (_err, stdout) => {
      resolve(stdout.toLowerCase().includes('wsl'));
    });
  });
};

const hasWSL = () => {
  return new Promise<boolean>((resolve) => {
    exec('wsl --version', (err) => {
      resolve(err == null);
    });
  });
};

export const checkDeps = async (event: Electron.IpcMainEvent) => {
  if (isWin() && !(await hasWSL()))
    event.reply(CHANNELS.DEPS_CHECKED, {
      'Python 3': true,
      Apollo: true,
      'xdg-open-wsl': true,
      wsl: false,
    });
  else
    event.reply(CHANNELS.DEPS_CHECKED, {
      'Python 3': await python3Exists(),
      Apollo: await apolloExists(),
      'xdg-open-wsl': (await isWSL()) ? await xdgOpenExists() : true,
      wsl: true,
    });
};

// Allowed room for more install types here for later
type InstallType = 'pip';
export const installDep = (
  event: Electron.IpcMainEvent,
  dep: string,
  installType: InstallType,
  packageName: string
) => {
  let command: string;
  switch (installType) {
    case 'pip':
      command = `python3 -m pip install ${packageName} --upgrade`;
      break;
    default:
      console.error(`Unsupported installType: ${installType}`);
      return;
  }

  // True response if valid install
  exec(command, (err) => {
    event.reply(CHANNELS.DEP_INSTALLED, dep, err == null);
  });
};
