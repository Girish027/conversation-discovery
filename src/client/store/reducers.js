
import { combineReducers } from 'redux-immutable';
import { connectRouter } from 'connected-react-router/immutable';

import { authReducer, initialAuthState } from '../state/authenticationState';
import { appReducer, initialAppState } from '../state/appState';
import { projectReducer, initialProjectState } from '../state/projectsState';
import { headerReducer, initialHeaderState } from '../state/headerState';
import { runReducer, initialRunsState } from '../state/runsState';
import { clusterReducer, initialClusterState } from '../state/clusterState';
import { conversationReducer, initialConversationsState } from '../state/conversationsState';

export const initialState = {
  auth: initialAuthState,
  app: initialAppState,
  projects: initialProjectState,
  header: initialHeaderState,
  runs: initialRunsState,
  clusters: initialClusterState,
  conversations: initialConversationsState,
};

export default function createReducer(history) {
  const rootReducer = combineReducers({
    auth: authReducer,
    app: appReducer,
    projects: projectReducer,
    header: headerReducer,
    runs: runReducer,
    clusters: clusterReducer,
    conversations: conversationReducer,
  });

  return connectRouter(history)(rootReducer);
}
