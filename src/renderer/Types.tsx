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
