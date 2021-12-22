import { useHistory } from 'react-router';
import { Button, List, message, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import CHANNELS from './channels';
import eventHandler from './eventHandler';
import { DepType, InstallType } from './Types';

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
};

type DepsStatusType = {
  [D in DepType]: boolean;
};
const startingDeps: DepsStatusType = {
  'Python 3': false,
  Apollo: false,
  'xdg-open-wsl': false,
};

type DepsInstallingType = {
  [D in DepType]: boolean;
};
const startingDepInstalling: DepsInstallingType = {
  'Python 3': false,
  Apollo: false,
  'xdg-open-wsl': false,
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

  const updateDepsInstalling = (dep: DepType, installing: boolean) => {
    setDepsInstalling({ ...depsInstalling, [dep]: installing });
  };

  const checkDeps = () => {
    setChecking(true);
    eventHandler.checkDeps();
  };

  const depInstalled = (dep: DepType, successful: boolean) => {
    updateDepsInstalling(dep, false);
    if (successful) checkDeps();
    else
      message.error(
        `Unable to install dependency '${dep}'. Please ensure that python3 is installed.`
      );
  };

  useEffect(() => {
    const updateDeps = (newDepsStatus: DepsStatusType) => {
      if (Object.values(newDepsStatus).every((value) => value))
        history.push('/home');

      setChecking(false);
      setDepsStatus(newDepsStatus);
    };

    eventHandler.on(CHANNELS.DEPS_CHECKED, updateDeps);
    eventHandler.on(CHANNELS.DEP_INSTALLED, depInstalled);

    checkDeps();

    return () => {
      eventHandler.removeListener(CHANNELS.DEPS_CHECKED, updateDeps);
      eventHandler.removeListener(CHANNELS.DEP_INSTALLED, depInstalled);
    };
    // Fine here, as history will only change once on success.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    updateDepsInstalling(dep, true);
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
          <h2 style={{ marginBottom: '3em' }}>Detecing dependencies...</h2>
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
                {depsStatus[item] ? null : (
                  <Button
                    disabled={!depsStatus['Python 3']}
                    loading={depsInstalling[item]}
                    onClick={() => installDep(item)}
                  >
                    {depsInstalling[item] ? 'Installing' : 'Install'}
                  </Button>
                )}
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
