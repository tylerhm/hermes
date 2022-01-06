import { useEffect, useState } from 'react';
import { Space } from 'antd';
import TextInputRow from '../components/TextInputRow';
import ToggleRow from '../components/ToggleRow';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { StoreKeyType } from '../utils/types';
import FileSelectionRow from '../components/FileSelectionRow';
import NumberSelectionRow from '../components/NumberSelectionRow';
import JudgeButton from '../components/JudgeButton';
import Results from '../components/results/Results';
import CheckerTypeSelectorRow from '../components/CheckerTypeSelectorRow';

export default function Home() {
  const [sourceName, setSourceName] = useState<string>();
  const [dataFolder, setDataFolder] = useState<string>();
  const [timeLimit, setTimeLimit] = useState<number>(1);
  const [isCustomInvocation, setIsCustomInvocation] = useState<boolean>(false);
  const [customInvocationInput, setCustomInvocationInput] = useState<string>();

  // This is ok because the setter is only called as a LISTENER
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateData = (key: StoreKeyType, res: unknown) => {
    if (key === 'time-limit') setTimeLimit(res as number);
    else if (key === 'source') setSourceName(res as string);
    else if (key === 'data') setDataFolder(res as string);
    else if (key === 'is-custom-invocation')
      setIsCustomInvocation(res as boolean);
    else if (key === 'custom-invocation-input')
      setCustomInvocationInput(res as string);
  };

  // Request store data, and listen on updates
  useEffect(() => {
    const removers: Array<() => void> = [];
    removers.push(eventHandler.on(CHANNELS.FILE_SELECTED, updateData));
    removers.push(eventHandler.on(CHANNELS.FOUND_IN_STORE, updateData));

    // Request any cached data
    eventHandler.requestFromStore('source');
    eventHandler.requestFromStore('data');
    eventHandler.requestFromStore('time-limit');
    eventHandler.requestFromStore('is-custom-invocation');
    eventHandler.requestFromStore('custom-invocation-input');

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

  const onChangeIsCustomInvocation = (customInvocation: boolean) => {
    updateData('is-custom-invocation', customInvocation);
    eventHandler.setIsCustomInvocation(customInvocation);
  };

  const onChangeCustomInvocationInput = (newCustomInvocationInput: string) => {
    updateData('custom-invocation-input', newCustomInvocationInput);
    eventHandler.setCustomInvocationInput(newCustomInvocationInput);
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
        {
          // Select custom input for custom invoc, and data for regular
          isCustomInvocation ? (
            <TextInputRow
              label="Custom Input"
              defaultValue={customInvocationInput}
              onChange={onChangeCustomInvocationInput}
            />
          ) : (
            <FileSelectionRow
              label="Data"
              placeholder="Select directory"
              value={dataFolder}
              onClick={() => onSelectFile('data')}
            />
          )
        }
        <NumberSelectionRow
          label="Time Limit"
          type="integer"
          min={1}
          value={timeLimit}
          units="seconds"
          onChange={onChangeTimeLimit}
        />
        {isCustomInvocation ? null : <CheckerTypeSelectorRow />}
        <ToggleRow
          label="Custom Invocation?"
          checked={isCustomInvocation}
          onChange={onChangeIsCustomInvocation}
        />
        <JudgeButton />
        <Results isCustomInvocation={isCustomInvocation} />
      </Space>
    </div>
  );
}
