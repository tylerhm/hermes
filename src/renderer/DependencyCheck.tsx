import { useHistory } from 'react-router';
import { Button, List, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from './channels';
import eventHandler from './eventHandler';

type DepsStatusType = {
  python3: boolean;
  apollo: boolean;
};

/*
 * Render a splash screen to check dependencies
 * Only allow user to proceed if deps are found
 */
const DependencyCheck = () => {
  const history = useHistory();

  const [depsStatus, setDepsStatus] = useState<DepsStatusType>({
    python3: false,
    apollo: false,
  });
  const [checking, setChecking] = useState<boolean>(true);

  const getMissingDeps = () => {
    const missingDeps: Array<string> = [];
    Object.entries(depsStatus).forEach(([dep, exists]) => {
      if (!exists) missingDeps.push(dep);
    });
    return missingDeps;
  };

  const checkDeps = () => {
    setChecking(true);
    eventHandler.checkDeps();
  };

  useEffect(() => {
    checkDeps();

    const updateDeps = (newDepsStatus: DepsStatusType) => {
      if (Object.values(newDepsStatus).every((value) => value))
        history.push('/home');

      setChecking(false);
      setDepsStatus(newDepsStatus);
    };

    eventHandler.on(CHANNELS.DEPS_CHECKED, updateDeps);

    return () => {
      eventHandler.removeListener(CHANNELS.DEPS_CHECKED, updateDeps);
    };
    // Fine here, as history will only change once on success.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        padding: '1em',
      }}
    >
      {checking ? (
        <>
          <h2 style={{ marginBottom: '3em' }}>Detecing dependencies...</h2>
          <Spin />
        </>
      ) : (
        <>
          <List
            header={<h2>Missing dependencies</h2>}
            dataSource={getMissingDeps()}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text>{item}</Typography.Text>
              </List.Item>
            )}
            style={{ marginBottom: '3em' }}
          />
          <Button type="primary" onClick={checkDeps}>
            Detect
          </Button>
        </>
      )}
    </div>
  );
};

export default DependencyCheck;
