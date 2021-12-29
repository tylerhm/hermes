/* eslint no-await-in-loop: off, global-require: off, no-console: off, promise/always-return: off */
import { dialog, shell } from 'electron';
import Store from 'electron-store';
import path from 'path';
import { maybeWslifyPath, spawnCommand } from '../osSpecific';
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

const STORE_KEYS = {
  SOURCE: 'source',
  DATA: 'data',
  TIME_LIMIT: 'time-limit',
  CHECKER_TYPE: 'checker-type',
  EPSILON: 'epsilon',
  CUSTOM_CHECKER_PATH: 'custom-checker-path',
};

const getDataLocationStoreKey = (caseID: string) => {
  return `casePaths.${caseID}`;
};

// Store for the main thread. Get rid of old data
const store = new Store();
store.clear();

// Open file dialog and save selections by key.
export const selectFile = async (
  event: Electron.IpcMainEvent,
  key: string,
  isDir: boolean
) => {
  if (!Object.values(STORE_KEYS).includes(key)) {
    console.error(`Unsupported file key: ${key}`);
    return;
  }

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
  store.set(STORE_KEYS.TIME_LIMIT, limit);
};

// Set the checker in the store
type CheckerTypeType = 'diff' | 'token' | 'epsilon' | 'custom';
export const setCheckerType = async (
  _event: Electron.IpcMainEvent,
  checkerType: CheckerTypeType
) => {
  store.set(STORE_KEYS.CHECKER_TYPE, checkerType);
};

// Set the epsilon in the store
export const setEpsilon = async (
  _event: Electron.IpcMainEvent,
  epsilon: number
) => {
  store.set(STORE_KEYS.EPSILON, epsilon);
};

// Attempt to open the requested info about a case
type InfoType = 'input' | 'output' | 'userOutput';
export const openCaseInfo = async (
  _event: Electron.IpcMainEvent,
  caseID: string,
  infoType: InfoType
) => {
  const dataLocation: string = store.get(
    getDataLocationStoreKey(caseID)
  ) as string;
  // Get a path to what we are trying to open
  let absPath = '';
  switch (infoType) {
    case 'input':
      absPath = path.join(dataLocation, `${caseID}.in`);
      break;
    case 'output':
      absPath = path.join(dataLocation, `${caseID}.out`);
      break;
    case 'userOutput':
      absPath = path.join(getCachePath(), `${caseID}.userOut`);
      break;
    default:
      console.error(`Invalid infoType requested: ${infoType}`);
      break;
  }

  shell.openPath(absPath);
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

  const source = store.get(STORE_KEYS.SOURCE, null) as string | null;
  const data = store.get(STORE_KEYS.DATA, null) as string | null;
  const timeLimit = store.get(STORE_KEYS.TIME_LIMIT, 1) as number;
  const checkerType = store.get(
    STORE_KEYS.CHECKER_TYPE,
    'diff'
  ) as CheckerTypeType;
  const epsilon = store.get(STORE_KEYS.EPSILON, 0.0000001) as number;
  const customCheckerPath = store.get(
    STORE_KEYS.CUSTOM_CHECKER_PATH,
    'NA'
  ) as string;

  if (
    source == null ||
    data == null ||
    (checkerType === 'custom' && customCheckerPath === 'NA')
  ) {
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
    const caseID = getFileNameFromPath(absPath);
    store.set(getDataLocationStoreKey(caseID), path.dirname(absPath));
    return caseID;
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
    messages: Array<string>;
  };

  // Normalize all paths Windows -> WSL bridge users
  const normalizedFastJudgeBinary = await maybeWslifyPath(
    path.join(__dirname, '../../binaries/fastJudge')
  );
  const normalizedCachePath = await maybeWslifyPath(getCachePath());
  const normalizedBinaryPath = await maybeWslifyPath(compiledPath);

  let normalizedInputPaths: Array<string>;
  let normalizedOutputPaths: Array<string>;
  // Only make the call if necessary, these strings are HUGE.
  if (process.platform === 'win32') {
    const normalizedInputPathPromises = inputs.map(async (idPath) => {
      return maybeWslifyPath(`${idPath}.in`);
    });
    const normalizedOutputPathPromises = inputs.map(async (idPath) => {
      return maybeWslifyPath(`${idPath}.out`);
    });
    normalizedInputPaths = await Promise.all(normalizedInputPathPromises);
    normalizedOutputPaths = await Promise.all(normalizedOutputPathPromises);
  } else {
    normalizedInputPaths = inputs.map((idPath) => `${idPath}.in`);
    normalizedOutputPaths = inputs.map((idPath) => `${idPath}.out`);
  }

  const normalizedRunguardPath = await maybeWslifyPath(
    path.join(__dirname, '../../binaries/runguard')
  );
  const normalizedCustomCheckerPath =
    customCheckerPath === 'NA'
      ? customCheckerPath
      : await maybeWslifyPath(customCheckerPath);

  const judger = spawnCommand(normalizedFastJudgeBinary, [
    normalizedCachePath,
    getFileNameFromPath(compiledPath),
    normalizedBinaryPath,
    lang,
    inputIds.toString(),
    normalizedInputPaths.toString(),
    normalizedOutputPaths.toString(),
    timeLimit.toString(),
    '/',
    normalizedRunguardPath,
    checkerType,
    epsilon.toString(),
    normalizedCustomCheckerPath,
  ]);

  let numJudged = 0;
  judger.stdout.on('data', (msg) => {
    console.log(msg.toString());
    if (msg.toString()[0] !== '{') return;
    const message: MessageType = JSON.parse(msg.toString());
    results[message.inputId] = {
      verdict: message.verdict,
      messages: message.messages,
    };

    event.reply(CHANNELS.CASE_JUDGED, results);

    numJudged += 1;
    if (numJudged === inputs.length) event.reply(CHANNELS.DONE_JUDGING);
  });
};
