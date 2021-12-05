import { useEffect, useState } from 'react';
import './Home.css';

export default function Home() {
  const [sourceName, setSourceName] = useState<string>('');
  const [inputName, setInputName] = useState<string>('');
  const [outputName, setOutputName] = useState<string>('');

  useEffect(() => {
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

    window.electron.ipcRenderer.on('main-file-selected', updateFileName);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'main-file-selected',
        updateFileName
      );
    };
  }, []);

  return (
    <div className="container">
      <div className="buttonGroup">
        <div>test one</div>
        <div>test two</div>
      </div>
    </div>
  );
}
