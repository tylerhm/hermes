const CHANNELS = {
  REQUEST_FROM_STORE: 'renderer-request-from-store',
  FOUND_IN_STORE: 'electron-found-in-store',

  CHECK_DEPS: 'renderer-check-deps',
  DEPS_CHECKED: 'electron-deps-checked',
  INSTALL_DEP: 'renderer-check-dep',
  DEP_INSTALLED: 'electron-dep-installed',

  SELECT_FILE: 'renderer-select-file',
  FILE_SELECTED: 'electron-file-selected',

  SET_TIME_LIMIT: 'renderer-set-time-limit',

  SET_MULTI_CASE_CHECKER_TYPE: 'renderer-set-multi-case-checker-type',
  SET_CUSTOM_INVOCATION_CHECKER_TYPE:
    'renderer-set-custom-invocation-checker-type',
  SET_EPSILON: 'renderer-set-epsilon',

  SET_IS_CUSTOM_INVOCATION: 'renderer-set-is-custom-invocation',
  SET_CUSTOM_INVOCATION_INPUT: 'renderer-set-custom-invocation-input',

  SET_CPP_STANDARD: 'renderer-set-cpp-standard',

  JUDGE: 'renderer-judge',
  OPEN_CASE_INFO: 'renderer-request-open-case-info',

  // All judges
  BEGIN_EVALUATION: 'electron-begin-evaluation',
  MISSING_INFO: 'electron-missing-info',
  FILE_NOT_EXIST: 'electron-file-not-exist',
  FOLDER_NOT_EXIST: 'electron-folder-not-exist',
  UNSUPPORTED_LANGUAGE: 'electron-unsupported-language',

  BEGIN_COMPILING: 'electron-begin-compiling',
  COMPILATION_ERROR: 'electron-compilation-error',
  DONE_COMPILING: 'electron-done-compiling',

  BEGIN_JUDGING: 'electron-begin-judging',
  DONE_JUDGING: 'electron-done-judging',

  // Multi testcase
  BEGIN_COLLECT_DATA: 'electron-begin-collect-data',
  INVALID_DATA: 'electron-invalid-data',
  DONE_COLLECT_DATA: 'electron-done-collect-data',

  CASE_JUDGED: 'electron-case-judged',

  // Custom invocation
  CUSTOM_INVOCATION_DONE: 'electron-custom-invocation-done',
};

module.exports = CHANNELS;
