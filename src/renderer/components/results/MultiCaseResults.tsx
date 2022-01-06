import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  ExclamationOutlined,
  FormOutlined,
  LoadingOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Popover } from 'antd';
import Button, { ButtonType } from 'antd-button-color';
import eventHandler from '../../utils/eventHandler';
import { InfoType, VerdictType } from '../../utils/types';
import { MultiCaseResultsType } from '../../hooks/useResults';

type ResultsMetaType = {
  [K in VerdictType]: {
    type: ButtonType;
    icon: React.ReactNode;
  };
};
const RESULT_META: ResultsMetaType = {
  UNKNOWN: {
    type: 'lightdark',
    icon: <LoadingOutlined />,
  },
  AC: {
    type: 'success',
    icon: <CheckOutlined />,
  },
  WA: {
    type: 'danger',
    icon: <CloseOutlined />,
  },
  TLE: {
    type: 'info',
    icon: <ClockCircleOutlined />,
  },
  RTE: {
    type: 'dark',
    icon: <ExclamationOutlined />,
  },
  PE: {
    type: 'warning',
    icon: <FormOutlined />,
  },
  INTERNAL_ERROR: {
    type: 'danger',
    icon: <SettingOutlined />,
  },
};

type PopoverProps = {
  caseID: string;
  messages: Array<string>;
};

// Render the popover content of a result
const PopoverContent = ({ caseID, messages }: PopoverProps) => {
  const requestInfo = (infoType: InfoType) => {
    eventHandler.openCaseInfo(caseID, infoType);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '0.2em',
      }}
    >
      {messages.map((message) => (
        <div key={`${caseID}-${message}`}>{message}</div>
      ))}
      <Button type="dashed" onClick={() => requestInfo('input')}>
        Input
      </Button>
      <Button type="dashed" onClick={() => requestInfo('output')}>
        Judge Output
      </Button>
      <Button type="dashed" onClick={() => requestInfo('userOutput')}>
        User Output
      </Button>
    </div>
  );
};

type Props = {
  results: MultiCaseResultsType;
};

// Render each result as a bubble button
const MultiCaseResults = ({ results }: Props) => {
  return (
    <div
      style={{
        marginTop: '2em',
        marginBottom: '1em',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1em',
      }}
    >
      {Object.entries(results).map(([caseID, result]) => {
        return (
          <Popover
            title={caseID}
            content={
              <PopoverContent caseID={caseID} messages={result.messages} />
            }
            key={caseID}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button
                type={RESULT_META[result.verdict].type}
                shape="circle"
                icon={RESULT_META[result.verdict].icon}
              />
            </div>
          </Popover>
        );
      })}
    </div>
  );
};

export default MultiCaseResults;
