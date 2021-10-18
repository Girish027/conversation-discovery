import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  List, Map
} from 'immutable';
import _ from 'lodash';
import Placeholder from 'components/Placeholder';
import {
  Pencil,
  Button,
  ContextualActionItem,
  Checkmark,
} from '@tfs/ui-components';
import { runActions, runSelectors } from 'state/runsState';
import {
  clusterSelectors, clusterActions
} from 'state/clusterState';
import {
  conversationSelectors, conversationActions, setDefaultConversations
} from 'state/conversationsState';
import Constants from 'components/../constants';
import IconButton from 'components/IconButton';
import LoadingIndicator from 'components/LoadingIndicator';
import KeywordsSearchBar from '../KeywordsSearchBar';
import { clusterAction } from '../../styles/index';
import { ConversationsTable } from './ConversationsTable';
import {
  setModalIsOpen, getIsConversationsSelector, getIsAnswersSelector, getRoleConfigSelector
} from '../../state/appState';
import { windowStyleConversationView } from 'styles';
import { prepareClusterName } from '../../utils/stringOperations';

export class ConversationsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cluster: {},
      conversations: [],
      selectedConvList: [],
      searchedConversation: '',
      filteredItems: {},
      selectedAction: Constants.utteranceMode.conversations,
      modeAnswers: false
    };
  }

  static getDerivedStateFromProps(props) {
    const { cluster, conversations } = props;
    return {
      cluster: cluster.toJS(),
      conversations: conversations.toJS(),
    };
  }

  componentDidMount() {
    const { dispatch, isAnswers, isConversations } = this.props;
    if (isConversations) {
      dispatch(conversationActions.getIntents());
    }
    if (isAnswers) {
      dispatch(conversationActions.getInterfaces());
    }
    dispatch(conversationActions.getAllConversations());
  }

  // gets transcript for a particular conversation
  getTranscript = (transcriptId) => {
    const { dispatch } = this.props;
    dispatch(conversationActions.getConversationTranscript(transcriptId));
  }

  goToRunOverview = () => {
    const { selectedRunId, dispatch } = this.props;
    dispatch(runActions.selectRun(selectedRunId));
  };

  // sample code for testing Edit on cluster
  onEditCluster = (cluster) => {
    const { dispatch } = this.props;

    const data = {
      clusterName: cluster.clusterName,
      clusterDescription: cluster.clusterDescription
    };

    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.editCluster,
      clusterId: cluster.clusterId,
      formData: data,
    }));
  };

  resetConversations = (utterances) => {
    const utt = utterances || [];
    const data = this.state.selectedConvList;
    if ((data.length === 0) && (utt.length !== 0)) {
      utt.forEach((element) => {
        const obj = {};
        obj.sentenceSet = element.utterance;
        obj.transcriptId = element.utteranceId;
        data.push(obj);
      });
    }
    return data;
  }

  onClickAddToBot = () => {
    const { dispatch, selectedConversation } = this.props;
    const utterances = (selectedConversation) ? selectedConversation.utterances : [];
    const data = this.resetConversations(utterances);
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.addToBot,
      data,
      selectedConversations: (selectedConversations) => this.selectedConversations(selectedConversations)
    }));
  };

  onClickAddToFAQ = () => {
    const { dispatch, selectedConversation } = this.props;
    const utterances = (selectedConversation) ? selectedConversation.utterances : [];
    const data = this.resetConversations(utterances);
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.addToFaq,
      data,
      selectedConversations: (selectedConversations) => this.selectedConversations(selectedConversations)
    }));
  };

  onSearch = (searchedConversation, enterPressed) => {
    const { dispatch } = this.props;
    this.setState({
      searchedConversation
    });

    let searchItems;
    if (searchedConversation !== '') {
      searchItems = { ...this.state.filteredItems, search: searchedConversation };
    } else {
      searchItems = { ...this.state.filteredItems };
    }
    if (enterPressed) {
      dispatch(conversationActions.getAllConversations(searchItems));
    }
  }

  onFilter = (filteredItems) => {
    const { dispatch } = this.props;
    this.setState({
      filteredItems
    });
    let searchItems;
    if (filteredItems.similarity != null) {
      if (this.state.searchedConversation !== '') {
        searchItems = { search: this.state.searchedConversation, similarity: filteredItems.similarity };
      } else {
        searchItems = { similarity: filteredItems.similarity };
      }
      dispatch(conversationActions.getAllConversations(searchItems));
    } else {
      if (this.state.searchedConversation !== '') {
        searchItems = { search: this.state.searchedConversation };
      }
      if (_.isEmpty(searchItems)) {
        dispatch(conversationActions.getAllConversations());
      } else {
        dispatch(conversationActions.getAllConversations(searchItems));
      }
    }
  }

  onClickMarkAsReviewed = () => {
    const { cluster } = this.state;
    const { dispatch } = this.props;
    const data = {
      type: 'finalize'
    };
    dispatch(clusterActions.editCluster(cluster.clusterId, data));
    window.location.reload();
  };

  handleModeChange = () => {
    const { dispatch } = this.props;
    const { modeAnswers } = this.state;
    const selectedMode = (!modeAnswers) ? Constants.utteranceMode.answers : Constants.utteranceMode.conversations;
    dispatch(setDefaultConversations());
    this.setState((prevState) => ({
      modeAnswers: !prevState.modeAnswers,
      selectedConvList: [],
      selectedAction: selectedMode
    }));
  };

  renderClusterHeaderBar = () => {
    const { cluster, selectedConvList, modeAnswers } = this.state;
    const { clusterName } = cluster;
    const {
      isAnswers, isConversations, selectedConversation, roleConfig
    } = this.props;
    const utteranceList = (selectedConversation === undefined) ? [] : selectedConversation.utterances;
    const utterLength = (utteranceList) ? utteranceList.length : 0;
    return (
      <div
        style={clusterAction.renameIconLabel}
      >
        <div
          className='cluster-header'
          style={clusterAction.renameIconLabel.children}
        >
          <div style={clusterAction.renameIconLabel.clusterName}>
            <span
              role='button'
              tabIndex={0}
            >
              {prepareClusterName(clusterName)}
            </span>
            { roleConfig.editPotentialIntentsNames
              ? (
                <IconButton
                  icon={Pencil}
                  onClick={() => this.onEditCluster(cluster)}
                  defaultColor='none'
                  strokeColor='#004c97'
                  height={13}
                  width={13}
                  padding={'5px'}
                />
              ) : null }
          </div>
        </div>

        <div
          className='add-to-container'
          style={{
          }}
        >
          { roleConfig.markAsReviewed
            ? (
              <Button
                styleOverride={clusterAction.buttons}
                type='flat'
                name='run-overview'
              >
                { !this.state.cluster.finalized ? (
                  <ContextualActionItem
                    icon={Checkmark}
                    onClickAction={this.onClickMarkAsReviewed}
                    styleOverride={{
                      marginTop: '0px',
                      paddingLeft: '10px',
                    }}
                  >
                MARK AS REVIEWED
                  </ContextualActionItem>
                ) : (
                  <ContextualActionItem
                    icon={Checkmark}
                    disabled
                    styleOverride={{
                      color: '#c6c6c6',
                      marginTop: '0px',
                      paddingLeft: '10px',
                    }}
                  >
                  REVIEWED
                  </ContextualActionItem>
                )
                }
              </Button>
            ) : null }
          {(isAnswers && isConversations && roleConfig.addToConversations && roleConfig.addToAnswers) ? (
            <div style={clusterAction.modeSwitch}>
              <Button
                name='conversation-mode'
                type='flat'
                styleOverride={
                  (modeAnswers)
                    ? { ...clusterAction.modeSwitch.conversations, ...clusterAction.modeSwitch.off }
                    : { ...clusterAction.modeSwitch.conversations, ...clusterAction.modeSwitch.on }
                }
                onClick={(modeAnswers) ? this.handleModeChange : () => { }}
              >
                {Constants.utteranceMode.conversations}
              </Button>
              <Button
                name='answers-mode'
                type='flat'
                styleOverride={
                  (modeAnswers)
                    ? { ...clusterAction.modeSwitch.answers, ...clusterAction.modeSwitch.on }
                    : { ...clusterAction.modeSwitch.answers, ...clusterAction.modeSwitch.off }
                }
                onClick={(modeAnswers) ? () => { } : this.handleModeChange}
              >
                {Constants.utteranceMode.answers}
              </Button>
            </div>
          ) : null}
          { (roleConfig.addToAnswers && roleConfig.addToConversations)
            ? (
              <Button
                styleOverride={clusterAction.buttons.lastChild}
                type='primary'
                disabled={selectedConvList.length === 0 && utterLength === 0}
                name='add-bot'
                onClick={(isAnswers && isConversations) ? ((this.state.modeAnswers)
                  ? this.onClickAddToFAQ : this.onClickAddToBot)
                  : ((isConversations && !isAnswers) ? this.onClickAddToBot : this.onClickAddToFAQ)}
              >
                {(isAnswers && isConversations) ? ((this.state.modeAnswers)
                  ? Constants.buttons.addToBotIntent : Constants.buttons.addToBotIntent)
                  : ((isConversations && !isAnswers) ? Constants.buttons.addToBotIntent : Constants.buttons.addToBotIntent)}
              </Button>
            ) : null }
        </div>
      </div>
    );
  }

  renderKeywardSearchBar = () => {
    const { cluster } = this.state;
    const { wordCloudTerms } = cluster;
    let quickSearchList = [];
    if (wordCloudTerms) {
      const quickSearch = wordCloudTerms.split(/[_,]+/);
      quickSearchList = quickSearch.filter((item, pos, self) => self.indexOf(item) === pos);
    }

    return (
      <div
        style={clusterAction.quickSearchHeader}
      >
        <KeywordsSearchBar
          words={quickSearchList}
          onSearch={(conversation, keyCode) => this.onSearch(conversation, keyCode)}
          onBlur={() => {}}
        />
      </div>
    );
  }

  renderClusterActions = () => (
    <div>
      {this.renderClusterHeaderBar()}
      {this.renderKeywardSearchBar()}
    </div>
  )

  renderPlaceholder = () => (
    <Placeholder>
      <div className='message-default'>
        <LoadingIndicator isHerbie message='Loading Conversations...' />
      </div>
    </Placeholder>
  );

  selectedConversations = (selectedConversations) => {
    this.setState({
      selectedConvList: selectedConversations,
    });
  }

  render() {
    const { conversations, selectedConvList } = this.state;
    const { conversationCount, dispatch } = this.props;

    if (conversationCount === -1) {
      return this.renderPlaceholder();
    }
    return (
      <div>
        <div style={windowStyleConversationView}>
          {this.renderClusterActions()}
        </div>
        <ConversationsTable
          data={conversations}
          selectedAction={this.state.selectedAction}
          isAnswers={this.props.isAnswers}
          isConversations={this.props.isConversations}
          roleConfig={this.props.roleConfig}
          getTranscript={this.getTranscript}
          selectedConvList={selectedConvList}
          selectedConversations={(selectedConversations) => this.selectedConversations(selectedConversations)}
          dispatch={dispatch}
        />
      </div>
    );
  }
}

