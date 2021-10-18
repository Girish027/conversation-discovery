import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PageLayout from '../layouts/PageLayout';
import { basePath } from '../swagger.json';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';


const App = () => (
  <ErrorBoundary>
    <Switch>
      <Route path={basePath} component={PageLayout} />
    </Switch>
  </ErrorBoundary>
);

export default App;
