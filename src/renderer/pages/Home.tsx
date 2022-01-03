import { useEffect, useState } from 'react';
import { Space } from 'antd';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { StoreKeyType } from '../utils/types';
import FileSelectionRow from '../components/FileSelectionRow';
import NumberSelectionRow from '../components/NumberSelectionRow';
import JudgeButton from '../components/JudgeButton';
import Results from '../components/Results';
import CheckerTypeSelectorRow from '../components/CheckerTypeSelectorRow';

export default function Home() {
  const [sourceName, setSourceName] = useState<string>();
  const [dataFolder, setDataFolder] = useState<string>();
  const [timeLimit, setTimeLimit] = useState<number>(1);

  // This is ok because the setter is only called as a LISTENER
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateData = (key: StoreKeyType, res: unknown) => {
    if (key === 'time-limit') setTimeLimit(res as number);
    else if (key === 'source') setSourceName(res as string);
    else if (key === 'data') setDataFolder(res as string);
  };

  useEffect(() => {
    const removers: Array<() => void> = [];
    removers.push(eventHandler.on(CHANNELS.FILE_SELECTED, updateData));
    removers.push(eventHandler.on(CHANNELS.FOUND_IN_STORE, updateData));

    // Request any cached data
    eventHandler.requestFromStore('source');
    eventHandler.requestFromStore('data');
    eventHandler.requestFromStore('time-limit');

    return () => {
      removers.forEach((remover) => remover());
    };
  }, []);

  const onSelectFile = (key: StoreKeyType) => {
    eventHandler.setFile(key, key === 'data');
  };

  const onChangeTimeLimit = (limit: number) => {
    updateData('time-limit', limit);
    eventHandler.setTimeLimit(limit);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        padding: '1em',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <FileSelectionRow
          label="Source"
          placeholder="Select file"
          value={sourceName}
          onClick={() => onSelectFile('source')}
        />
        <FileSelectionRow
          label="Data"
          placeholder="Select directory"
          value={dataFolder}
          onClick={() => onSelectFile('data')}
        />
        <NumberSelectionRow
          label="Time Limit"
          type="integer"
          min={1}
          value={timeLimit}
          units="seconds"
          onChange={onChangeTimeLimit}
        />
        <CheckerTypeSelectorRow />
        <JudgeButton />
        <Results />
      </Space>
    </div>
  );
}
