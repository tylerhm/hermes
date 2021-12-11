import { exec } from 'child_process';
import makeDir from 'make-dir';
import {
  getFileNameFromPath,
  langSpecific,
  LangType,
  trimExtension,
} from '../utils';

// Compile source, and return path to binary
const compile = async (sourcePath: string, lang: LangType) => {
  const sourceName = trimExtension(getFileNameFromPath(sourcePath));

  await makeDir('tmp');

  const command = langSpecific(lang, {
    cpp: `g++ ${sourcePath} -O2 -o tmp/${sourceName}`,
    c: `gcc ${sourcePath} -O2 -o tmp/${sourceName}`,
    java: `javac ${sourcePath} -d tmp/`,
    py: `cp ${sourcePath} tmp/`,
  }) as string;

  return new Promise<string>((resolve, reject) => {
    exec(command, (err) => {
      if (err) reject(err);
      resolve(`tmp/${sourceName}`);
    });
  });
};

export default compile;
