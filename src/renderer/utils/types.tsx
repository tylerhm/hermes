export type VerdictType =
  | 'UNKNOWN'
  | 'AC'
  | 'PE'
  | 'WA'
  | 'TLE'
  | 'RTE'
  | 'INTERNAL_ERROR';
export type ResponseType = {
  verdict: VerdictType;
  messages: Array<string>;
};
export type InfoType = 'input' | 'output' | 'userOutput';
export type CheckerTypeType = 'diff' | 'token' | 'epsilon' | 'custom';
export type DepType = 'Python 3' | 'Apollo' | 'xdg-open-wsl' | 'wsl';
export type InstallType = 'pip';
export type StoreKeyType =
  | 'source'
  | 'data'
  | 'time-limit'
  | 'checker-type'
  | 'epsilon'
  | 'custom-checker-path'
  | 'is-custom-invocation'
  | 'custom-invocation-input';
