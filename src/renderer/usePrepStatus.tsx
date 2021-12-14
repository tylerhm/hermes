import { message } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from './channels';
import eventHandler from './eventHandler';

const usePrepStatus = (steps: Array<string>, onError: () => void) => {
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<boolean>();

  useEffect(() => {
    const notifyError = (content: string) => {
      setError(true);
      message.error({
        content,
        style: {
          marginTop: '85vh',
        },
      });
      onError();
    };

    const prog = 100 / steps.length;
    const events = steps.reduce((curEvents, step, index) => {
      return {
        [step]: () => {
          setProgress((index + 1) * prog);
        },
        ...curEvents,
      };
    }, {});

    eventHandler.on(CHANNELS.BEGIN_COLLECT_DATA, () => {
      setError(false);
    });

    Object.entries(events).forEach(([event, registerEvent]) => {
      eventHandler.on(event, registerEvent);
    });

    eventHandler.on(CHANNELS.MISSING_INFO, () => {
      notifyError('Select source and data');
    });

    eventHandler.on(CHANNELS.INVALID_DATA, () => {
      notifyError('Invalid data format');
    });

    eventHandler.on(CHANNELS.COMPILATION_ERROR, () => {
      notifyError('Compilation error');
    });

    return () => {
      Object.entries(events).forEach(([event, registerEvent]) => {
        eventHandler.removeListener(event, registerEvent);
      });
    };
  }, [onError, steps]);

  return [progress, error];
};

export default usePrepStatus;
