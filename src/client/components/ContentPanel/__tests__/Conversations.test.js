import React from 'react';
import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { Conversations } from '../Conversations';

describe('<Conversations />', () => {
  let wrapper;

  const conversations = [{
    transcriptId: 'qwe-qwe',
    sentenceSet: `Hello! Is it possible to refund an order I canceled through the restaurant $$I was not able to cancel it through door dash but was able to cancel
  through the restaurant . Yes I am. Yes that would be perfect! Thank you so much`,
    originalSimilarity: 0.67,
    originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
    previousCluster: 'previous-cluster-id',
    currentCluster: 'current-cluster-id',
    modifiedBy: 'user1@247.ai',
    modified: 1554930400000,
  }];

  const props = {
    selectedConversations : jest.fn(),
    data: conversations
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getMountWrapper = (propsObj) => mount(<Conversations
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

    describe('updateSelectedConversations', () => {
      test('should change the state of selectedConversations', () => {
        wrapper.instance().updateSelectedConversations(conversations);
        expect(wrapper.state().selectedConversations).toBe(conversations);
      });
    });

    describe('toggleSelectAll', () => {
      test('should update selected conversations if checked is true', () => {
        wrapper.instance().toggleSelectAll(true);
        expect(wrapper.state().selectedConversations).toBe(conversations);
      });

      test('should update selected conversations if checked is false', () => {
        wrapper.instance().toggleSelectAll(false);
        expect(wrapper.state().selectedConversations).toEqual([]);
      });
    });
  });
});
