const CHANNELS = {
  DEPS_CHECKED: 'electron-deps-checked',

  DEP_INSTALLED: 'electron-dep-installed',

  FILE_SELECTED: 'electron-file-selected',

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
};

export default CHANNELS;
