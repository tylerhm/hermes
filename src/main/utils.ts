/* eslint global-require: off, no-console: off, promise/always-return: off */

import Store from 'electron-store';
import { c, cpp, python, java } from 'compile-run';
import { dialog } from 'electron';
import CHANNELS from './channels';

const find = require('find');
const read = require('read-file');

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
  const search = new RegExp(`.*\\.${ext}`, 'g');
  return new Promise((resolve) => {
    find.file(search, dataDir, resolve);
  });
};

const getFileContents = (absPath: string) => {
  return new Promise((resolve, reject) => {
    read(absPath, { normalize: true }, (err: Error, buffer: string) => {
      if (err != null) reject(err);
      resolve(buffer);
    });
  });
};

export const judge = async (event: Electron.IpcMainEvent) => {
  const source = store.get('source', null) as string;
  const data = store.get('data', null) as string;

  // TODO: warn user
  if (source == null || data == null) {
    return;
  }

  // Get inputs and outputs from data dir
  const inputs = (await findByExtension(data, 'in')) as Array<string>;
  // const outputs = (await findByExtension(data, 'out')) as Array<string>;

  const ext = getExtension(source);
  let runner = cpp;
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
    // TODO: warn user
    default:
  }

  inputs.forEach(async (input) => {
    runner?.runFile(
      source,
      { stdin: (await getFileContents(input)) as string },
      (err, res) => {
        console.log({ err, res });
      }
    );
  });

  event.reply(CHANNELS.DONE_JUDGING);
};
