import { createSelector } from 'reselect';

// State, actions and reducer for the Router is managed by Connected Router.
// We are just adding selectors here.
export const stateKey = {
  location: 'location',
  hash: 'hash',
  pathname: 'pathname',
  search: 'search',
};

// SELECTORS
export const getRouterState = (state) => state.get('router');

export const getLocationSelector = createSelector(
  getRouterState,
  (routerState) => routerState.get(stateKey.location),
);

export const getSearchSelector = createSelector(
  getLocationSelector,
  (location) => location.get(stateKey.search),
);

export const getPathnameSelector = createSelector(
  getLocationSelector,
  (location) => location.get(stateKey.pathname),
);
