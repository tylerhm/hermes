import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { ResponseType } from '../utils/types';

export type MultiCaseResultsType = {
  [id: string]: ResponseType;
};

export type CustomInvocationResultType = {
  id: string;
  stdout: string;
  response: ResponseType | null;
};

type ResultsTypeType = 'multi' | 'custom' | null;
type ResultsType = {
  type: ResultsTypeType;
  results: MultiCaseResultsType | CustomInvocationResultType;
};

// Hook to listen to current results status
const useResults = () => {
  const [results, setResults] = useState<ResultsType>({
    type: null,
    results: {},
  });
  const [judging, setJudging] = useState<boolean>(false);

  // Listen to updates in results, and set necessary data.
  useEffect(() => {
    const startJudging = () => {
      setJudging(true);
    };

    const prepResults = (type: ResultsTypeType) => {
      setResults({
        type,
        results: {},
      });
      setJudging(false);
    };

    const dataProcessed = (dataIds: Array<string>) => {
      setResults({
        type: 'multi',
        results: dataIds.reduce((curRes, id) => {
          return {
            ...curRes,
            [id]: {
              verdict: 'UNKNOWN',
              messages: [],
            },
          };
        }, {}),
      });
    };

    const caseJudged = (newResults: MultiCaseResultsType) => {
      setResults({
        type: 'multi',
        results: newResults,
      });
    };

    const customInvocationDone = (result: CustomInvocationResultType) => {
      setResults({
        type: 'custom',
        results: result,
      });
    };

    const removers: Array<() => void> = [];

    // Used by all judge methods
    removers.push(eventHandler.on(CHANNELS.BEGIN_EVALUATION, prepResults));
    removers.push(eventHandler.on(CHANNELS.BEGIN_JUDGING, startJudging));

    // Used by multi test case judging
    removers.push(eventHandler.on(CHANNELS.DONE_COLLECT_DATA, dataProcessed));
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
