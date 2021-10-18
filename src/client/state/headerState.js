import {
  fromJS
} from 'immutable';
import Constants from '../constants';

// Implement:
// 1. Curation has clickable links in notification. Current TFSUI implementation is limited to just strings.

export const types = {
  HIDE_NOTIFICATION: 'CLEAR_ALL_NOTIFICATION',
  SHOW_NOTIFICATION: 'header/SHOW_NOTIFICATION',
};

export const initialHeaderState = fromJS({
  message: '',
  notificationType: ''
});

// ACTIONS
export const showNotificationWithTimer = (message, notificationType = Constants.notification.info, notificationInterval = Constants.notificationInterval) => (dispatch) => {
  dispatch(showNotification(message, notificationType));
  setTimeout(() => {
    dispatch(hideNotification());
  }, notificationInterval);
};

export const showNotification = (message, notificationType) => ({
  type: types.SHOW_NOTIFICATION,
  message,
  notificationType,
});

export const hideNotification = () => ({
  type: types.HIDE_NOTIFICATION,
});

// REDUCERS
export const headerReducer = (state = initialHeaderState, action) => {
  switch (action.type) {
    case types.HIDE_NOTIFICATION: return initialHeaderState;
    case types.SHOW_NOTIFICATION: {
      return Object.assign({}, state, {
        message: action.message,
        notificationType: action.notificationType,
      });
    }
    default:
      return state;
  }
};

// SELECTORS
export const getHeaderState = (state) => state.get('header');

export const getNotifications = (state) => getHeaderState(state);

// SELECTORS TO BE USED IN COMPONENTS
export const headerSelectors = {
  getNotifications
};


// ACTIONS TO BE DISPATCHED FROM COMPONENTS
export const headerActions = {
  showNotificationWithTimer
};
