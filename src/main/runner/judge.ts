/* eslint no-await-in-loop: off, global-require: off, no-console: off, promise/always-return: off */

import { exec } from 'child_process';
import { dialog } from 'electron';
import Store from 'electron-store';
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
import run from './run';

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
type Response = {
  verdict: VerdictType;
  messages: Array<string>;
};
const check = (input: string, userOut: string, judgeOut: string) => {
  return new Promise<Response>((resolve) => {
    exec(`python3 -m apollo ${input} ${userOut} ${judgeOut}`, (err, stdout) => {
      if (err)
        resolve({
          verdict: 'INTERNAL_ERROR',
          messages: [],
        });
      const parsed = stdout.replaceAll(/\r/g, '');
      const lines = parsed.split('\n');
      const verdict = lines[0].split(':')[0] as VerdictType;
      const messages = [lines[0].split(':').at(-1) as string, ...lines.slice(1)]
        .map((item) => item.trim())
        .filter((item) => item !== '');
      resolve({
        verdict,
        messages,
      });
    });
  });
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
  const inputs = (await findByExtension(data, 'in')).map((path) => {
    return trimExtension(path);
  });
  const outputs = (await findByExtension(data, 'out')).map((path) => {
    return trimExtension(path);
  });

  const allCasesValid = inputs.every((path) => {
    return outputs.includes(path);
  });

  if (!allCasesValid) {
    event.reply(CHANNELS.INVALID_DATA);
    return;
  }

  const inputIds = inputs.map((path) => {
    return getFileNameFromPath(path);
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

  let results = inputs.reduce((curRes, path) => {
    return {
      ...curRes,
      [getFileNameFromPath(path)]: {
        verdict: 'UNKNOWN',
        messages: [],
      },
    };
  }, {});

  for (let i = 0; i < inputs.length; i += 1) {
    const input = inputs[i];
    const inputId = getFileNameFromPath(input);
    const inputPath = input.concat('.in');
    const judgeOutputPath = input.concat('.out');
    const userOutputPath = getCachePath(`${inputId}.userOut`);

    let response: Response = {
      verdict: 'INTERNAL_ERROR',
      messages: [],
    };

    try {
      await run(compiledPath, lang, inputPath, userOutputPath, timeLimit);
      response = await check(inputPath, userOutputPath, judgeOutputPath);
    } catch (err) {
      if (err === 'TLE') {
        response = {
          verdict: 'TLE',
          messages: ['Exceeded cpuTime limit.'],
        };
      } else if (err === 'RTE') {
        response = {
          verdict: 'RTE',
          messages: ['Runtime error.'],
        };
      }
    }

    console.log({
      Case: inputId,
      Verdict: response,
    });

    results = {
      ...results,
      [inputId]: response,
    };

    event.reply(CHANNELS.CASE_JUDGED, results);
  }

  event.reply(CHANNELS.DONE_JUDGING);
};
