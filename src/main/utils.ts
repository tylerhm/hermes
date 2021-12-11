/* eslint global-require: off, no-console: off, promise/always-return: off */

const find = require('find');

export const getFileNameFromPath = (filePath: string) => {
  return filePath.split('\\').pop()?.split('/').pop() as string;
};

// Get the extension from a string
export const getExtension = (path: string) => {
  return path.split('.').pop() as string;
};

// Trim extension off of a string
export const trimExtension = (fileName: string) => {
  return fileName.split('.')[0];
};

// Find file by it's extension
export const findByExtension = (dataDir: string, ext: string) => {
  const search = new RegExp(`.*\\.${ext}`, 'g');
  return new Promise<Array<string>>((resolve) => {
    find.file(search, dataDir, resolve);
  });
};

export type LangType = 'cpp' | 'c' | 'java' | 'py';
export const getLang: (ext: string) => LangType = (ext: string) => {
  switch (ext) {
    default:
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
