import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import Placeholder from 'components/Placeholder';

describe('<Placeholder />', () => {
  let wrapper;

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = shallow(<Placeholder />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with given information', () => {
      wrapper = shallow(
        <Placeholder>
          placeholder message
        </Placeholder>
      );
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
