import en from './en';
import Constants from '../constants';

const helper = (() => {
  switch (Constants.locale) {
    case 'en': return en;
    default: return en;
  }
})();

export default helper;
