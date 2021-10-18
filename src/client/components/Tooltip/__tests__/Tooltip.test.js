import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import GenericTooltip from '../Tooltip';

describe('<GenericTooltip />', function () {
  let wrapper;

  const props = {
    content: 'The run is Queued',
    type: 'info',
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(
    <GenericTooltip
      {...propsObj}
    >
      QUEUED
    </GenericTooltip>);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly for the given props', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
