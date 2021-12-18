import { exec } from 'child_process';
import path from 'path';
import { getCachePath, getFileNameFromPath, LangType } from '../utils';

// Run a binary. Resolves as runtime, or -1 if RTE
const run = (
  binPath: string,
  lang: LangType,
  inputPath: string,
  outputPath: string,
  timeout: number
) => {
  const command = `${path.join(
    __dirname,
    'runguard'
  )} ${getCachePath()} ${binPath} ${getFileNameFromPath(
    binPath
  )} ${lang} ${inputPath} ${outputPath} ${timeout}`;

  return new Promise<void>((resolve, reject) => {
    exec(command, (_err, _stdout, stderr) => {
      // eslint-disable-next-line prefer-promise-reject-errors
      if (stderr.includes('Cputime limit exceeded')) reject('TLE');
      resolve();
    });
  });
};

export default run;
