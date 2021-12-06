import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import CHANNELS from './channels';
import { FileKeyType } from './Types';
import FileSelectionRow from './FileSelectionRow';

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
  // const [isSingleTestCase, setIsSingleTestCase] = useState<boolean>(false);

  // This is ok because the setter is only called as a LISTENER
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFileName = (key: FileKeyType, name: string) => {
    setFileInfo({ ...fileInfo, [key]: name });
  };

  useEffect(() => {
    window.electron.ipcRenderer.on(CHANNELS.FILE_SELECTED, updateFileName);

    return () => {
      window.electron.ipcRenderer.removeListener(
        CHANNELS.FILE_SELECTED,
        updateFileName
      );
    };
  }, [updateFileName]);

  const onSelectFile = (key: FileKeyType) => {
    window.electron.ipcRenderer.setFile(key, key === FILE_KEYS.DATA);
  };

  return (
    <Container style={{ margin: '1em' }}>
      <FileSelectionRow
        fileKey="source"
        name={fileInfo.source}
        onClick={onSelectFile}
      />
      <FileSelectionRow
        fileKey="data"
        name={fileInfo.data}
        onClick={onSelectFile}
        isDir
      />
    </Container>
  );
}
