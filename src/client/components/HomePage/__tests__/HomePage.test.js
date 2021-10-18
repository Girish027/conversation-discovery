import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import HomePage from 'components/HomePage';

describe('<HomePage />', () => {
  let wrapper;

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = shallow(<HomePage />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with Sidebar and content', () => {
      wrapper = shallow(<HomePage />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
