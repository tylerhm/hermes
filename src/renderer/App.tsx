import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './Home';
import './App.css';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        on: (listener: string, func: unknown) => void;
        once: (listener: string, func: unknown) => void;
        removeListener: (listener: string, func: unknown) => void;
        setFile: (key: string, isDirectory: boolean) => void;
        judge: () => void;
      };
    };
  }
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
}