ConversationsView.propTypes = {
  selectedRunId: PropTypes.string,
  dispatch: PropTypes.func,
  // Note: https://github.com/yannickcr/eslint-plugin-react/issues/1751
  // eslint-disable-next-line react/no-unused-prop-types
  cluster: PropTypes.object,
  // eslint-disable-next-line react/no-unused-prop-types
  conversations: PropTypes.object,
  conversationCount: PropTypes.number,
  isAnswers: PropTypes.bool,
  isConversations: PropTypes.bool,
  selectedConversation: PropTypes.object,
  roleConfig: PropTypes.object,
};

ConversationsView.defaultProps = {
  dispatch: () => { },
  selectedRunId: '',
  cluster: Map(),
  conversations: new List([]),
  conversationCount: -1,
  isConversations: false,
  selectedConversation: new List([]),
  roleConfig: {},
};


const mapStateToProps = (state) => ({
  selectedRunId: runSelectors.getSelectedRunId(state),
  cluster: clusterSelectors.getSelectedCluster(state),
  conversations: conversationSelectors.getConversationsList(state),
  conversationCount: conversationSelectors.getConversationCount(state),
  isAnswers: getIsAnswersSelector(state),
  isConversations: getIsConversationsSelector(state),
  selectedConversation: conversationSelectors.getSelectedConversations(state),
  roleConfig: getRoleConfigSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(ConversationsView);
