import { Progress } from 'antd';
import CHANNELS from '../utils/channels';
import usePrepStatus from '../hooks/usePrepStatus';

// Order specific preparation steps
const multiCaseSteps = [CHANNELS.DONE_COMPILING, CHANNELS.DONE_COLLECT_DATA];
const customInvocationSteps = [CHANNELS.DONE_COMPILING];

type Props = {
  isCustomInvocation: boolean;
  onError: () => void;
};

const JudgePrepProgress = ({ isCustomInvocation, onError }: Props) => {
  const [progress, error] = usePrepStatus(
    isCustomInvocation ? customInvocationSteps : multiCaseSteps,
    onError
  );
  return (
    <Progress
      percent={progress as number}
      status={(error as boolean) ? 'exception' : undefined}
      showInfo={false}
    />
  );
};

export default JudgePrepProgress;
