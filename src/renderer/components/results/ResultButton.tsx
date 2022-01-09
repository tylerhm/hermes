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
import { ButtonShape } from 'antd/lib/button';
import eventHandler from '../../utils/eventHandler';
import { InfoType, ResponseType, VerdictType } from '../../utils/types';

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
  identifier: string;
  response: ResponseType;
  isCustomInvocation: boolean;
};

// Render the popover content of a result
const PopoverContent = ({
  identifier,
  response,
  isCustomInvocation,
}: PopoverProps) => {
  const requestInfo = (infoType: InfoType) => {
    eventHandler.openCaseInfo(identifier, infoType, isCustomInvocation);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '0.2em',
      }}
    >
      {response.messages}
      <Button type="dashed" onClick={() => requestInfo('input')}>
        Input
      </Button>
      {isCustomInvocation ? null : (
        <Button type="dashed" onClick={() => requestInfo('output')}>
          Judge Output
        </Button>
      )}
      <Button type="dashed" onClick={() => requestInfo('userOutput')}>
        User Output
      </Button>
    </div>
  );
};

type Props = {
  identifier: string;
  response: ResponseType;
  shape: ButtonShape;
  isCustomInvocation: boolean;
  style?: React.CSSProperties;
};

const ResultButton = ({
  identifier,
  response,
  shape,
  isCustomInvocation,
  style,
}: Props) => {
  return (
    <Popover
      title={identifier}
      content={
        <PopoverContent
          identifier={identifier}
          response={response}
          isCustomInvocation={isCustomInvocation}
        />
      }
      key={identifier}
    >
      <Button
        type={RESULT_META[response.verdict].type}
        shape={shape}
        icon={RESULT_META[response.verdict].icon}
        style={style}
      />
    </Popover>
  );
};

ResultButton.defaultProps = {
  style: null,
};

export default ResultButton;
