import { useEffect, useState } from 'react';
import { Space } from 'antd';
import CHANNELS from './channels';
import { FileKeyType } from './Types';
import FileSelectionRow from './FileSelectionRow';
import NumberSelectionRow from './NumberSelectionRow';
import eventHandler from './eventHandler';
import JudgeButton from './JudgeButton';

type FileData = {
  [K in FileKeyType]?: string;
};

const FILE_KEYS = {
  SOURCE: 'source',
  DATA: 'data',
  INPUT: 'input',
  OUTPUT: 'output',
};

export default function Home() {
  const [fileInfo, setFileInfo] = useState<FileData>({});

  // This is ok because the setter is only called as a LISTENER
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFileName = (key: FileKeyType, name: string) => {
    setFileInfo({ ...fileInfo, [key]: name });
  };

  useEffect(() => {
    eventHandler.on(CHANNELS.FILE_SELECTED, updateFileName);

    return () => {
      eventHandler.removeListener(CHANNELS.FILE_SELECTED, updateFileName);
    };
  }, [updateFileName]);

  const onSelectFile = (key: FileKeyType) => {
    eventHandler.setFile(key, key === FILE_KEYS.DATA);
  };

  const onChangeTimeLimit = (limit: number) => {
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
          min={1}
          defaultValue={1}
          units="seconds"
          onChange={onChangeTimeLimit}
        />
        <JudgeButton />
      </Space>
    </div>
  );
}
