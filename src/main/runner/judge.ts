/* eslint no-await-in-loop: off, global-require: off, no-console: off, promise/always-return: off */
import { dialog, shell } from 'electron';
import Store from 'electron-store';
import path from 'path';
import { existsSync, readFile } from 'fs';
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

// Store for the main thread
const store = new Store();

// Clear all previously stored case paths
store.delete('casePaths');

// All valid direct access store keys
type StoreKeyType =
  | 'source'
  | 'data'
  | 'time-limit'
  | 'multi-case-checker-type'
  | 'custom-invocation-checker-type'
  | 'epsilon'
  | 'custom-checker-path'
  | 'is-custom-invocation'
  | 'custom-invocation-input';
const STORE_KEYS: { [key: string]: StoreKeyType } = {
  SOURCE: 'source',
  DATA: 'data',
  TIME_LIMIT: 'time-limit',
  MULTI_CASE_CHECKER_TYPE: 'multi-case-checker-type',
  CUSTOM_INVOCATION_CHECKER_TYPE: 'custom-invocation-checker-type',
  EPSILON: 'epsilon',
  CUSTOM_CHECKER_PATH: 'custom-checker-path',
  IS_CUSTOM_INVOCATION: 'is-custom-invocation',
  CUSTOM_INVOCATION_INPUT: 'custom-invocation-input',
};

// Returns store key for a given case
type InfoType = 'input' | 'output' | 'userOutput';
const getDataLocationStoreKey = (identifier: string, caseType: InfoType) => {
  return `casePaths.${caseType}.${identifier}`;
};

// Grab existing data from store if it exists
const PATH_KEYS: Array<StoreKeyType> = [
  'custom-checker-path',
  'data',
  'source',
];
export const requestFromStore = (
  event: Electron.IpcMainEvent,
  key: StoreKeyType
) => {
  const res = store.get(key, null);
  if (res != null) {
    if (PATH_KEYS.includes(key))
      event.reply(
        CHANNELS.FOUND_IN_STORE,
        key,
        getFileNameFromPath(res as string)
      );
    else event.reply(CHANNELS.FOUND_IN_STORE, key, res);
  }
};

