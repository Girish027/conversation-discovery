import React from 'react';
import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ConversationSearchBar from '../ConversationSearchBar';

describe('<ConversationSearchBar />', () => {
  let wrapper;

  const props = {};

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getMountWrapper = (propsObj) => mount(<ConversationSearchBar
      {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getMountWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly', () => {
      wrapper = getMountWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeEach(() => {
      props.onBlur = jest.fn();
      props.onSearch = jest.fn();
      wrapper = getMountWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onBlur', () => {
      test('should remove the focus', () => {
        wrapper.instance().onBlur();
        expect(props.onBlur).toHaveBeenCalled();
      });
    });

    describe('onSearch', () => {
      test('should change the state of value', () => {
        const event = {
          target: {
            value: 'Search Conversation'
          }
        }
        wrapper.instance().onSearch(event, false);
        expect(wrapper.state().value).toEqual('Search Conversation');
        expect(props.onSearch).toHaveBeenCalledWith('Search Conversation', false);
      });
    });

    describe('onClickClear', () => {
      test('should change the state of value', () => {
        wrapper.instance().onClickClear();
        expect(wrapper.state().value).toEqual('');
        expect(props.onSearch).toHaveBeenCalledWith('');
      });
    });
  });
});
