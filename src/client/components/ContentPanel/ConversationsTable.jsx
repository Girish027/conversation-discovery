import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox, Tooltip } from '@tfs/ui-components';
import EnhancedTable, { getColumnVisibility, getColumnWidth } from '../Table/EnhancedTable';
import { loadStorage } from '../../utils/storageManager';
import PreviewManager from '../../utils/PreviewManager';
import Preview from '../Preview/index';
import Constants from 'components/../constants';
import {
  setDefaultConversations
} from 'state/conversationsState';
import { conversationButtonStyle, conversationTableCheckBoxEnableStyle, conversationTableCheckBoxDisableStyle } from '../../styles/index';

export class ConversationsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedConversations: this.props.selectedConvList,
    };

    this.tableIndentifier = 'CFD_Conversations_Table';
    this.tableInfo = {
      selected: {
        header: 'Checkbox',
        id: 'checkbox',
      },
      conversations: {
        header: 'Utterances',
        id: 'sentenceSet',
      },
      similarity: {
        header: 'Similarity',
        id: 'originalSimilarity',
      },
      intent: {
        header: 'Mapped To',
        id: 'assignedIntent',
      },
      faq: {
        header: 'Mapped To',
        id: 'assignedFaq',
      }
    };

    this.getProps = (state, rowInfo) => ({
      style: {
        backgroundColor: this.changeCellBackgroundColor(rowInfo),
      },
    });
  }

  componentDidMount() {
    this.setState({
      selectedConversations: this.props.selectedConvList
    });
  }

  componentWillReceiveProps(nextProps) {
    // Any time props.selectedAction changes, update state selectedConversations to empty list.
    if (nextProps.selectedAction !== this.props.selectedAction) {
      this.setState({
        selectedConversations: []
      });
    }
  }

  componentWillUnmount() {
    PreviewManager.closeWidget();
  }

  getCheckBoxHeaderChecked = () => {
    const { selectedConversations } = this.state;
    const {
      isAnswers, isConversations, selectedAction
    } = this.props;

    return (selectedConversations.length > 0 && ((isAnswers && isConversations) ? ((selectedAction === Constants.utteranceMode.conversations)
      ? ((this.props.data.filter((conversation) => conversation.assignedIntent === '').length) === selectedConversations.length) : ((this.props.data.filter((conversation) => conversation.assignedFaq === '').length) === selectedConversations.length))
      : ((isConversations && !isAnswers) ? ((this.props.data.filter((conversation) => conversation.assignedIntent === '').length) === selectedConversations.length) : ((this.props.data.filter((conversation) => conversation.assignedFaq === '').length) === selectedConversations.length))));
  }

  getCheckBoxCellStyle = (original) => {
    const {
      isAnswers, isConversations, selectedAction
    } = this.props;

    return (isAnswers && isConversations) ? ((selectedAction === Constants.utteranceMode.conversations)
      ? (original.assignedIntent === '' ? conversationTableCheckBoxEnableStyle : conversationTableCheckBoxDisableStyle) : (original.assignedFaq === '' ? conversationTableCheckBoxEnableStyle : conversationTableCheckBoxDisableStyle))
      : ((isConversations && !isAnswers) ? (original.assignedIntent === '' ? conversationTableCheckBoxEnableStyle : conversationTableCheckBoxDisableStyle) : (original.assignedFaq === '' ? conversationTableCheckBoxEnableStyle : conversationTableCheckBoxDisableStyle));
  }

  get columns() {
    const { selectedConversations } = this.state;
    const {
      isAnswers, isConversations, selectedAction, roleConfig, dispatch
    } = this.props;
    if (selectedConversations.length <= 0) {
      dispatch(setDefaultConversations());
    }
    const tableState = loadStorage(this.tableIndentifier, {});
    const mappingColumnAccessor = (isAnswers && isConversations) ? ((selectedAction === Constants.utteranceMode.conversations)
      ? this.tableInfo.intent.id : this.tableInfo.faq.id)
      : ((!isAnswers && isConversations) ? this.tableInfo.intent.id : this.tableInfo.faq.id);

    const columns = [
      {
        Header: () => (
          <Checkbox
            styleOverride={{ paddingLeft: '10px' }}
            onChange={(event) => {
              this.toggleSelectAll(event.target.checked);
            }}
            checked={this.getCheckBoxHeaderChecked()}
          />
        ),
        id: 'checkbox',
        accessor: '',
        Cell: ({ original }) => (
          <Checkbox
            styleOverride={this.getCheckBoxCellStyle(original)}
            onChange={(event) => this.selectConversation(original, event.target.checked)}
            checked={selectedConversations.find((conversation) => conversation.transcriptId === original.transcriptId)}
          />
        ),
        sortable: false,
        maxWidth: 80,
        show: getColumnVisibility(tableState, this.tableInfo.selected.id, (roleConfig.addToConversations && roleConfig.addToAnswers)),
        resizable: false,
        getProps: this.getProps,
      },
      {
        Header: this.tableInfo.conversations.header,
        accessor: this.tableInfo.conversations.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.conversations.id, 380),
        show: getColumnVisibility(tableState, this.tableInfo.conversations.id, true),
        getProps: this.getProps,
        Cell: ({ original }) => (

          <button type='button' style={conversationButtonStyle} onClick={() => this.props.getTranscript(original.transcriptId)}>
            <Tooltip content='Click to view full transcript' type='info' direction='bottom'>
              <div>
                {original.sentenceSet}
              </div>
            </Tooltip>
          </button>

        )
      },
      {
        Header: this.tableInfo.similarity.header,
        accessor: this.tableInfo.similarity.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.similarity.id, 100),
        show: getColumnVisibility(tableState, this.tableInfo.similarity.id, true),
        Cell: ({ original }) => (
          <span>
            {' '}
            { original.originalSimilarity.toFixed(4) }
            {' '}
          </span>
        ),
        getProps: this.getProps,
      },
      {
        Header: this.tableInfo.intent.header,
        accessor: mappingColumnAccessor,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.intent.id, 180),
        show: getColumnVisibility(tableState, this.tableInfo.intent.id, true),
        Cell: ({ original }) => (
          <span>
            { (isConversations && original.assignedIntent !== '') ? (
              <div>
                {' '}
Intent :
                {original.assignedIntent}
              </div>
            ) : (<div></div>)}
            {
              (isAnswers && original.assignedFaq !== '') ? (
                <div>
                  {' '}
  FAQ :
                  {original.assignedFaq}
                </div>
              ) : (<div></div>)
            }
          </span>
        ),
        getProps: this.getProps,
      },
    ];

    return columns;
  }

  changeCellBackgroundColor = (rowInfo) => {
    const { isAnswers, isConversations, roleConfig } = this.props;
    const roleAccess = (roleConfig.addToConversations && roleConfig.addToAnswers);
    return ((isAnswers && isConversations)
      ? ((rowInfo && rowInfo.row.assignedIntent !== '' && rowInfo.row.assignedFaq !== '' && roleAccess)
        ? '#A8A8A8' : null)
      : ((!isAnswers && isConversations)
        ? ((rowInfo && rowInfo.row.assignedIntent !== '' && roleAccess)
          ? '#A8A8A8' : null)
        : ((rowInfo && rowInfo.row.assignedFaq !== '' && roleAccess)
          ? '#A8A8A8' : null)));
  }

  updateSelectedConversations = (selectedConversations) => {
    this.setState({
      selectedConversations,
    },
    this.props.selectedConversations(selectedConversations));
  };

  toggleSelectAll = (checked) => {
    const { isAnswers, isConversations, selectedAction } = this.props;
    let selectedConversations = [];
    if (checked) {
      selectedConversations = this.props.data;
      if (isAnswers && isConversations) {
        if (selectedAction === Constants.utteranceMode.conversations) {
          selectedConversations = selectedConversations.filter((conversation) => conversation.assignedIntent === '');
        } else {
          selectedConversations = selectedConversations.filter((conversation) => conversation.assignedFaq === '');
        }
      } else if (isConversations) {
        selectedConversations = selectedConversations.filter((conversation) => conversation.assignedIntent === '');
      } else {
        selectedConversations = selectedConversations.filter((conversation) => conversation.assignedFaq === '');
      }
    }
    this.updateSelectedConversations(selectedConversations);
  };

  selectConversation = (selectedConversation, checked) => {
    let { selectedConversations } = this.state;

    if (checked === true) {
      selectedConversations = [...selectedConversations, selectedConversation];
    } else {
      selectedConversations = selectedConversations.filter((conversation) => conversation.transcriptId !== selectedConversation.transcriptId);
    }
    this.updateSelectedConversations(selectedConversations);
  };

  render() {
    const { data } = this.props;

    return (
      <div>
        <EnhancedTable
          tableIndentifier={this.tableIndentifier}
          columns={this.columns}
          data={data}
          tableStyle={{ maxHeight: 'calc(100vh - 215px)' }}
          defaultSorted={[{ id: 'originalSimilarity', desc: true }]}
          defaultPageSize={30}
        />
        <Preview />
      </div>
    );
  }
}

ConversationsTable.propTypes = {
  getTranscript: PropTypes.func,
  dispatch: PropTypes.func,
  data: PropTypes.array,
  selectedConversations: PropTypes.func,
  selectedConvList: PropTypes.array,
  selectedAction: PropTypes.string,
  isAnswers: PropTypes.bool,
  isConversations: PropTypes.bool,
  roleConfig: PropTypes.object,
};

ConversationsTable.defaultProps = {
  dispatch: () => {},
  data: [],
  selectedConvList: [],
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});
export default connect(mapDispatchToProps)(ConversationsTable);
