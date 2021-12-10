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

const getFileNameFromPath = (filePath: string) => {
  return filePath.split('\\').pop()?.split('/').pop();
};

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
        store.set(key, filePath);
        event.reply(CHANNELS.FILE_SELECTED, key, getFileNameFromPath(filePath));
      }
    })
    .catch((err) => console.error(err));
};

const getExtension = (path: string) => {
  return path.split('.').pop();
};

const findByExtension = (dataDir: string, ext: string) => {
  const search = new RegExp(`.*\\.${ext}`, 'g');
  return new Promise<Array<string>>((resolve) => {
    find.file(search, dataDir, resolve);
  });
};

const getFileContents = (absPath: string) => {
  return new Promise<string>((resolve, reject) => {
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
  const inputs = (await findByExtension(data, 'in')).map((path) => {
    return path.split('.')[0];
  });
  const outputs = (await findByExtension(data, 'out')).map((path) => {
    return path.split('.')[0];
  });

  const allCasesValid = inputs.every((path) => {
    return outputs.includes(path);
  });

  if (!allCasesValid) {
    event.reply(CHANNELS.INVALID_JUDGE_DATA);
    return;
  }

  // Begin judging
  event.reply(CHANNELS.FOUND_CASES);

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
    const inputPath = input.concat('.in');
    const outputPath = input.concat('.out');
    const outputData = await getFileContents(outputPath);
    runner?.runFile(
      source,
      { stdin: await getFileContents(inputPath) },
      (err, res) => {
        console.log({
          Case: input,
          Output: res?.stdout,
          JudgeOut: outputData,
          Error: err,
        });
      }
    );
  });

  event.reply(CHANNELS.DONE_JUDGING);
};
