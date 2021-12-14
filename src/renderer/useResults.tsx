import { useEffect, useState } from 'react';
import CHANNELS from './channels';
import eventHandler from './eventHandler';
import { VerdictType } from './Types';

type ResultsType = {
  [id: string]: VerdictType;
};

const useResults = () => {
  const [results, setResults] = useState<ResultsType>({});

  useEffect(() => {
    const dataRecieved = (dataIds: Array<string>) => {
      setResults(
        dataIds.reduce((curRes, id) => {
          return { ...curRes, [id]: 'UNKNOWN' };
        }, {})
      );
    };

    const caseJudged = (newResults: ResultsType) => {
      setResults(newResults);
    };

    eventHandler.on(CHANNELS.DONE_COLLECT_DATA, dataRecieved);
    eventHandler.on(CHANNELS.CASE_JUDGED, caseJudged);

    return () => {
      eventHandler.removeListener(CHANNELS.DONE_COLLECT_DATA, dataRecieved);
      eventHandler.removeListener(CHANNELS.CASE_JUDGED, caseJudged);
    };
  }, []);

  return results;
};

export default useResults;
