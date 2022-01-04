/* eslint global-require: off, no-console: off, promise/always-return: off */
import del from 'del';
import fs from 'fs';
import find from 'find';
import makeDir from 'make-dir';
import path from 'path';
import envPaths from './envPaths';

const paths = envPaths('hermes', { suffix: 'ucf' });

export const getFileNameFromPath = (filePath: string) => {
  return filePath.split('\\').pop()?.split('/').pop() as string;
};

// Get the extension from a string
export const getExtension = (filePath: string) => {
  return filePath.split('.').pop() as string;
};

// Trim extension off of a string
export const trimExtension = (fileName: string) => {
  return fileName.split('.').slice(0, -1).join('.');
};

// Find file by it's extension
export const findByExtension = (dataDir: string, ext: string) => {
  const search = new RegExp(`.*\\.${ext}`, 'g');
  return new Promise<Array<string>>((resolve) => {
    find.file(search, dataDir, resolve);
  });
};

export type LangType = 'cpp' | 'c' | 'java' | 'py';
export const getLang: (ext: string) => LangType | null = (ext: string) => {
  switch (ext) {
    case 'C':
    case 'cc':
    case 'cpp':
      return 'cpp';
    case 'c':
      return 'c';
    case 'java':
      return 'java';
    case 'py':
      return 'py';
    default:
      return null;
  }
};

export type LangSpecificOptionsType = {
  [L in LangType]: unknown;
};
export const langSpecific = (
  lang: LangType,
  options: LangSpecificOptionsType
) => {
  return options[lang];
};

export const touchCache = () => {
  makeDir(paths.cache);
};

export const clearCache = () => {
  if (fs.existsSync(paths.cache)) del.sync([paths.cache], { force: true });
};

export const getCachePath = (fileName?: string) => {
  return fileName ? path.join(paths.cache, fileName) : paths.cache;
};
