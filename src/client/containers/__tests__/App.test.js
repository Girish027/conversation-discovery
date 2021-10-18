import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import App from 'containers/App';

describe('<App />', function () {
  let wrapper;

  describe('Snapshots', () => {
    test('renders correctly', () => {
      wrapper = shallow(<App />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
