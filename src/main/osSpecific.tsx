import { exec, spawn, ExecException } from 'child_process';

export const executeCommand = (
  command: string,
  callback:
    | ((error: ExecException | null, stdout: string, stderr: string) => void)
    | undefined
) => {
  if (process.platform === 'win32')
    exec(`wsl ${command}`, { shell: 'wsl' }, callback);
  else exec(command, callback);
};

export const spawnCommand = (command: string, args?: Array<string>) => {
  return process.platform === 'win32'
    ? spawn(`wsl ${command}`, args)
    : spawn(command, args);
};
