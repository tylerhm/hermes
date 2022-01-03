import { Space } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { CheckerTypeType, StoreKeyType } from '../utils/types';
import DropdownSelectorRow from './DropdownSelectorRow';
import FileSelectionRow from './FileSelectionRow';
import NumberSelectionRow from './NumberSelectionRow';

const CHECKER_TYPE_OPTIONS: Array<CheckerTypeType> = [
  'diff',
  'token',
  'epsilon',
  'custom',
];

const CheckerTypeSelectorRow = () => {
  const [checkerType, setCheckerType] = useState<CheckerTypeType>(
    CHECKER_TYPE_OPTIONS[0]
  );
  const [checkerBinaryPath, setCheckerBinaryPath] = useState<
    string | undefined
  >();
  const [epsilon, setEpsilon] = useState<number>(0.0000001);

  const updateCheckerBinaryPath = (key: StoreKeyType, newPath: string) => {
    if (key === 'custom-checker-path') setCheckerBinaryPath(newPath);
  };

  const foundInStore = (key: StoreKeyType, res: unknown) => {
    if (key === 'custom-checker-path') setCheckerBinaryPath(res as string);
    else if (key === 'checker-type') setCheckerType(res as CheckerTypeType);
    else if (key === 'epsilon') setEpsilon(res as number);
  };

  useEffect(() => {
    const removers: Array<() => void> = [];
    removers.push(
      eventHandler.on(CHANNELS.FILE_SELECTED, updateCheckerBinaryPath)
    );
    removers.push(eventHandler.on(CHANNELS.FOUND_IN_STORE, foundInStore));

    eventHandler.requestFromStore('checker-type');
    eventHandler.requestFromStore('custom-checker-path');
    eventHandler.requestFromStore('epsilon');
    return () => {
      removers.forEach((remover) => remover());
    };
  }, []);

  const onChangeCheckerType = (newCheckerType: CheckerTypeType) => {
    setCheckerType(newCheckerType);
    eventHandler.setCheckerType(newCheckerType);
  };

  const onChangeEpsilon = (newEpsilon: number) => {
    setEpsilon(newEpsilon);
    eventHandler.setEpsilon(newEpsilon);
  };

  const getCheckerMetaComponent = () => {
    if (checkerType === 'epsilon')
      return (
        <NumberSelectionRow
          label="Epsilon"
          type="float"
          min={0}
          max={999999}
          value={epsilon}
          onChange={onChangeEpsilon}
        />
      );

    if (checkerType === 'custom')
      return (
        <FileSelectionRow
          label="Checker Binary"
          placeholder="Select file"
          value={checkerBinaryPath}
          onClick={() => eventHandler.setFile('custom-checker-path', false)}
        />
      );

    return null;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <DropdownSelectorRow
        label="Checker"
        value={checkerType}
        choices={CHECKER_TYPE_OPTIONS}
        onSelect={(value: string) =>
          onChangeCheckerType(value as CheckerTypeType)
        }
      />
      {getCheckerMetaComponent()}
    </Space>
  );
};

export default CheckerTypeSelectorRow;
