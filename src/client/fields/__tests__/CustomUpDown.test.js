import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import CustomUpDown from '../CustomUpDown';

describe('<CustomUpDown />', function () {
  let wrapper;

  const props = {
    name: 'test',
    schema: {
      maximum: 900,
      minimum: 2,
      title: 'Clusters (2-900):'
    },
    uiSchema: {}
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = shallow(<CustomUpDown
        {...props}
      />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly for default props', () => {
      wrapper = shallow(<CustomUpDown
        {...props}
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeEach(function () {
      props.onChange = jest.fn();
    });
    describe('onChange', function () {
      test('should pass the props and change the state with new value in the form', () => {
        wrapper = shallow(<CustomUpDown
          {...props}
        />);

        wrapper.instance().handleChange({
          target: {
            name: 'cluster',
            value: '2',
          }
        });
        expect(props.onChange).toHaveBeenCalledWith(2);
        expect(wrapper.state().value).toEqual(2);
      });

      test('should chamge the state in case of validation failure', () => {
        wrapper = shallow(<CustomUpDown
          {...props}
        />);

        expect(wrapper.state().validationMessage).toEqual('');
        wrapper.instance().handleChange({
          target: {
            name: 'cluster',
            value: '1',
            validationMessage: 'Clusters should be greater than 2 char'
          }
        });
        expect(wrapper.state().validationMessage).toEqual('Clusters should be greater than 2 char');
      });
    });
  });
});
