import keycode from 'keycode';

export const shouldHandle = (event, acceptedKeys = ['Enter']) => acceptedKeys.some((key) => keycode.isEventKey(event, key));
