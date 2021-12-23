import { executeCommand } from '../osSpecific';
import {
  getCachePath,
  getFileNameFromPath,
  langSpecific,
  LangType,
  trimExtension,
} from '../utils';

// Compile source, and return path to binary
const compile = async (sourcePath: string, lang: LangType) => {
  const sourceFile = getFileNameFromPath(sourcePath);
  const sourceName = trimExtension(sourceFile);

  const command = langSpecific(lang, {
    cpp: `g++ ${sourcePath} -O2 -o ${getCachePath(sourceName)}`,
    c: `gcc ${sourcePath} -O2 -o ${getCachePath(sourceName)}`,
    java: `javac ${sourcePath} -d ${getCachePath()}`,
    py: `cp ${sourcePath} ${getCachePath()}`,
  }) as string;

  return new Promise<string>((resolve, reject) => {
    executeCommand(command, (err) => {
      if (err) reject(err);
      resolve(getCachePath(lang === 'py' ? sourceFile : sourceName));
    });
  });
};

export default compile;