// Open file dialog and save selections by key.
export const selectFile = async (
  event: Electron.IpcMainEvent,
  key: StoreKeyType,
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

// Set the multi case checker in the store
type MultiCaseCheckerTypeType = 'diff' | 'token' | 'epsilon' | 'custom';
export const setMultiCaseCheckerType = async (
  _event: Electron.IpcMainEvent,
  checkerType: MultiCaseCheckerTypeType
) => {
  store.set(STORE_KEYS.MULTI_CASE_CHECKER_TYPE, checkerType);
};

// Set the custom invocation checker in the store
type CustomInvocationCheckerTypeType = 'none' | 'custom';
export const setCustomInvocationCheckerType = async (
  _event: Electron.IpcMainEvent,
  checkerType: CustomInvocationCheckerTypeType
) => {
  store.set(STORE_KEYS.CUSTOM_INVOCATION_CHECKER_TYPE, checkerType);
};

// Set the epsilon in the store
export const setEpsilon = async (
  _event: Electron.IpcMainEvent,
  epsilon: number
) => {
  store.set(STORE_KEYS.EPSILON, epsilon);
};

// Set the custom invocation status in the store
export const setIsCustomInvocation = async (
  _event: Electron.IpcMainEvent,
  isCustomInvocation: boolean
) => {
  store.set(STORE_KEYS.IS_CUSTOM_INVOCATION, isCustomInvocation);
};

// Set the custom invocation input in the store
export const setCustomInvocationInput = async (
  _event: Electron.IpcMainEvent,
  customInvocationInput: string
) => {
  store.set(STORE_KEYS.CUSTOM_INVOCATION_INPUT, customInvocationInput);
};

// Attempt to open the requested info about a case
export const openCaseInfo = async (
  _event: Electron.IpcMainEvent,
  identifier: string,
  infoType: InfoType,
  isCustomInvocation: boolean
) => {
  // Get a path to what we are trying to open
  let absPath = '';

  // Custom invocation is stored in cache, and doesn't need judge output
  if (isCustomInvocation) {
    switch (infoType) {
      case 'input':
        absPath = getCachePath(`${identifier}-customInvocation.in`);
        break;
      case 'userOutput':
        absPath = getCachePath(`${identifier}-customInvocation.userOut`);
        break;
      default:
        console.error(`Invalid infoType requested: ${infoType}`);
        break;
    }
  }
  // Multi case can be anything
  else {
    absPath = store.get(
      getDataLocationStoreKey(identifier, infoType)
    ) as string;
  }

  shell.openPath(absPath);
};

// ALl valid verdicts, and responses
type VerdictType =
  | 'AC'
  | 'PE'
  | 'WA'
  | 'TLE'
  | 'RTE'
  | 'INTERNAL_ERROR'
  | 'NONE'
  | 'UNKNOWN';
type ResponseType = {
  verdict: VerdictType;
  messages: Array<string>;
};
type MultiCaseResultsType = {
  [id: string]: ResponseType;
};

type CustomInvocationResultType = {
  id: string;
  stdout: string;
  response: ResponseType | null;
};

type ResultsType = MultiCaseResultsType | CustomInvocationResultType;

const judgeMultiCase = async (event: Electron.IpcMainEvent) => {
  event.reply(CHANNELS.BEGIN_EVALUATION, 'multi');

  /*
   * PREP
   */
  const source = store.get(STORE_KEYS.SOURCE, null) as string | null;
  const data = store.get(STORE_KEYS.DATA, null) as string | null;
  const timeLimit = store.get(STORE_KEYS.TIME_LIMIT, 1) as number;
  const checkerType = store.get(
    STORE_KEYS.MULTI_CASE_CHECKER_TYPE,
    'diff'
  ) as MultiCaseCheckerTypeType;
  const epsilon = store.get(STORE_KEYS.EPSILON, 0.0000001) as number;
  const customCheckerPath = store.get(
    STORE_KEYS.CUSTOM_CHECKER_PATH,
    'NA'
  ) as string;

  // If we are missing critical info, then halt
  if (
    source == null ||
    data == null ||
    (checkerType === 'custom' && customCheckerPath === 'NA')
  ) {
    event.reply(CHANNELS.MISSING_INFO);
    return;
  }

  // If source or data does not exists, halt
  if (!existsSync(source)) {
    event.reply(CHANNELS.FILE_NOT_EXIST, source);
    return;
  }
  if (!existsSync(data)) {
    event.reply(CHANNELS.FOLDER_NOT_EXIST, source);
    return;
  }

  // Process the source information
  const ext = getExtension(source);
  const lang = getLang(ext);

  // If the language is not supported, halt
  if (lang == null) {
    event.reply(CHANNELS.UNSUPPORTED_LANGUAGE, ext);
    return;
  }

  /*
   * COMPILATION
   */
  event.reply(CHANNELS.BEGIN_COMPILING);

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
   * DATA COLLECTION
   */
  event.reply(CHANNELS.BEGIN_COLLECT_DATA);

  // Get inputs and outputs from data dir
  // Reduce inputs and outputs to identifiers, and store their paths in the store
  const inputIdentifiers = (await findByExtension(data, 'in')).map(
    (inputPath) => {
      const identifier = getFileNameFromPath(trimExtension(inputPath));
      store.set(getDataLocationStoreKey(identifier, 'input'), inputPath);
      return identifier;
    }
  );

  const outputIdentifiers = (await findByExtension(data, 'out')).map(
    (outputPath) => {
      const identifier = getFileNameFromPath(trimExtension(outputPath));
      const userOutPath = path.join(getCachePath(), `${identifier}.userOut`);
      store.set(getDataLocationStoreKey(identifier, 'output'), outputPath);
      store.set(getDataLocationStoreKey(identifier, 'userOutput'), userOutPath);
      return identifier;
    }
  );

  // Verify that every input has an output
  const allCasesValid = inputIdentifiers.every((identifier) => {
    return outputIdentifiers.includes(identifier);
  });

  if (!allCasesValid) {
    event.reply(CHANNELS.INVALID_DATA);
    return;
  }

  event.reply(CHANNELS.DONE_COLLECT_DATA, inputIdentifiers);

  /*
   * JUDGING
   */
  event.reply(CHANNELS.BEGIN_JUDGING);

  // Populate results map with unkown information
  const results: ResultsType = {};
  inputIdentifiers.forEach((identifier) => {
    results[identifier] = {
      verdict: 'UNKNOWN',
      messages: [],
    };
  });

  // Normalize all paths Windows -> WSL bridge users
  const normalizedFastJudgeBinary = await maybeWslifyPath(
    path.join(__dirname, '../../binaries/fastJudge')
  );
  const normalizedCachePath = await maybeWslifyPath(getCachePath());
  const normalizedBinaryPath = await maybeWslifyPath(compiledPath);

  let normalizedInputPaths = inputIdentifiers.map(
    (identifier) =>
      store.get(getDataLocationStoreKey(identifier, 'input')) as string
  );
  let normalizedOutputPaths = outputIdentifiers.map(
    (identifier) =>
      store.get(getDataLocationStoreKey(identifier, 'output')) as string
  );
  // Only make the normalization call if necessary, these strings are HUGE.
  if (process.platform === 'win32') {
    const normalizedInputPathPromises = normalizedInputPaths.map(
      async (inputPath) => {
        return maybeWslifyPath(inputPath);
      }
    );
    const normalizedOutputPathPromises = normalizedOutputPaths.map(
      async (outputPath) => {
        return maybeWslifyPath(outputPath);
      }
    );
    normalizedInputPaths = await Promise.all(normalizedInputPathPromises);
    normalizedOutputPaths = await Promise.all(normalizedOutputPathPromises);
  }

  const normalizedRunguardPath = await maybeWslifyPath(
    path.join(__dirname, '../../binaries/runguard')
  );
  const normalizedCustomCheckerPath =
    customCheckerPath === 'NA'
      ? customCheckerPath
      : await maybeWslifyPath(customCheckerPath);

  // Create instance of fast judge with normalized data
  const judger = spawnCommand(normalizedFastJudgeBinary, [
    normalizedCachePath,
    getFileNameFromPath(compiledPath),
    normalizedBinaryPath,
    lang,
    inputIdentifiers.toString(),
    normalizedInputPaths.toString(),
    normalizedOutputPaths.toString(),
    timeLimit.toString(),
    '/',
    normalizedRunguardPath,
    checkerType,
    epsilon.toString(),
    normalizedCustomCheckerPath,
  ]);

  // Message recieved from stdout
  type MessageType = {
    inputId: string;
    verdict: VerdictType;
    messages: Array<string>;
  };

  // Listen on all updates from the fastJudge
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
    if (numJudged === inputIdentifiers.length)
      event.reply(CHANNELS.DONE_JUDGING);
  });
};

