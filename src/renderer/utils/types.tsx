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
export type MultiCaseCheckerTypeType = 'diff' | 'token' | 'epsilon' | 'custom';
export type CustomInvocationCheckerTypeType = 'none' | 'custom';
export type CppStandardType = 11 | 14 | 17 | 20;
export type DepType = 'Python 3' | 'Apollo' | 'xdg-open-wsl' | 'wsl';
export type InstallType = 'pip';
export type StoreKeyType =
  | 'source'
  | 'data'
  | 'time-limit'
  | 'multi-case-checker-type'
  | 'custom-invocation-checker-type'
  | 'epsilon'
  | 'custom-checker-path'
  | 'is-custom-invocation'
  | 'custom-invocation-input'
  | 'cpp-standard';
