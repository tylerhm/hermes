import { Button } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import JudgePrepProgress from './JudgePrepProgress';

const JudgeButton = () => {
  const [spin, setSpin] = useState<boolean>(false);

  const unSpin = () => {
    setSpin(false);
  };

  useEffect(() => {
    const remover = eventHandler.on(CHANNELS.DONE_JUDGING, unSpin);
    return () => {
      remover();
    };
  });

  const startJudging = () => {
    eventHandler.judge();
    setSpin(true);
  };

  return (
    <>
      <Button
        type="primary"
        style={{ width: '100%' }}
        onClick={startJudging}
        loading={spin}
      >
        Judge!
      </Button>
      <JudgePrepProgress
        onError={() => {
          setSpin(false);
        }}
      />
    </>
  );
};

export default JudgeButton;
