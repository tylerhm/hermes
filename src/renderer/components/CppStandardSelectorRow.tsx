import { Space } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { CppStandardType, StoreKeyType } from '../utils/types';
import DropdownSelectorRow from './DropdownSelectorRow';

const CPP_STANDARD_OPTIONS: Array<CppStandardType> = [11, 14, 17, 20];
const CPP_EXTENSIONS = ['cpp', 'cc', 'C'];

const checkCppLang = (source: string) => {
  return CPP_EXTENSIONS.includes(source.split('.').pop() ?? '');
};

// Row with dropdown to select checker
const CppStandardSelector = () => {
  const [cppStandard, setCppStandard] = useState<CppStandardType>(17);
  const [isCppLang, setIsCppLang] = useState<boolean>(false);

  // Handle incoming information from existing store
  const foundInStore = (key: StoreKeyType, res: unknown) => {
    if (key === 'cpp-standard') setCppStandard(res as CppStandardType);
    else if (key === 'source') setIsCppLang(checkCppLang(res as string));
  };

  // If we select a new source, update our lang accordingly
  const checkAndUpdateCppLang = (key: StoreKeyType, res: unknown) => {
    if (key === 'source') setIsCppLang(checkCppLang(res as string));
  };

  // Ask for all information from store, and listen on file selections
  useEffect(() => {
    const removers: Array<() => void> = [];

    removers.push(eventHandler.on(CHANNELS.FOUND_IN_STORE, foundInStore));
    removers.push(
      eventHandler.on(CHANNELS.FILE_SELECTED, checkAndUpdateCppLang)
    );

    eventHandler.requestFromStore('cpp-standard');
    eventHandler.requestFromStore('source');

    return () => {
      removers.forEach((remover) => remover());
    };
  }, []);

  const onChangeCppStandard = (newCppStandard: CppStandardType) => {
    setCppStandard(newCppStandard);
    eventHandler.setCppStandard(newCppStandard);
  };

  return isCppLang ? (
    <Space direction="vertical" style={{ width: '100%' }}>
      <DropdownSelectorRow
        label="C++ Standard"
        value={cppStandard.toString()}
        choices={CPP_STANDARD_OPTIONS.map((option) => option.toString())}
        onSelect={(value: string) =>
          onChangeCppStandard(Number(value) as CppStandardType)
        }
      />
    </Space>
  ) : null;
};

export default CppStandardSelector;
