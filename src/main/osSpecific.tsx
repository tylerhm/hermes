import { exec, spawn, ExecException } from 'child_process';

// Compat layer for windows users. Forces execution in wsl.
export const executeCommand = (
  command: string,
  callback?:
    | ((error: ExecException | null, stdout: string, stderr: string) => void)
    | undefined
) => {
  if (process.platform === 'win32') exec(`wsl ${command}`, callback);
  else exec(command, callback);
};

// Spawns a wsl instance of command
const wslSpawn = (command: string, args?: Array<string>) => {
  const commandPushed = args == null ? [] : args;
  commandPushed.splice(0, 0, command);
  return spawn('wsl', commandPushed);
};

// Compat layer for windows users. Forces execution in wsl.
export const spawnCommand = (command: string, args?: Array<string>) => {
  return process.platform === 'win32'
    ? wslSpawn(command, args)
    : spawn(command, args);
};

// Compat layer for windows users. Turns path to WSL path if necessary.
export const maybeWslifyPath = async (absPath: string) => {
  return new Promise<string>((resolve, reject) => {
    if (process.platform !== 'win32') resolve(absPath);
    executeCommand(`wslpath '${absPath}'`, (err, stdout) => {
      if (err) reject(Error('wslpath not found'));
      resolve(stdout.trim());
    });
  });
};
