import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { FilterConversations } from '../FilterConversations';

describe('<FilterConversations />', () => {
  let wrapper;

  const props = {};

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<FilterConversations
      {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeEach(() => {
      props.onBlur = jest.fn();
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('handleInputChange', () => {
      test('should change the state of similarity cutoff', () => {
        wrapper.instance().handleInputChange('0.21', 'similarityCutOff');
        expect(wrapper.state().similarityCutOff).toBe(0.21);
      });
    });

    describe('toggleCheckbox', () => {
      test('should change the state of selected value when similarity cut of is null', () => {
        wrapper.instance().toggleCheckbox(true, 'similarityCutOff');
        expect(wrapper.state().selected).toStrictEqual({});
      });

      test('should change the state of selected value when similarity cut of is not null', () => {
        wrapper.setState({similarityCutOff: 0.21});
        wrapper.instance().toggleCheckbox(true, 'similarityCutOff');
        expect(wrapper.state().selected).toEqual({similarity: 0.21});
      });
    });
  });
});
