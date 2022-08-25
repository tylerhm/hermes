import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import DependencyCheck from './DependencyCheck';
import Home from './Home';
import './App.css';
import {
  CustomInvocationCheckerTypeType,
  DepType,
  InfoType,
  InstallType,
  MultiCaseCheckerTypeType,
  StoreKeyType,
  CppStandardType,
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
        setMultiCaseCheckerType: (
          checkerType: MultiCaseCheckerTypeType
        ) => void;
        setCustomInvocationCheckerType: (
          checkerType: CustomInvocationCheckerTypeType
        ) => void;
        setEpsilon: (epsilon: number) => void;
        setIsCustomInvocation: (isCustomInvocation: boolean) => void;
        setCustomInvocationInput: (customInvocationInput: string) => void;
        setCppStandard: (cppStandard: CppStandardType) => void;
        judge: () => void;
        openCaseInfo: (
          caseID: string,
          infoType: InfoType,
          isCustomInvocation: boolean
        ) => void;
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
