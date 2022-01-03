const CHANNELS = {
  CHECK_DEPS: 'renderer-check-deps',
  DEPS_CHECKED: 'electron-deps-checked',

  INSTALL_DEP: 'renderer-check-dep',
  DEP_INSTALLED: 'electron-dep-installed',

  SELECT_FILE: 'renderer-select-file',
  FILE_SELECTED: 'electron-file-selected',

  SET_TIME_LIMIT: 'renderer-set-time-limit',

  SET_CHECKER_TYPE: 'renderer-set-checker-type',
  SET_EPSILON: 'renderer-set-epsilon',

  JUDGE: 'renderer-judge',

  BEGIN_EVALUATION: 'electron-begin-evaluation',
  MISSING_INFO: 'electron-missing-info',
  BEGIN_COLLECT_DATA: 'electron-begin-collect-data',
  INVALID_DATA: 'electron-invalid-data',
  DONE_COLLECT_DATA: 'electron-done-collect-data',

  BEGIN_COMPILING: 'electron-begin-compiling',
  COMPILATION_ERROR: 'electron-compilation-error',
  DONE_COMPILING: 'electron-done-compiling',

  BEGIN_JUDGING: 'electron-begin-judging',
  CASE_JUDGED: 'electron-case-judged',
  DONE_JUDGING: 'electron-done-judging',

  OPEN_CASE_INFO: 'renderer-request-open-case-info',
};

module.exports = CHANNELS;
