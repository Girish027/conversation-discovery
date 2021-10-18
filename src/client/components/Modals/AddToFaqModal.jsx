import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog, CreatableSelect, Select } from '@tfs/ui-components';
import { connect } from 'react-redux';
import constants from '../../constants';
import {
  dialogStyles, addToFaqDialog
} from '../../styles';
import {
  List
} from 'immutable';
import { Conversations } from '../ContentPanel/Conversations';
import { conversationSelectors, conversationActions } from 'state/conversationsState';
import ErrorLayout from './ErrorLayout';

export class AddToFaqModal extends Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.props = props;

    this.onClickSubmit = this.onClickSubmit.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);

    this.styleOverride = Object.assign({}, {
      ...dialogStyles,
      childContainer: {
        marginTop: '10px',
        marginBottom: '0px',
        overflow: 'scroll'
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
      enableCreateSelector: false
    };
  }

  onClickSubmit() {
    const { dispatch } = this.props;
    const interfaceDetail = this.state.selectedInterface;
    const faqDetail = this.state.selectedFaq;
    if (faqDetail.__isNew__) {
      // create faq
      const interfaceId = interfaceDetail.interfaceID;
      const languageId = interfaceDetail.languageID;
      const createdFaqTitle = faqDetail.value;
      const selectedUtteranceDetails = this.state.selectedConversations;
      const allUtterances = selectedUtteranceDetails.map(function extractRelevantParams(elem) {
        return {
          count: 1,
          utterance: elem.sentenceSet,
          utteranceId: elem.transcriptId
        };
      });
      const payload = {
        utterances: allUtterances, languageId, responseTitle: createdFaqTitle, responseContent: createdFaqTitle
      };
      dispatch(conversationActions.createFaqWithAnswers(interfaceId, payload, selectedUtteranceDetails));
    } else {
      // update faq
      const interfaceId = interfaceDetail.interfaceID;
      const { id, title } = faqDetail.value;
      const selectedUtteranceDetails = this.state.selectedConversations;
      const allUtterances = selectedUtteranceDetails.map(function extractRelevantParams(elem) {
        return {
          count: 1,
          utterance: elem.sentenceSet,
          utteranceId: elem.transcriptId
        };
      });
      const payload = { utterances: allUtterances, responseId: id, responseTitle: title };
      dispatch(conversationActions.updateFaqWithAnswers(interfaceId, payload, selectedUtteranceDetails));
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

  getAllInterfaces = () => {
    let { interfacesList = new List([]) } = this.props;
    const optionsList = [];
    interfacesList = interfacesList.toJS();
    if (interfacesList.length > 0) {
      interfacesList.forEach((rec) => {
        optionsList.push({
          value: { interfaceID: rec.interfaceID, interfaceName: rec.interfaceName, languageID: rec.languageID },
          label: rec.interfaceName
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

  getAllFaqs = () => {
    let { faqsList = new List([]) } = this.props;
    const { loadingFAQs } = this.props;
    const optionsList = [];

    if (loadingFAQs) {
      optionsList.push({
        value: 'loading',
        label: 'Loading...'
      });
    } else {
      faqsList = faqsList.toJS();
      if (faqsList.length > 0) {
        faqsList.forEach((rec) => {
          optionsList.push({
            value: { id: rec.id, title: rec.title, parentId: rec.parentId },
            label: rec.title
          });
        });
      }
    }
    return optionsList;
  }

  render() {
    const {
      dispatch, header, size, data, errorType, conversationsAddingInProgress, ...otherProps
    } = this.props;
    const { enableCreateSelector } = this.state;

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
          okDisabled={(!(this.state.selectedConversations && this.state.selectedConversations.length > 0 && this.state.selectedInterface && this.state.selectedFaq)) || (conversationsAddingInProgress)}
          okChildren={okChildren}
          cancelVisible
          cancelChildren={cancelChildren}
          closeIconVisible
          styleOverride={this.styleOverride}
          onClickOk={this.onClickSubmit}
          onClickCancel={this.onClickCancel}
          centerContent={false}
        >
          {errorType && (
            <ErrorLayout errorMsg={errorType} styleOverride={{ marginBottom: '10px' }} />
          )}
          <div style={addToFaqDialog.contentLabel}> You can edit your selected utterances before adding to Answers</div>
          <Conversations data={data} selectedConversations={(selectedConversations) => this.selectedConversations(selectedConversations)} />
          <div style={addToFaqDialog.label}> Add selected utterances as an FAQ to your bot</div>
          <div style={addToFaqDialog.comboBoxContainer}>
            <Select
              options={this.getAllInterfaces()}
              onChange={(newValue) => {
                this.setState({ selectedInterface: newValue.value, enableCreateSelector: true });
                dispatch(conversationActions.setLoadingFAQs(true));
                dispatch(conversationActions.getFAQs(newValue.value.interfaceID));
              }}
              placeholder='Select Interface'
              isSearchable
              styleOverride={{ container: { width: '400px' } }}
            />
          </div>
          <div style={addToFaqDialog.comboBoxContainer}>
            { enableCreateSelector === true ? (
              <div>
                <div style={addToFaqDialog.label}> FAQ Title</div>
                <div style={addToFaqDialog.divLabel}>
                  <span style={addToFaqDialog.spanLabelItalics}> Note : The FAQ title will be created in &quot;Candidate FAQ&quot; folder </span>
                </div>
                <CreatableSelect
                  options={this.getAllFaqs()}
                  onChange={(newValue) => {
                    this.setState({ selectedFaq: newValue });
                  }}
                  onInputChange={(inputValue, actionMeta) => {
                    console.log('Input Changed', inputValue);
                    console.log(`action: ${actionMeta.action}`);
                  }}
                  placeholder='Create or Select Title'
                  styleOverride={{ container: { width: '400px' } }}
                />
              </div>
            ) : null }

          </div>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  interfacesList: conversationSelectors.getInterfacesList(state),
  faqsList: conversationSelectors.getFaqsList(state),
  loadingFAQs: conversationSelectors.getLoadingFAQs(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

AddToFaqModal.propTypes = {
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
  interfacesList: PropTypes.object,
  faqsList: PropTypes.object,
  conversationsAddingInProgress: PropTypes.bool,
  loadingFAQs: PropTypes.bool,
};

AddToFaqModal.defaultProps = {
  dispatch: () => {},
  closeIconVisible: true,
  data: [],
  onClickOk: () => {},
  onClickClose: () => {},
  styleOverride: {},
  size: 'large',
  errorType: '',
  formData: {},
  header: constants.modalInfo.addFaq.header,
  selectedConversations: () => {},
  interfacesList: new List([]),
  faqsList: new List([]),
  conversationsAddingInProgress: false,
  loadingFAQs: false,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddToFaqModal);
