// needed for regenerator-runtime . Ref: https://babeljs.io/blog/2019/03/19/7.4.0
import "core-js/stable";
import "regenerator-runtime/runtime";

// Enzyme adapter for React 16
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

// global.window = global.dom.window;
// global.localStorage = global.window.localStorage;

const noop = () => {
  return null;
};
require.extensions['.css'] = noop;
require.extensions['.scss'] = noop;
