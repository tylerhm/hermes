import { Space } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { CheckerTypeType } from '../utils/Types';
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

  const updateCheckerBinaryPath = (key: string, newPath: string) => {
    if (key === 'custom-checker-path') setCheckerBinaryPath(newPath);
  };

  useEffect(() => {
    const remover = eventHandler.on(
      CHANNELS.FILE_SELECTED,
      updateCheckerBinaryPath
    );

    return () => {
      remover();
    };
  }, []);

  const onChangeCheckerType = (newCheckerType: CheckerTypeType) => {
    setCheckerType(newCheckerType);
    eventHandler.setCheckerType(newCheckerType);
  };

  const getCheckerMetaComponent = () => {
    if (checkerType === 'epsilon')
      return (
        <NumberSelectionRow
          label="Epsilon"
          type="float"
          min={0}
          max={999999}
          defaultValue={0.000001}
          onChange={(newEps: number) => eventHandler.setEpsilon(newEps)}
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
