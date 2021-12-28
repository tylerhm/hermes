import { useEffect, useState } from 'react';
import { Space } from 'antd';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { FileKeyType, CheckerTypeType } from '../utils/Types';
import FileSelectionRow from '../components/FileSelectionRow';
import NumberSelectionRow from '../components/NumberSelectionRow';
import JudgeButton from '../components/JudgeButton';
import Results from '../components/Results';
import DropdownSelectorRow from '../components/DropdownSelectorRow';

type FileData = {
  [K in FileKeyType]?: string;
};

const FILE_KEYS = {
  SOURCE: 'source',
  DATA: 'data',
  INPUT: 'input',
  OUTPUT: 'output',
};

const CHECKER_TYPE_OPTIONS: Array<CheckerTypeType> = [
  'diff',
  'token',
  'epsilon',
];

export default function Home() {
  const [fileInfo, setFileInfo] = useState<FileData>({});
  const [checkerType, setCheckerType] = useState<CheckerTypeType>(
    CHECKER_TYPE_OPTIONS[0]
  );

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

  const onChangeCheckerType = (newCheckerType: CheckerTypeType) => {
    setCheckerType(newCheckerType);
    eventHandler.setCheckerType(newCheckerType);
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
          choices={CHECKER_TYPE_OPTIONS}
          onSelect={(value: string) =>
            onChangeCheckerType(value as CheckerTypeType)
          }
        />
        {checkerType === 'epsilon' ? (
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
