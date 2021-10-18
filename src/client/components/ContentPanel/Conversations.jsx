import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox } from '@tfs/ui-components';
import EnhancedTable, { getColumnVisibility, getColumnWidth } from 'components/Table/EnhancedTable';
import { loadStorage } from '../../utils/storageManager';

export class Conversations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedConversations: props.data,
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
    };
  }

  componentDidMount() {
    const { selectedConversations } = this.state;
    this.props.selectedConversations(selectedConversations);
  }

  get columns() {
    const { selectedConversations } = this.state;
    const tableState = loadStorage(this.tableIndentifier, {});

    const columns = [
      {
        Header: (row) => (
          <Checkbox
            styleOverride={{ paddingLeft: '10px' }}
            onChange={(event) => {
              this.toggleSelectAll(event.target.checked, row);
            }}
            checked={(selectedConversations.length > 0 && selectedConversations.length === this.props.data.length)}
          />
        ),
        id: 'checkbox',
        accessor: '',
        Cell: ({ original }) => (
          <Checkbox
            styleOverride={{ paddingLeft: '10px', marginTop: '5px' }}
            onChange={(event) => this.selectConversation(original, event.target.checked)}
            checked={selectedConversations.find((conversation) => conversation.transcriptId === original.transcriptId)}
          />
        ),
        sortable: false,
        maxWidth: 80,
        show: getColumnVisibility(tableState, this.tableInfo.selected.id, true),
        resizable: false,
      },
      {
        Header: this.tableInfo.conversations.header,
        accessor: this.tableInfo.conversations.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.conversations.id, 80),
        show: getColumnVisibility(tableState, this.tableInfo.conversations.id, true),
      },
    ];

    return columns;
  }

  updateSelectedConversations = (selectedConversations) => {
    this.setState({
      selectedConversations,
    },
    this.props.selectedConversations(selectedConversations));
  };

  toggleSelectAll = (checked) => {
    let selectedConversations = [];
    if (checked) {
      selectedConversations = this.props.data;
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
      <EnhancedTable
        tableIndentifier={this.tableIndentifier}
        columns={this.columns}
        data={data}
        tableStyle={{ maxHeight: '425px', maxWidth: '835x' }}
      />
    );
  }
}

Conversations.propTypes = {
  data: PropTypes.array,
  selectedConversations: PropTypes.func
};

Conversations.defaultProps = {
  data: [],
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(mapDispatchToProps)(Conversations);
