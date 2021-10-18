import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import CustomTextField from '../CustomTextField';

describe('<CustomTextField />', function () {
  let wrapper;

  const props = {
    name: 'testName',
    schema: {
      maxLength: 150,
      minLength: 5,
      placeholder: 'Name this iteration',
      title: 'Name',
      type: 'string',
    },
    uiSchema: {},
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = shallow(<CustomTextField
        {...props}
      />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly for default props', () => {
      wrapper = shallow(<CustomTextField
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
        wrapper = shallow(<CustomTextField
          {...props}
        />);

        wrapper.instance().handleChange({
          target: {
            name: 'runName',
            value: 'Run Name'
          }
        });
        expect(props.onChange).toHaveBeenCalledWith('Run Name');
        expect(wrapper.state().value).toEqual('Run Name');
      });

      test('should chamge the state in case of validation failure', () => {
        wrapper = shallow(<CustomTextField
          {...props}
        />);

        expect(wrapper.state().validationMessage).toEqual('');
        wrapper.instance().handleChange({
          target: {
            name: 'runName',
            value: 'Run Name',
            validationMessage: 'Name should not be less than 4 char'
          }
        });
        expect(wrapper.state().validationMessage).toEqual('Name should not be less than 4 char');
      });
    });
  });
});
