import { Space } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { CppStandardType, StoreKeyType } from '../utils/types';
import DropdownSelectorRow from './DropdownSelectorRow';

const CPP_STANDARD_OPTIONS: Array<CppStandardType> = [11, 14, 17, 20];

// Row with dropdown to select checker
const CppStandardSelector = () => {
  const [cppStandard, setCppStandard] = useState<CppStandardType>(17);

  // Handle incoming information from existing store
  const foundInStore = (key: StoreKeyType, res: unknown) => {
    if (key === 'cpp-standard') setCppStandard(res as CppStandardType);
  };

  // Ask for all information from store, and listen on file selections
  useEffect(() => {
    const remover = eventHandler.on(CHANNELS.FOUND_IN_STORE, foundInStore);
    eventHandler.requestFromStore('cpp-standard');
    return () => {
      remover();
    };
  }, []);

  const onChangeCppStandard = (newCppStandard: CppStandardType) => {
    setCppStandard(newCppStandard);
    eventHandler.setCppStandard(newCppStandard);
  };

  return (
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
  );
};

export default CppStandardSelector;
