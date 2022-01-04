import { message } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';

// Hook that manages the preparation status of a judge session.
const usePrepStatus = (steps: Array<string>, onError: () => void) => {
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<boolean>();

  // Set up all error listeners and progress updaters
  useEffect(() => {
    const notifyError = (content: string) => {
      setError(true);
      message.config({
        top: 250,
        duration: 1,
      });
      message.error(content);
      onError();
    };

    const cancelError = () => {
      setError(false);
    };
    const notifyMissingInfo = () => {
      notifyError('Fill all required fields');
    };
    const notifyUnsupportedLanguage = (ext: string) => {
      notifyError(`Unsupported file extension: ${ext}`);
    };
    const notifyInvalidFile = (source: string) => {
      notifyError(`${source} does not exist`);
    };
    const notifyInvalidFolder = (folder: string) => {
      notifyError(`${folder} does not exist`);
    };
    const notifyInvalidData = () => {
      notifyError('Invalid data format');
    };
    const notifyCompilationError = () => {
      notifyError('Compilation error');
    };

    // Each step should take us 100 / steps.length distance forward in progress
    const prog = 100 / steps.length;
    const events = steps.reduce((curEvents, step, index) => {
      return {
        [step]: () => {
          setProgress((index + 1) * prog);
        },
        ...curEvents,
      };
    }, {});

    const removers: Array<() => void> = [];
    removers.push(eventHandler.on(CHANNELS.BEGIN_COLLECT_DATA, cancelError));

    Object.entries(events).forEach(([event, registerEvent]) => {
      removers.push(eventHandler.on(event, registerEvent));
    });

    removers.push(eventHandler.on(CHANNELS.MISSING_INFO, notifyMissingInfo));
    removers.push(
      eventHandler.on(CHANNELS.UNSUPPORTED_LANGUAGE, notifyUnsupportedLanguage)
    );
    removers.push(eventHandler.on(CHANNELS.FILE_NOT_EXIST, notifyInvalidFile));
    removers.push(
      eventHandler.on(CHANNELS.FOLDER_NOT_EXIST, notifyInvalidFolder)
    );
    removers.push(eventHandler.on(CHANNELS.INVALID_DATA, notifyInvalidData));
    removers.push(
      eventHandler.on(CHANNELS.COMPILATION_ERROR, notifyCompilationError)
    );

    return () => {
      removers.forEach((remover) => remover());
    };
  }, [onError, steps]);

  return [progress, error];
};

export default usePrepStatus;
