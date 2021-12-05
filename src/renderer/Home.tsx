import { useEffect, useState } from 'react';
import './Home.css';

export default function Home() {
  const [sourceName, setSourceName] = useState<string>('');
  const [inputName, setInputName] = useState<string>('');
  const [outputName, setOutputName] = useState<string>('');

  const updateFileName = (key: string, name: string) => {
    switch (key) {
      case 'source':
        setSourceName(name);
        break;
      case 'input':
        setInputName(name);
        break;
      case 'output':
        setOutputName(name);
        break;
      default:
        console.error('Invalid file classifier');
    }
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('main-file-selected', updateFileName);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'main-file-selected',
        updateFileName
      );
    };
  }, []);

  const onSelectFileName = (key: string) => {
    window.electron.ipcRenderer.setFile(key);
  };

  return (
    <div className="container">
      <div className="buttonGroup">
        <button type="button" onClick={() => onSelectFileName('source')}>
          Select Source
        </button>
        {sourceName}
      </div>
      <div className="buttonGroup">
        <button type="button" onClick={() => onSelectFileName('input')}>
          Select Input
        </button>
        {inputName}
      </div>
      <div className="buttonGroup">
        <button type="button" onClick={() => onSelectFileName('output')}>
          Select Output
        </button>
        {outputName}
      </div>
    </div>
  );
}
