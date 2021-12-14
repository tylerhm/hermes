import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  ExclamationOutlined,
  LoadingOutlined,
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
};

const Results = () => {
  const results = useResults();

  return (
    <div
      style={{
        marginTop: '2em',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1em',
      }}
    >
      {Object.entries(results).map(([caseID, status]) => {
        return (
          <Popover title={caseID} key={caseID}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button
                type={RESULT_META[status].type}
                shape="circle"
                icon={RESULT_META[status].icon}
              />
            </div>
          </Popover>
        );
      })}
    </div>
  );
};

export default Results;
