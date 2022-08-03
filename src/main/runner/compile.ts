import { executeCommand, maybeWslifyPath } from '../osSpecific';
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

  const normalizedSourcePath = await maybeWslifyPath(sourcePath);
  const normalizedCacheBinaryPath = await maybeWslifyPath(
    getCachePath(sourceName)
  );
  const normalizedCachePath = await maybeWslifyPath(getCachePath());

  const command = langSpecific(lang, {
    cpp: `g++ ${normalizedSourcePath} -O2 -o ${normalizedCacheBinaryPath}`,
    c: `gcc ${normalizedSourcePath} -O2 -o ${normalizedCacheBinaryPath}`,
    java: `javac ${normalizedSourcePath} -d ${normalizedCachePath}`,
    py: `cp ${normalizedSourcePath} ${normalizedCachePath}`,
  }) as string;

  return new Promise<string>((resolve, reject) => {
    executeCommand(command, (err) => {
      if (err) reject(err);
      resolve(getCachePath(lang === 'py' ? sourceFile : sourceName));
    });
  });
};

export default compile;
