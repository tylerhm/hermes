/* eslint global-require: off, no-console: off, promise/always-return: off */

import Store from 'electron-store';
import { c, cpp, python, java } from 'compile-run';
import { exec } from 'child_process';
import { dialog } from 'electron';
import CHANNELS from './channels';
import runByOs from './osSpecific';

// Store for the main thread. Get rid of old data
const store = new Store();
store.clear();

// Open file dialog and save selections by key.
export const selectFile = async (
  event: Electron.IpcMainEvent,
  key: string,
  isDir: boolean
) => {
  dialog
    .showOpenDialog({
      properties: [isDir ? 'openDirectory' : 'openFile'],
    })
    .then((file) => {
      if (file.filePaths.length > 0) {
        const filePath = file.filePaths[0];
        const fileName = filePath.split('/').at(-1);

        store.set(key, filePath);
        event.reply(CHANNELS.FILE_SELECTED, key, fileName);
      }
    })
    .catch((err) => console.error(err));
};

const getExtension = (path: string) => {
  return path.split('.').pop();
};

const findByExtension = (dataDir: string, ext: string) => {
  const find = `*.${ext}`;
  const findLinux = new Promise((resolve, reject) => {
    const command = `find ${dataDir} -name "${find}"`;
    const parse = (stdout: string) => {
      return stdout.split('\n').slice(0, -1);
    };
    exec(command, (err, stdout, stderr) => {
      if (err != null) reject(stderr);
      resolve(parse(stdout));
    });
  });

  const findWin = new Promise((resolve, reject) => {
    const command = `dir ${dataDir} "${find}" \b`;
    const parse = (stdout: string) => {
      return stdout
        .split('\n')
        .slice(0, -1)
        .map((file) => {
          return `${dataDir}/${file}`;
        });
    };
    exec(command, (err, stdout, stderr) => {
      if (err != null) reject(stderr);
      resolve(parse(stdout));
    });
  });

  return runByOs(findLinux, findWin) as Promise<string>;
};

export const judge = async (event: Electron.IpcMainEvent) => {
  const source = store.get('source', null) as string;
  const data = store.get('data', null) as string;

  // TODO: warn user
  if (source == null || data == null) {
    return;
  }

  // Get inputs and outputs from data dir
  const inputs = await findByExtension(data, 'in');
  const outputs = await findByExtension(data, 'out');

  console.log(inputs);
  console.log(outputs);

  const ext = getExtension(source);
  let runner;
  switch (ext) {
    case 'c':
      runner = c;
      break;
    case 'cpp':
      runner = cpp;
      break;
    case 'java':
      runner = java;
      break;
    case 'py':
      runner = python;
      break;
    default:
      runner = null;
  }

  // TODO: Warn user
  if (runner == null) {
    return;
  }

  const res = await runner.runFile(source, { stdin: 'test' });
  console.log(res);

  event.reply(CHANNELS.DONE_JUDGING);
};
