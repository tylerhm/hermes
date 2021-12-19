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
import { VerdictType } from './Types';
import useResults from './useResults';

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

type MessageProps = {
  caseID: string;
  messages: Array<string>;
};
const MessageSplitter = ({ caseID, messages }: MessageProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((message) => (
        <div key={`${caseID}-${message}`}>{message}</div>
      ))}
    </div>
  );
};

const Results = () => {
  const results = useResults();

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
              <MessageSplitter caseID={caseID} messages={result.messages} />
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

export default Results;
