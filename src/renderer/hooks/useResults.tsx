import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { ResponseType } from '../utils/types';

export type MultiCaseResultsType = {
  [id: string]: ResponseType;
};

export type CustomInvocationResultType = {
  stdout: string;
  response: ResponseType | null;
};

type ResultsType = MultiCaseResultsType | CustomInvocationResultType;

// Hook to listen to current results status
const useResults = () => {
  const [results, setResults] = useState<ResultsType>({});
  const [judging, setJudging] = useState<boolean>(false);

  // Listen to updates in results, and set necessary data.
  useEffect(() => {
    const startJudging = () => {
      setJudging(true);
    };

    const resetResults = () => {
      setResults({});
      setJudging(false);
    };

    const dataRecieved = (dataIds: Array<string>) => {
      setResults(
        dataIds.reduce((curRes, id) => {
          return {
            ...curRes,
            [id]: {
              verdict: 'UNKNOWN',
              messages: [],
            },
          };
        }, {})
      );
    };

    const caseJudged = (newResults: MultiCaseResultsType) => {
      setResults(newResults);
    };

    const customInvocationDone = (result: CustomInvocationResultType) => {
      setResults(result);
    };

    const removers: Array<() => void> = [];

    // Used by all judge methods
    removers.push(eventHandler.on(CHANNELS.BEGIN_JUDGING, startJudging));
    removers.push(eventHandler.on(CHANNELS.BEGIN_EVALUATION, resetResults));

    // Used by multi test case judging
    removers.push(eventHandler.on(CHANNELS.DONE_COLLECT_DATA, dataRecieved));
    removers.push(eventHandler.on(CHANNELS.CASE_JUDGED, caseJudged));

    // Used by custom invocation judging
    removers.push(
      eventHandler.on(CHANNELS.CUSTOM_INVOCATION_DONE, customInvocationDone)
    );

    return () => {
      removers.forEach((remover) => remover());
    };
  }, []);

  return { results, judging };
};

export default useResults;
