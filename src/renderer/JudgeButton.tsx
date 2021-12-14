import { Button } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from './channels';
import eventHandler from './eventHandler';
import JudgePrepProgress from './JudgePrepProgress';

const JudgeButton = () => {
  const [spin, setSpin] = useState<boolean>(false);

  useEffect(() => {
    window.electron.ipcRenderer.on(CHANNELS.DONE_JUDGING, () => setSpin(false));
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