const judgeCustomInvocation = async (event: Electron.IpcMainEvent) => {
  event.reply(CHANNELS.BEGIN_EVALUATION, 'custom');

  /*
   * PREP
   */
  const source = store.get(STORE_KEYS.SOURCE, null) as string | null;
  const input = store.get(STORE_KEYS.CUSTOM_INVOCATION_INPUT, '') as string;
  const timeLimit = store.get(STORE_KEYS.TIME_LIMIT, 1) as number;
  const checkerType = store.get(
    STORE_KEYS.CUSTOM_INVOCATION_CHECKER_TYPE,
    'none'
  ) as CustomInvocationCheckerTypeType;
  const epsilon = store.get(STORE_KEYS.EPSILON, 0.0000001) as number;
  const customCheckerPath = store.get(
    STORE_KEYS.CUSTOM_CHECKER_PATH,
    'NA'
  ) as string;

  // If we are missing critical info, then halt
  if (
    source == null ||
    (checkerType === 'custom' && customCheckerPath === 'NA')
  ) {
    event.reply(CHANNELS.MISSING_INFO);
    return;
  }

  // If source does not exist, halt
  if (!existsSync(source)) {
    event.reply(CHANNELS.FILE_NOT_EXIST, source);
    return;
  }

  // Process source information
  // Process the source information
  const ext = getExtension(source);
  const lang = getLang(ext);

  // If the language is not supported, halt
  if (lang == null) {
    event.reply(CHANNELS.UNSUPPORTED_LANGUAGE, ext);
    return;
  }

  /*
   * COMPILATION
   */
  event.reply(CHANNELS.BEGIN_COMPILING);

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

  // Normalize all paths Windows -> WSL bridge users
  const normalizedFastCustomInvocationBinary = await maybeWslifyPath(
    path.join(__dirname, '../../binaries/fastCustomInvocation')
  );
  const normalizedCachePath = await maybeWslifyPath(getCachePath());
  const normalizedBinaryPath = await maybeWslifyPath(compiledPath);
  const normalizedRunguardPath = await maybeWslifyPath(
    path.join(__dirname, '../../binaries/runguard')
  );
  const normalizedCustomCheckerPath =
    customCheckerPath === 'NA'
      ? customCheckerPath
      : await maybeWslifyPath(customCheckerPath);

  const judger = spawnCommand(normalizedFastCustomInvocationBinary, [
    normalizedCachePath,
    getFileNameFromPath(compiledPath),
    normalizedBinaryPath,
    lang,
    input,
    timeLimit.toString(),
    '/',
    normalizedRunguardPath,
    checkerType,
    epsilon.toString(),
    normalizedCustomCheckerPath,
  ]);

  type MessageType = {
    id: string;
    stdoutPath: string;
    verdict: VerdictType;
    messages: Array<string>;
  };

  judger.stdout.on('data', async (msg) => {
    console.log(msg.toString());
    if (msg.toString()[0] !== '{') return;
    const result: MessageType = JSON.parse(msg.toString());

    const stdout: string = await new Promise((resolve) => {
      readFile(result.stdoutPath, (error, buffer) => {
        if (error) resolve(error.message);
        else resolve(buffer.toString());
      });
    });

    const response: CustomInvocationResultType = {
      id: result.id,
      stdout,
      response:
        result.verdict === 'NONE'
          ? null
          : {
              verdict: result.verdict,
              messages: result.messages,
            },
    };
    event.reply(CHANNELS.CUSTOM_INVOCATION_DONE, response);
    event.reply(CHANNELS.DONE_JUDGING);
  });
};

// Main judge function
export const judge = async (event: Electron.IpcMainEvent) => {
  const isCustomInvocation = store.get(
    STORE_KEYS.IS_CUSTOM_INVOCATION,
    false
  ) as boolean;

  if (isCustomInvocation) judgeCustomInvocation(event);
  else judgeMultiCase(event);
};
