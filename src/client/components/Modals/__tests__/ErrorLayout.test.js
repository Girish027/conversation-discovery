import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ErrorLayout from '../ErrorLayout';

describe('<ErrorLayout />', function () {
  let wrapper;


  const props = {
    errorMsg: 'Project ABC already exist',
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<ErrorLayout
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with default props', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when styleOverride props is passed', () => {
      const newProps = {
        errorMsg: 'Run ABC already exist',
        styleOverride: { marginBottom: '20px' }
      };
      wrapper = getShallowWrapper(newProps);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
