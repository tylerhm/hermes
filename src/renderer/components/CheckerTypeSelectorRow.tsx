import { Space } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import {
  MultiCaseCheckerTypeType,
  CustomInvocationCheckerTypeType,
  StoreKeyType,
} from '../utils/types';
import DropdownSelectorRow from './DropdownSelectorRow';
import FileSelectionRow from './FileSelectionRow';
import NumberSelectionRow from './NumberSelectionRow';

const MULTI_CASE_CHECKER_TYPE_OPTIONS: Array<MultiCaseCheckerTypeType> = [
  'diff',
  'token',
  'epsilon',
  'custom',
];

const CUSTOM_INVOCATION_CHECKER_TYPE_OPTIONS: Array<CustomInvocationCheckerTypeType> =
  ['none', 'custom'];

type CheckerTypeType =
  | MultiCaseCheckerTypeType
  | CustomInvocationCheckerTypeType;

type Props = {
  isCustomInvocation: boolean;
};

// Row with dropdown to select checker
const CheckerTypeSelectorRow = ({ isCustomInvocation }: Props) => {
  const [checkerType, setCheckerType] = useState<CheckerTypeType>(
    isCustomInvocation
      ? CUSTOM_INVOCATION_CHECKER_TYPE_OPTIONS[0]
      : MULTI_CASE_CHECKER_TYPE_OPTIONS[0]
  );
  const [checkerBinaryPath, setCheckerBinaryPath] = useState<
    string | undefined
  >();
  const [epsilon, setEpsilon] = useState<number>(0.0000001);

  const updateCheckerBinaryPath = (key: StoreKeyType, newPath: string) => {
    if (key === 'custom-checker-path') setCheckerBinaryPath(newPath);
  };

  // Handle incoming information from existing store
  const foundInStore = (key: StoreKeyType, res: unknown) => {
    if (key === 'custom-checker-path') setCheckerBinaryPath(res as string);
    else if (key === 'multi-case-checker-type')
      setCheckerType(res as MultiCaseCheckerTypeType);
    else if (key === 'custom-invocation-checker-type')
      setCheckerType(res as CustomInvocationCheckerTypeType);
    else if (key === 'epsilon') setEpsilon(res as number);
  };

  // Ask for all information from store, and listen on file selections
  useEffect(() => {
    const removers: Array<() => void> = [];
    removers.push(
      eventHandler.on(CHANNELS.FILE_SELECTED, updateCheckerBinaryPath)
    );
    removers.push(eventHandler.on(CHANNELS.FOUND_IN_STORE, foundInStore));

    eventHandler.requestFromStore('custom-checker-path');
    eventHandler.requestFromStore('epsilon');

    return () => {
      removers.forEach((remover) => remover());
    };
  }, []);

  // Every time we toggle custom invocation, ask for our store value again
  useEffect(() => {
    if (isCustomInvocation)
      eventHandler.requestFromStore('custom-invocation-checker-type');
    else eventHandler.requestFromStore('multi-case-checker-type');
  }, [isCustomInvocation]);

  const onChangeCheckerType = (newCheckerType: CheckerTypeType) => {
    setCheckerType(newCheckerType);

    if (isCustomInvocation)
      eventHandler.setCustomInvocationCheckerType(
        newCheckerType as CustomInvocationCheckerTypeType
      );
    else
      eventHandler.setMultiCaseCheckerType(
        newCheckerType as MultiCaseCheckerTypeType
      );
  };

  const onChangeEpsilon = (newEpsilon: number) => {
    setEpsilon(newEpsilon);
    eventHandler.setEpsilon(newEpsilon);
  };

  // Returns the necessary supplementary component for a given checker type.
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
        choices={
          isCustomInvocation
            ? CUSTOM_INVOCATION_CHECKER_TYPE_OPTIONS
            : MULTI_CASE_CHECKER_TYPE_OPTIONS
        }
        onSelect={(value: string) =>
          onChangeCheckerType(value as CheckerTypeType)
        }
      />
      {getCheckerMetaComponent()}
    </Space>
  );
};

export default CheckerTypeSelectorRow;
