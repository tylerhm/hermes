import { useHistory } from 'react-router';
import { Button, List, message, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from '../utils/channels';
import eventHandler from '../utils/eventHandler';
import { DepType, InstallType } from '../utils/types';

type DepInfoType = {
  installable: boolean;
  installType?: InstallType;
  packageName?: string;
};
type DepsMetaType = {
  [D in DepType]: DepInfoType;
};

const depsMeta: DepsMetaType = {
  'Python 3': {
    installable: false,
  },
  Apollo: {
    installable: true,
    installType: 'pip',
    packageName: 'apollo-tylerhm',
  },
  'xdg-open-wsl': {
    installable: true,
    installType: 'pip',
    packageName: 'git+https://github.com/cpbotha/xdg-open-wsl.git',
  },
  wsl: {
    installable: false,
  },
};

type DepsStatusType = {
  [D in DepType]: boolean;
};
const startingDeps: DepsStatusType = {
  'Python 3': false,
  Apollo: false,
  'xdg-open-wsl': false,
  wsl: false,
};

type DepsInstallingType = {
  [D in DepType]: boolean;
};
const startingDepInstalling: DepsInstallingType = {
  'Python 3': false,
  Apollo: false,
  'xdg-open-wsl': false,
  wsl: false,
};

/*
 * Render a splash screen to check dependencies
 * Only allow user to proceed if deps are found
 */
const DependencyCheck = () => {
  const history = useHistory();

  const [depsStatus, setDepsStatus] = useState<DepsStatusType>(startingDeps);
  const [depsInstalling, setDepsInstalling] = useState<DepsInstallingType>(
    startingDepInstalling
  );
  const [checking, setChecking] = useState<boolean>(true);

  const checkDeps = () => {
    setChecking(true);
    // UI smoothness
    setTimeout(eventHandler.checkDeps, 500);
  };

  // Should run once, subscribe to dependency changes
  useEffect(() => {
    const updateDeps = (newDepsStatus: DepsStatusType) => {
      if (Object.values(newDepsStatus).every((value) => value))
        history.push('/home');

      setChecking(false);
      setDepsStatus(newDepsStatus);
    };

    const remover = eventHandler.on(CHANNELS.DEPS_CHECKED, updateDeps);

    checkDeps();

    return () => {
      remover();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle installing updates
  useEffect(() => {
    const depInstalled = (dep: DepType, successful: boolean) => {
      setDepsInstalling({ ...depsInstalling, [dep]: false });
      if (successful) checkDeps();
      else
        message.error(
          `Unable to install dependency '${dep}'. Please ensure that python3 and pip are installed.`
        );
    };

    const remover = eventHandler.on(CHANNELS.DEP_INSTALLED, depInstalled);

    return () => {
      remover();
    };
  }, [depsInstalling]);

  // Return list of missing dependencies
  const getMissingDeps = () => {
    const missingDeps: Array<DepType> = [];
    Object.entries(depsStatus).forEach(([dep, satisfied]) => {
      if (!satisfied) missingDeps.push(dep as DepType);
    });
    return missingDeps;
  };

  // Install the required dependency
  const installDep = (dep: DepType) => {
    const { installType, packageName } = depsMeta[dep];
    if (installType == null || packageName == null) return;
    setDepsInstalling({ ...depsInstalling, [dep]: true });
    eventHandler.installDep(dep, installType, packageName);
  };

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
          <h2 style={{ marginBottom: '3em' }}>Detecting dependencies...</h2>
          <Spin />
        </>
      ) : (
        <>
          <List
            header={<h2>Missing dependencies</h2>}
            dataSource={getMissingDeps()}
            renderItem={(item: DepType) => (
              <List.Item
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Typography.Text>{item}</Typography.Text>
                {depsMeta[item].installable ? (
                  <Button
                    disabled={!depsStatus['Python 3']}
                    loading={depsInstalling[item]}
                    onClick={() => installDep(item)}
                  >
                    {depsInstalling[item] ? 'Installing' : 'Install'}
                  </Button>
                ) : null}
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
