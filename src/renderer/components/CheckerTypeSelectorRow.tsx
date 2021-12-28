import { Space } from 'antd';
import { useState } from 'react';
import eventHandler from '../utils/eventHandler';
import { CheckerTypeType } from '../utils/Types';
import DropdownSelectorRow from './DropdownSelectorRow';
import NumberSelectionRow from './NumberSelectionRow';

const CHECKER_TYPE_OPTIONS: Array<CheckerTypeType> = [
  'diff',
  'token',
  'epsilon',
];

const CheckerTypeSelectorRow = () => {
  const [checkerType, setCheckerType] = useState<CheckerTypeType>(
    CHECKER_TYPE_OPTIONS[0]
  );

  const onChangeCheckerType = (newCheckerType: CheckerTypeType) => {
    setCheckerType(newCheckerType);
    eventHandler.setCheckerType(newCheckerType);
  };

  const onChangeEpsilon = (newEpsilon: number) => {
    eventHandler.setEpsilon(newEpsilon);
  };

  const getCheckerMetaComponent = () => {
    if (checkerType === 'epsilon')
      return (
        <NumberSelectionRow
          label="Epsilon"
          type="float"
          min={0}
          defaultValue={0.000001}
          onChange={onChangeEpsilon}
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
