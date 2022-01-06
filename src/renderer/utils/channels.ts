const CHANNELS = {
  FOUND_IN_STORE: 'electron-found-in-store',

  DEPS_CHECKED: 'electron-deps-checked',
  DEP_INSTALLED: 'electron-dep-installed',

  FILE_SELECTED: 'electron-file-selected',

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

export default CHANNELS;
