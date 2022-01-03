import { StoreKeyType } from './types';

const STORE_KEYS: { [key: string]: StoreKeyType } = {
  SOURCE: 'source',
  DATA: 'data',
  TIME_LIMIT: 'time-limit',
  CHECKER_TYPE: 'checker-type',
  EPSILON: 'epsilon',
  CUSTOM_CHECKER_PATH: 'custom-checker-path',
};

export default STORE_KEYS;
