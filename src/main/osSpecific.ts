import os from 'os';

const pickByOs = (linux: unknown, win32: unknown) => {
  switch (os.platform()) {
    case 'win32':
      return win32;
    default:
      return linux;
  }
};

export default pickByOs;
