/* eslint no-await-in-loop: off, global-require: off, no-console: off, promise/always-return: off */
import { spawn } from 'child_process';
import { dialog } from 'electron';
import Store from 'electron-store';
import path from 'path';
import {
  getFileNameFromPath,
  findByExtension,
  getExtension,
  getLang,
  trimExtension,
  getCachePath,
} from '../utils';
import CHANNELS from '../channels';
import compile from './compile';

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
        store.set(key, filePath);
        event.reply(CHANNELS.FILE_SELECTED, key, getFileNameFromPath(filePath));
      }
    })
    .catch((err) => console.error(err));
};

// Set the time limit in the store
export const setTimeLimit = async (
  _event: Electron.IpcMainEvent,
  limit: number
) => {
  store.set('timeLimit', limit);
};

type VerdictType = 'AC' | 'PE' | 'WA' | 'TLE' | 'RTE' | 'INTERNAL_ERROR';
type ResponseType = {
  verdict: VerdictType;
  messages: Array<string>;
};
type ResultsType = {
  [inputId: string]: ResponseType;
};
export const judge = async (event: Electron.IpcMainEvent) => {
  /*
   * DATA COLLECTION
   */
  event.reply(CHANNELS.BEGIN_COLLECT_DATA);

  const source = store.get('source', null) as string | null;
  const data = store.get('data', null) as string | null;
  const timeLimit = store.get('timeLimit', 1) as number;

  if (source == null || data == null) {
    event.reply(CHANNELS.MISSING_INFO);
    return;
  }

  // Get inputs and outputs from data dir
  const inputs = (await findByExtension(data, 'in')).map((absPath) => {
    return trimExtension(absPath);
  });
  const outputs = (await findByExtension(data, 'out')).map((absPath) => {
    return trimExtension(absPath);
  });

  const allCasesValid = inputs.every((absPath) => {
    return outputs.includes(absPath);
  });

  if (!allCasesValid) {
    event.reply(CHANNELS.INVALID_DATA);
    return;
  }

  const inputIds = inputs.map((absPath) => {
    return getFileNameFromPath(absPath);
  });

  event.reply(CHANNELS.DONE_COLLECT_DATA, inputIds);

  /*
   * COMPILATION
   */
  event.reply(CHANNELS.BEGIN_COMPILING);

  const ext = getExtension(source);
  const lang = getLang(ext);

  // Compile the code
  let compiledPath: string;
  try {
    compiledPath = await compile(source, lang);
  } catch (err) {
    console.error(err);
    event.reply(CHANNELS.COMPILATION_ERROR);
    return;
  }

  event.reply(CHANNELS.DONE_COMPILING);

  /*
   * JUDGING
   */
  event.reply(CHANNELS.BEGIN_JUDGING);

  const judger = spawn(path.join(__dirname, 'fastJudge'), [
    getCachePath(),
    getFileNameFromPath(compiledPath),
    compiledPath,
    lang,
    inputIds.toString(),
    inputs.map((id) => id.concat('.in')).toString(),
    inputs.map((id) => id.concat('.out')).toString(),
    timeLimit.toString(),
    path.sep,
    path.join(__dirname, 'runguard'),
  ]);

  const results: ResultsType = inputs.reduce((curRes, absPath) => {
    return {
      ...curRes,
      [getFileNameFromPath(absPath)]: {
        verdict: 'UNKNOWN',
        messages: [],
      },
    };
  }, {});

  type MessageType = {
    inputId: string;
    verdict: VerdictType;
  };

  let numJudged = 0;
  judger.stdout.on('data', (msg) => {
    const message: MessageType = JSON.parse(msg.toString());
    results[message.inputId] = {
      verdict: message.verdict,
      messages: [message.verdict],
    };

    event.reply(CHANNELS.CASE_JUDGED, results);

    numJudged += 1;
    if (numJudged === inputs.length) event.reply(CHANNELS.DONE_JUDGING);
  });
};
