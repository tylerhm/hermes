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

const isWSL = () => {
  return new Promise<boolean>((resolve) => {
    exec('uname -r', (_err, stdout) => {
      resolve(stdout.toLowerCase().includes('microsoft'));
    });
  });
};

const checkDeps = async (event: Electron.IpcMainEvent) => {
  event.reply(CHANNELS.DEPS_CHECKED, {
    python3: await python3Exists(),
    apollo: await apolloExists(),
    xdgOpen: (await isWSL()) ? await xdgOpenExists() : true,
  });
};

export default checkDeps;
