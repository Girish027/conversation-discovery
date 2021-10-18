import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router/immutable';

import configureStore from './store/configureStore';
import { initialState } from './store/reducers';
import history from './store/history';

import App from './containers/App';
import './styles/global.scss';

const store = configureStore(initialState, history);
const NODE = document.getElementById('app');
const render = () => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>
    </AppContainer>,
    NODE);
};

render();


// Hot reloading
if (module.hot) {
  // Reload components
  module.hot.accept('./containers/App', () => {
    ReactDOM.unmountComponentAtNode(NODE);
    render();
  });
}
