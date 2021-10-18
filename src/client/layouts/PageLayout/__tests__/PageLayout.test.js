import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { PageLayout } from 'layouts/PageLayout/PageLayout';

describe('<PageLayout />', function () {
  let wrapper;

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (props = {}) => shallow(
    <PageLayout {...props} />
  );

  describe('Creating an instance', () => {
    test('should exist - connected component PageLayout', () => {
      wrapper = getShallowWrapper();
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with all the necessary components', () => {
      wrapper = getShallowWrapper();
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
