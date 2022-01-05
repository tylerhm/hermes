import { StoreKeyType } from './types';

const STORE_KEYS: { [key: string]: StoreKeyType } = {
  SOURCE: 'source',
  DATA: 'data',
  TIME_LIMIT: 'time-limit',
  CHECKER_TYPE: 'checker-type',
  EPSILON: 'epsilon',
  CUSTOM_CHECKER_PATH: 'custom-checker-path',
  IS_CUSTOM_INVOCATION: 'is-custom-invocation',
  CUSTOM_INVOCATION_INPUT: 'custom-invocation-input',
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const debounce = (func: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function bounce(this: unknown, ...args: unknown[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), ms);
  };
};

export default STORE_KEYS;
