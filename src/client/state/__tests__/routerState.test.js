import * as routerState from 'state/routerState';
import {
  fromJS, List
} from 'immutable';

const location = {
  pathname: '/conversationdiscovery/ui/discover-intents',
  search: '?clientid=testclientone&accountid=service&appid=testclientone&componentClientId=testclientone'
}
describe('state/RouterState:', function () {
  const {
    stateKey
  } = routerState;

  describe('RouterSelectors Selectors:', function () {
    let state;
     
    beforeAll(() => {
      state = fromJS({
        router: {
          location: {
            pathname: '/conversationdiscovery/ui/discover-intents',
            search: '?clientid=testclientone&accountid=service&appid=testclientone&componentClientId=testclientone'
          }
        }
      });     
    });

    test('getRouterState', function () {
      expect(routerState.getRouterState(state)).toEqual(state.get('router'));
    });

    test('getLocationSelector', function () {
      expect(routerState.getLocationSelector(state).toJS()).toEqual(location);
    });

    test('getSearchSelector', function () {
      expect(routerState.getSearchSelector(state)).toEqual(location.search);
    });

    test('getPathnameSelector', function () {
      expect(routerState.getPathnameSelector(state)).toEqual(location.pathname);
    });

  });
});