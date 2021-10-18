import React from 'react';
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { ConversationsView } from '../ConversationsView';
import { fromJS } from 'immutable';
import { runActions } from 'state/runsState';
import * as globalActions from 'state/globalActions';
import * as appState from 'state/appState';
import { conversationActions } from 'state/conversationsState';
import Constants from 'components/../constants';
import { clusterActions } from 'state/clusterState';
jest.mock('state/appState');

describe('<ConversationsView />', () => {
  let wrapper;

  const props = {
    clusters :{
      clusterId: '1',
      clusterName: 'topic_intent_1', // this is the one getting edited
      originalName: 'cancel_order_customer_service',
      clusterDescription: 'relates to cancel order',
      rollupCluster: 'Rollup_ABC',
      suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
      count: 230,
      modifiedBy: 'user1@247.ai',
      modified: 1554930400000,
      finalized: false,
      finalizedOn: undefined,
      finalizedBy: '',
      similarityCutOff: 0.79,
    },
    conversations : fromJS([{
      transcriptId: 'qwe-qwe',
      sentenceSet: `Hello! Is it possible to refund an order I canceled through the restaurant $$I was not able to cancel it through door dash but was able to cancel
    through the restaurant . Yes I am. Yes that would be perfect! Thank you so much`,
      originalSimilarity: 0.67,
      originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
      previousCluster: 'previous-cluster-id',
      currentCluster: 'current-cluster-id',
      modifiedBy: 'user1@247.ai',
      modified: 1554930400000,
    }, {
      transcriptId: 'abc-abc',
      sentenceSet: `hello. I placed an order with Garbanzo Mediterranean and the driver called me to inform me that they closed early because of NYE. I tried to
    cancel the order in hopes of a refund and was not allowed to. Am I able to receive a refund since I did not get me food . Will this refund become
    credits or back into my account`,
      originalSimilarity: 0.89,
      originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
      previousCluster: 'previous-cluster-id',
      currentCluster: 'current-cluster-id',
      modifiedBy: 'user1@247.ai',
      modified: 1554930400000,
    }]),
    selectedRunId : '123',
    dispatch: () => {},
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => mount(<ConversationsView
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
      props.dispatch = jest.fn();
      runActions.selectRun = jest.fn(() => 'selectRun');
      globalActions.downloadResults = jest.fn(() => 'downloadResults');
      appState.setModalIsOpen = jest.fn();
      clusterActions.editCluster = jest.fn(() => 'editCluster');
      conversationActions.getConversationTranscript = jest.fn(() => 'getConversationTranscript');
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('goToRunOverview', () => {
      test('should dispatch an action with selected runId', () => {
        wrapper.instance().goToRunOverview();
        expect(props.dispatch).toHaveBeenCalledWith('selectRun');
        expect(runActions.selectRun).toHaveBeenCalledWith(props.selectedRunId);
      });
    });

    describe('getTranscript', () => {
      test('should dispatch an action for getting conversation for Transcript Id', () => {
        const transcriptId = 'qwe-qwe';
        wrapper.instance().getTranscript(transcriptId);
        expect(props.dispatch).toHaveBeenCalledWith('getConversationTranscript');
        expect(conversationActions.getConversationTranscript).toHaveBeenCalled();
      });
    });

    describe('onEditCluster', () => {
      test('should update the existing cluster', () => {
        const newCluster = {
          clusterId: '1',
          clusterName: 'topic_intent_1', // this is the one getting edited
          originalName: 'cancel_order_customer_service',
          clusterDescription: 'relates to cancel order',
          rollupCluster: 'Rollup_ABC',
        };

        const data = {
            clusterName: newCluster.clusterName,
            clusterDescription: newCluster.clusterDescription
        };
        appState.setModalIsOpen.mockReturnValue('setModalIsOpen');
        wrapper.instance().onEditCluster(newCluster);
        expect(props.dispatch).toHaveBeenCalledWith('setModalIsOpen');
        expect(appState.setModalIsOpen).toHaveBeenCalledWith(true, {
          modalName: Constants.modals.editCluster,
          clusterId: newCluster.clusterId,
          formData: data,
        });
      });
    });

    describe('onClickAddToBot', () => {
      test('should open addToBot Dialog', () => {
        appState.setModalIsOpen.mockReturnValue('setModalIsOpen');
        wrapper.instance().onClickAddToBot();
        expect(props.dispatch).toHaveBeenCalledWith('setModalIsOpen');
        expect(appState.setModalIsOpen).toHaveBeenCalled();
      });
    });

    describe('onClickAddToFAQ', () => {
      test('should open onClickAddToFAQ Dialog', () => {
        appState.setModalIsOpen.mockReturnValue('setModalIsOpen');
        wrapper.instance().onClickAddToFAQ();
        expect(props.dispatch).toHaveBeenCalledWith('setModalIsOpen');
        expect(appState.setModalIsOpen).toHaveBeenCalled();
      });
    });

    describe.skip('onConversationSearch', () => {
      test('should change the state of toSearch', () => {
        expect(wrapper.state().toSearch).toBe(false);
        wrapper.instance().onConversationSearch();
        expect(wrapper.state().toSearch).toBe(true);
      });
    });

    describe('onSearch', () => {
      test('should change the state of searchConversatio', () => {
        expect(wrapper.state().searchedConversation).toBe('');
        wrapper.instance().onSearch('abc');
        expect(wrapper.state().searchedConversation).toBe('abc');
      });
    });

    describe.skip('onBlur', () => {
      test('should change the state of toSearch when searchedConversation is null', () => {
        wrapper.instance().onBlur();
        expect(wrapper.state().toSearch).toBe(false);
      });

      test('should not change the state of toSearch when searchedConversation is null', () => {
        wrapper.setState({
          searchedConversation: 'test-conv',
          toSearch: true,
        });
        wrapper.instance().onBlur();
        expect(wrapper.state().toSearch).toBe(true);
      });
    });

    describe('onClickMarkAsReviewed', () => {
      test('should dispacth an action to update cluster', () => {
        wrapper.instance().onClickMarkAsReviewed();
        expect(props.dispatch).toHaveBeenCalledWith('editCluster');
        expect(clusterActions.editCluster).toHaveBeenCalled();
      });
    });
  });
});
