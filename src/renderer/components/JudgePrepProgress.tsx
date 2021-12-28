import { Progress } from 'antd';
import CHANNELS from '../utils/channels';
import usePrepStatus from '../hooks/usePrepStatus';

const steps = [CHANNELS.DONE_COLLECT_DATA, CHANNELS.DONE_COMPILING];

type Props = {
  onError: () => void;
};

const JudgePrepProgress = ({ onError }: Props) => {
  const [progress, error] = usePrepStatus(steps, onError);
  return (
    <Progress
      percent={progress as number}
      status={(error as boolean) ? 'exception' : undefined}
      showInfo={false}
    />
  );
};

export default JudgePrepProgress;
