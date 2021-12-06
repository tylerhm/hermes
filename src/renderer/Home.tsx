import { useEffect, useState } from 'react';
import CHANNELS from './channels';
import './Home.css';

type FileKey = 'source' | 'data' | 'input' | 'output';

type FileData = {
  [K in FileKey]?: string;
};

const FILE_KEYS = {
  SOURCE: 'source',
  DATA: 'data',
  INPUT: 'input',
  OUTPUT: 'output',
};

export default function Home() {
  const [fileInfo, setFileInfo] = useState<FileData>({});
  const [isSingleTestCase, setIsSingleTestCase] = useState<boolean>(false);

  // This is ok because the setter is only called as a LISTENER
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFileName = (key: FileKey, name: string) => {
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

  const onSelectFile = (key: FileKey) => {
    window.electron.ipcRenderer.setFile(key, key === FILE_KEYS.DATA);
  };

  return (
    <div className="container">
      <div className="buttonGroup">
        <button type="button" onClick={() => onSelectFile('source')}>
          Select Source
        </button>
        {fileInfo.source}
      </div>
      <div className="buttonGroup">
        <button type="button" onClick={() => onSelectFile('data')}>
          Select Data
        </button>
        {fileInfo.data}
      </div>
      <div className="buttonGroup">
        <button type="button" onClick={() => onSelectFile('input')}>
          Select Input
        </button>
        {fileInfo.input}
      </div>
      <div className="buttonGroup">
        <button type="button" onClick={() => onSelectFile('output')}>
          Select Output
        </button>
        {fileInfo.output}
      </div>
    </div>
  );
}
