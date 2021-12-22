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
    exec('python3 -m apollo -h', (err, _stdout, stderr) => {
      if (err != null || stderr !== '') resolve(false);
      resolve(true);
    });
  });
};

const checkDeps = async (event: Electron.IpcMainEvent) => {
  event.reply(CHANNELS.DEPS_CHECKED, {
    python3: await python3Exists(),
    apollo: await apolloExists(),
  });
};

export default checkDeps;
