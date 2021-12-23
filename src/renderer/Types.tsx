export type FileKeyType = 'source' | 'data' | 'input' | 'output';
export type VerdictType =
  | 'UNKNOWN'
  | 'AC'
  | 'PE'
  | 'WA'
  | 'TLE'
  | 'RTE'
  | 'INTERNAL_ERROR';
export type Response = {
  verdict: VerdictType;
  messages: Array<string>;
};
export type InfoType = 'input' | 'output' | 'userOutput';
export type DepType = 'Python 3' | 'Apollo' | 'xdg-open-wsl';
export type InstallType = 'pip';
