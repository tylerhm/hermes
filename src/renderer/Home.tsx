import { useEffect, useState } from 'react';
import { Space } from 'antd';
import CHANNELS from './channels';
import { FileKeyType, CheckerType } from './Types';
import FileSelectionRow from './FileSelectionRow';
import NumberSelectionRow from './NumberSelectionRow';
import eventHandler from './eventHandler';
import JudgeButton from './JudgeButton';
import Results from './Results';
import DropdownSelectorRow from './DropdownSelectorRow';

type FileData = {
  [K in FileKeyType]?: string;
};

const FILE_KEYS = {
  SOURCE: 'source',
  DATA: 'data',
  INPUT: 'input',
  OUTPUT: 'output',
};

const CHECKER_OPTIONS: Array<CheckerType> = ['diff', 'token', 'epsilon'];

export default function Home() {
  const [fileInfo, setFileInfo] = useState<FileData>({});
  const [checker, setChecker] = useState<CheckerType>(CHECKER_OPTIONS[0]);

  // This is ok because the setter is only called as a LISTENER
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFileName = (key: FileKeyType, name: string) => {
    setFileInfo({ ...fileInfo, [key]: name });
  };

  useEffect(() => {
    const remover = eventHandler.on(CHANNELS.FILE_SELECTED, updateFileName);

    return () => {
      remover();
    };
  }, [updateFileName]);

  const onSelectFile = (key: FileKeyType) => {
    eventHandler.setFile(key, key === FILE_KEYS.DATA);
  };

  const onChangeTimeLimit = (limit: number) => {
    eventHandler.setTimeLimit(limit);
  };

  const onChangeChecker = (newChecker: CheckerType) => {
    setChecker(newChecker);
    eventHandler.setChecker(newChecker);
  };

  const onChangeEpsilon = (newEpsilon: number) => {
    eventHandler.setEpsilon(newEpsilon);
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
          value={fileInfo.source}
          onClick={() => onSelectFile('source')}
        />
        <FileSelectionRow
          label="Data"
          placeholder="Select directory"
          value={fileInfo.data}
          onClick={() => onSelectFile('data')}
        />
        <NumberSelectionRow
          label="Time Limit"
          type="integer"
          min={1}
          defaultValue={1}
          units="seconds"
          onChange={onChangeTimeLimit}
        />
        <DropdownSelectorRow
          label="Checker"
          choices={CHECKER_OPTIONS}
          onSelect={(value: string) => onChangeChecker(value as CheckerType)}
        />
        {checker === 'epsilon' ? (
          <NumberSelectionRow
            label="Epsilon"
            type="float"
            min={0}
            defaultValue={0.000001}
            onChange={onChangeEpsilon}
          />
        ) : null}
        <JudgeButton />
        <Results />
      </Space>
    </div>
  );
}
