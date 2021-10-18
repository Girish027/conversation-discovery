import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import SearchBox from '../SearchBox';

describe('<SearchBox />', () => {
  let wrapper;

  const props = {
    placeholder: 'Find Topics',
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<SearchBox
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
      props.onSearch = jest.fn();
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onSearch', () => {
      test('should change the value of searchString', () => {
        const event = {
          target: {
            value: 'New Search'
          }
        };
        expect(wrapper.state().value).toEqual('');
        wrapper.instance().onSearch(event);
        expect(wrapper.state().value).toEqual('New Search');
        expect(props.onSearch).toHaveBeenCalled();
      });
    });

    describe('onClickClear', () => {
      test('should clear the value of searchString', () => {
        wrapper.instance().onClickClear();
        expect(wrapper.state().value).toEqual('');
        expect(props.onSearch).toHaveBeenCalled();
      });
    });

    describe('onEnterPressed', function () {
      test('should update the search value when enter is pressed', () => {
        const event = {
          target: {
            value: 'New Search'
          },
          keyCode: 13,
        };
        wrapper.instance().onKeyPress(event);
        expect(wrapper.state().value).toEqual('New Search');
        expect(props.onSearch).toHaveBeenCalled();
      });
    });
  });
});
