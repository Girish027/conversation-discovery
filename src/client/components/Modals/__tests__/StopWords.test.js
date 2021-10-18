import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import StopWords from '../CreateRun/StopWords';

describe('<StopWords />', function () {
  let wrapper;


  const props = {
    errorMsg: 'Project ABC already exist',
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<StopWords
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
  });

  describe('Functionality:', () => {
    beforeEach(() => {
      props.onClickBack = jest.fn();
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addStopWord', () => {
      test('should add the stop words', () => {
        wrapper.instance().addStopWord('Hello');
        expect(wrapper.state().stopWords).toEqual(['Hello']);
      });

      test('should not add the stop words if it is already exist', () => {
        wrapper.instance().addStopWord('Hello');
        expect(wrapper.state().stopWords).toEqual(['Hello']);
        wrapper.instance().addStopWord('World');
        expect(wrapper.state().stopWords).toEqual(['Hello', 'World']);
        wrapper.instance().addStopWord('Hello');
        expect(wrapper.state().stopWords).toEqual(['Hello', 'World']);
      });
    });

    describe('updateValue', () => {
      test('should update the input value', () => {
        wrapper.instance().updateValue('Hello');
        expect(wrapper.state().inputValue).toEqual('Hello');
      });

      test('should not update the input value when space is entered', () => {
        wrapper.instance().updateValue(' ');
        expect(wrapper.state().inputValue).toEqual('');
      });
    });

    describe('removeStopWord', () => {
      test('should remove the stop words from the list', () => {
        wrapper.instance().addStopWord('Hello');
        wrapper.instance().addStopWord('World');
        expect(wrapper.state().stopWords).toEqual(['Hello', 'World']);

        wrapper.instance().removeStopWord('Hello');
        expect(wrapper.state().stopWords).toEqual(['World']);
      });
    });

    describe('handleChange', function () {
      test('should pass the props and change the state with new value in the form', () => {
        wrapper.instance().handleChange({
          target: {
            value: 'New Stop Word'
          }
        });
        expect(wrapper.state().inputValue).toEqual('New Stop Word');
      });
    });

    describe('handleBack', function () {
      test('should go back to form page', () => {
        wrapper.instance().onClickBack();
        expect(props.onClickBack).toHaveBeenCalled();
      });
    });

    describe('onEnterPressed', function () {
      test('should add the stopword when enter is pressed', () => {
        const event = {
          target: {
            value: 'New Stop Word'
          },
          keyCode: 13,
        };
        wrapper.instance().onEnterPressed(event);
        expect(wrapper.state().stopWords).toEqual(['New Stop Word']);
      });
    });
  });
});
