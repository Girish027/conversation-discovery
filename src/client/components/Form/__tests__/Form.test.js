import React from 'react';
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';

import Form from '../Form';
import createRunUiSchema from '../../../schema/createRun/uiSchema.json';
import createRunJsonSchema from '../../../schema/createRun/jsonSchema.json';

describe('<Form />', function () {
  let wrapper;


  const props = {
    uiSchema: createRunUiSchema,
    jsonSchema: createRunJsonSchema,
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<Form
    {...propsObj}
  />);

  const getMountWrapper = (propsObj) => mount(<Form
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getMountWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with default props', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
