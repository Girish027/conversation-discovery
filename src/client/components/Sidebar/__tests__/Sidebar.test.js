import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import Sidebar from 'components/Sidebar';

describe('<Sidebar />', function () {
  let wrapper;

  const getWrapper = () => shallow(
    <Sidebar />
  );
  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getWrapper();
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with routes and is open', () => {
      wrapper = getWrapper();
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when sidebar is closed', () => {
      wrapper = getWrapper();
      wrapper.instance().toggleSidebar();
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when sidebar is closed and then opened', () => {
      wrapper = getWrapper();
      wrapper.instance().toggleSidebar();
      expect(wrapper.state().sidebarOpen).toBe(false);
      wrapper.instance().toggleSidebar();
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
