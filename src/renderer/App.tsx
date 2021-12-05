import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './Home';
import './App.css';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
}
