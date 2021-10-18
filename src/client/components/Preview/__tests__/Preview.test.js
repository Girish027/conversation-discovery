import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import Preview from 'components/Preview';

describe('<Preview />', () => {
  let wrapper;

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = shallow(<Preview />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with given information', () => {
      wrapper = shallow(
        <Preview />
      );
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});