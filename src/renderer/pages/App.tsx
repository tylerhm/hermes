import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import DependencyCheck from './DependencyCheck';
import Home from './Home';
import './App.css';
import {
  CheckerTypeType,
  DepType,
  InfoType,
  InstallType,
  StoreKeyType,
} from '../utils/types';

// Interface so that typescript doesn't get mad about main -> renderer comms
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        on: (listener: string, func: unknown) => () => void;
        once: (listener: string, func: unknown) => void;
        requestFromStore: (key: StoreKeyType) => void;
        checkDeps: () => void;
        installDep: (
          dep: DepType,
          installType: InstallType,
          packageName: string
        ) => void;
        setFile: (key: string, isDirectory: boolean) => void;
        setTimeLimit: (limit: number) => void;
        setCheckerType: (checkerType: CheckerTypeType) => void;
        setEpsilon: (epsilon: number) => void;
        judge: () => void;
        openCaseInfo: (caseID: string, infoType: InfoType) => void;
      };
    };
  }
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={DependencyCheck} />
        <Route path="/home" component={Home} />
      </Switch>
    </Router>
  );
}
