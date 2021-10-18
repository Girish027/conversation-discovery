import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog, CreatableSelect } from '@tfs/ui-components';
import { connect } from 'react-redux';
import constants from '../../constants';
import Language from '../../Language';
import {
  dialogStyles, addToBotDialog
} from '../../styles';
import {
  List
} from 'immutable';
import { Conversations } from '../ContentPanel/Conversations';
import { conversationSelectors, conversationActions } from 'state/conversationsState';
import ErrorLayout from './ErrorLayout';

export class AddToBotModal extends Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.props = props;

    this.onClickSubmit = this.onClickSubmit.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);

    this.styleOverride = Object.assign({}, {
      ...dialogStyles,
      childContainer: {
        marginBottom: '0px',
        overflow: 'hidden'
      },
      content: {
        maxWidth: '900px',
        maxHeight: '700px',
        top: '100px',
        left: 'calc((100vw - 1000px) / 2)'
      }
    },
    this.props.styleOverride
    );

    this.state = {
      selectedConversations: [],
    };
  }

  onClickSubmit() {
    const { dispatch } = this.props;
    const intentDetail = this.state.selectedIntent;
    if (intentDetail.__isNew__) {
      // create node
      const nodeId = constants.nodeInfo.parentNodeId;
      const nodeName = intentDetail.value;
      const selectedUtteranceDetails = this.state.selectedConversations;
      const allUtterances = selectedUtteranceDetails.map(function extractRelevantParams(elem) {
        return {
          count: 1,
          utterance: elem.sentenceSet,
          utteranceId: elem.transcriptId
        };
      });
      const payload = {
        utterances: allUtterances, nodeName, nodeId
      };
      dispatch(conversationActions.createIntentWithConversations(payload, selectedUtteranceDetails));
    } else {
      // update  node
      const { nodeId, nodeName } = intentDetail.value;
      const existingUtterances = intentDetail.value.utterances;
      const selectedUtteranceDetails = this.state.selectedConversations;
      const newUtteranceInfo = selectedUtteranceDetails.map(function extractRelevantParams(elem) {
        return {
          count: 1,
          utterance: elem.sentenceSet,
          utteranceId: elem.transcriptId
        };
      });
      const allUtterances = [...existingUtterances, ...newUtteranceInfo];
      const payload = { utterances: allUtterances, nodeId, nodeName };
      dispatch(conversationActions.updateIntentWithConversations(payload, selectedUtteranceDetails));
    }
    this.props.selectedConversations([]);
  }

  onClickCancel() {
    const { onClickClose } = this.props;

    onClickClose();
  }

  selectedConversations = (selectedConversations) => {
    this.setState({
      selectedConversations,
    },
    this.props.selectedConversations(selectedConversations)
    );
  }

  getAllIntents = () => {
    let { intentsList = new List([]) } = this.props;

    const optionsList = [];

    intentsList = intentsList.toJS();
    if (intentsList.length > 0 || Object.prototype.hasOwnProperty.call(intentsList, 'data')) {
      intentsList.data.forEach((intents) => {
        optionsList.push({
          value: intents,
          label: intents.nodeName
        });
      });
    } else {
      optionsList.push({
        value: 'loading',
        label: 'Loading...'
      });
    }
    return optionsList;
  }

  render() {
    const {
      header, size, data, errorType, conversationsAddingInProgress, ...otherProps
    } = this.props;

    const { buttons } = constants;
    const okChildren = conversationsAddingInProgress ? constants.buttons.addingToBot : constants.buttons.addToBotIntent;
    const { cancel: cancelChildren } = buttons;

    return (
      <div>
        <Dialog
          size={size}
          headerChildren={header}
          {...otherProps}
          isOpen
          okVisible
          okDisabled={(!(this.state.selectedConversations && this.state.selectedConversations.length > 0 && this.state.selectedIntent)) || (conversationsAddingInProgress)}
          okChildren={okChildren}
          cancelVisible
          cancelChildren={cancelChildren}
          closeIconVisible
          styleOverride={this.styleOverride}
          onClickOk={this.onClickSubmit}
          onClickCancel={this.onClickCancel}
          centerContent={false}
        >
          {errorType && !conversationsAddingInProgress && (
            <ErrorLayout errorMsg={errorType} styleOverride={{ marginBottom: '10px' }} />
          )}
          <div style={addToBotDialog.label}> Add selected utterances as an intent</div>
          <div style={addToBotDialog.divLabel}>
            <span style={addToBotDialog.spanLabel}> Format: noun_action. </span>
            <span style={addToBotDialog.spanLabelItalics}> For ex: Order_Cancel </span>
          </div>
          <div style={addToBotDialog.comboBoxContainer}>
            <CreatableSelect
              options={this.getAllIntents()}
              onChange={(newValue) => {
                this.setState({ selectedIntent: newValue });
              }}
              onInputChange={(inputValue, actionMeta) => {
                // console.group('Input Changed');
                console.log('Input Changed', inputValue);
                console.log(`action: ${actionMeta.action}`);
              }}
              placeholder='Select or Add Intent'
              styleOverride={{ container: { width: '400px' } }}
            />
          </div>
          <div style={addToBotDialog.divLabel}>
            <span style={addToBotDialog.spanLabel}>{Language.ADD_TO_CONVERSATIONS.noteTitle}</span>
            <span style={addToBotDialog.spanLabelItalics}>{Language.ADD_TO_CONVERSATIONS.noteMessage}</span>
          </div>
          <Conversations data={data} selectedConversations={(selectedConversations) => this.selectedConversations(selectedConversations)} />
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  intentsList: conversationSelectors.getIntentsList(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

AddToBotModal.propTypes = {
  dispatch: PropTypes.func,
  header: PropTypes.string,
  data: PropTypes.array,
  closeIconVisible: PropTypes.bool,
  onClickOk: PropTypes.func,
  onClickClose: PropTypes.func,
  styleOverride: PropTypes.object,
  errorType: PropTypes.string,
  size: PropTypes.string,
  formData: PropTypes.object,
  selectedConversations: PropTypes.func,
  intentsList: PropTypes.object,
  conversationsAddingInProgress: PropTypes.bool
};

AddToBotModal.defaultProps = {
  dispatch: () => {},
  closeIconVisible: true,
  data: [],
  onClickOk: () => {},
  onClickClose: () => {},
  styleOverride: {},
  size: 'large',
  errorType: '',
  formData: {},
  header: constants.modalInfo.addBot.header,
  selectedConversations: () => {},
  intentsList: new List([]),
  conversationsAddingInProgress: false,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddToBotModal);
