import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router/immutable';
import {
  fromJS,
} from 'immutable';
import createRootReducer from './reducers';

const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
  stateTransformer: (state) => JSON.parse(JSON.stringify(state)),
  actionTransformer: (action) => JSON.parse(JSON.stringify(action)),
});


const configureStore = (initialState = {}, history) => {
  const middlewares = [
    routerMiddleware(history), // for dispatching history actions
    thunk,
    loggerMiddleware
  ];

  const store = createStore(
    createRootReducer(history),
    fromJS(initialState),
    composeWithDevTools(applyMiddleware(...middlewares))
  );

  // Hot reloading
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createRootReducer(history));
    });
  }

  return store;
};

export default configureStore;
