import { exec, spawn, ExecException } from 'child_process';

export const executeCommand = (
  command: string,
  callback:
    | ((error: ExecException | null, stdout: string, stderr: string) => void)
    | undefined
) => {
  if (process.platform === 'win32') exec(`wsl ${command}`, callback);
  else exec(command, callback);
};

const wslSpawn = (command: string, args?: Array<string>) => {
  const commandPushed = args == null ? [] : args;
  commandPushed.splice(0, 0, command);
  return spawn('wsl', commandPushed);
};

export const spawnCommand = (command: string, args?: Array<string>) => {
  return process.platform === 'win32'
    ? wslSpawn(command, args)
    : spawn(command, args);
};

export const maybeWslifyPath = async (absPath: string) => {
  return new Promise<string>((resolve, reject) => {
    if (process.platform !== 'win32') resolve(absPath);
    executeCommand(`wslpath '${absPath}'`, (err, stdout) => {
      if (err) reject(Error('wslpath not found'));
      resolve(stdout.trim());
    });
  });
};
