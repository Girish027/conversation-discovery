import * as headerState from 'state/headerState';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fromJS } from 'immutable';
import Constants from 'components/../constants';

jest.useFakeTimers();

const {
  headerReducer,
  types,
} = headerState;

describe('state/Header:', function () {
  describe('Header Actions:', function () {
    let store;

    const newHeaderState = {
      message: 'Run Created Successfully',
      notificationType: Constants.notification.success
    };

    beforeAll(() => {
      const middlewares = [thunk];
      const mockStore = configureStore(middlewares);
      store = mockStore(fromJS({
        header: headerState.initialHeaderState,
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('showNotificationWithTimer:', () => {
      test('should dispatch action to show notification', () => {
        store.dispatch(headerState.showNotificationWithTimer(newHeaderState.message, newHeaderState.notificationType));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch action to show notification and hide the notification after some time', () => {
        store.dispatch(headerState.showNotificationWithTimer(newHeaderState.message, newHeaderState.notificationType));
        jest.advanceTimersByTime(2000);
        expect(headerState.hideNotification()).toEqual({ type: 'CLEAR_ALL_NOTIFICATION' });
      });
    });

    describe('showNotification:', () => {
      test('should dispatch actions with proper data', () => {
        store.dispatch(headerState.showNotification(newHeaderState.message, newHeaderState.notificationType));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('hideNotification:', () => {
      test('should dispatch actions to clear the notification data', () => {
        store.dispatch(headerState.hideNotification());
        expect(store.getActions()).toMatchSnapshot();
      });
    });
  });

  describe('Header Reducers: ', function () {
    test('should return the initial state', () => {
      const newState = headerReducer(undefined, {
        type: types.NOOP,
      });
      expect(newState).toEqual(headerState.initialHeaderState);
    });

    test('HIDE_NOTIFICATION', () => {
      const currentState = fromJS({
        message: 'Run Created Successfully',
        notificationType: Constants.notification.success
      });
      const newState = headerReducer(currentState, {
        type: types.HIDE_NOTIFICATION
      });
      expect(newState).toEqual(headerState.initialHeaderState);
    });

    test('SHOW_NOTIFICATION', () => {
      const currentState = fromJS({
        message: 'Run Created Successfully',
        notificationType: Constants.notification.success
      });
      const newState = headerReducer(currentState, {
        type: types.SHOW_NOTIFICATION
      });
      expect(newState).toEqual(currentState);
    });
  });

  describe('Header Selectors:', function () {
    let state;

    beforeAll(() => {
      state = fromJS({
        header: fromJS({
          message: 'Run Created Successfully',
          notificationType: Constants.notification.info
        })
      });
    });

    test('getHeaderState', function () {
      expect(headerState.getHeaderState(state)).toEqual(state.get('header'));
    });

    test('getNotifications', function () {
      expect(headerState.getNotifications(state)).toEqual(state.get('header'));
    });
  });
});
