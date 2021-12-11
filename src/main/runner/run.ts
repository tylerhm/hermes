import { exec } from 'child_process';
import { getFileNameFromPath, langSpecific, LangType } from '../utils';

// Run a binary. Resolves as runtime, or -1 if RTE
const run = (
  binPath: string,
  lang: LangType,
  inputPath: string,
  outputPath: string,
  timeout: number
) => {
  const binName = getFileNameFromPath(binPath);

  const command = langSpecific(lang, {
    c: `${binPath} < ${inputPath} > ${outputPath}`,
    cpp: `${binPath} < ${inputPath} > ${outputPath}`,
    java: `java -cp tmp ${binName} < ${inputPath} > ${outputPath}`,
    py: `python3 ${binPath} < ${inputPath} > ${outputPath}`,
  }) as string;

  return new Promise<number>((resolve) => {
    const startTime = Date.now();
    exec(command, { timeout }, (err) => {
      const error = err != null;
      const killed = err?.signal === 'SIGTERM';
      resolve(error && !killed ? -1 : Date.now() - startTime);
    });
  });
};

export default run;
