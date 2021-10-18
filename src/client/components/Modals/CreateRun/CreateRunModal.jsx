import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button } from '@tfs/ui-components';
import constants from '../../../constants';
import Language from '../../../Language';
import Form from '../../Form/Form';
import {
  setModalIsOpen,
} from 'state/appState';
import {
  runActions,
} from 'state/runsState';
import {
  dialogStyles, stopwordsStyle
} from '../../../styles/index';

import createRunUiSchema from '../../../schema/createRun/uiSchema.json';
import createRunJsonSchema from '../../../schema/createRun/jsonSchema.json';
import ErrorLayout from '../ErrorLayout';
import StopWords from './StopWords';

export default class CreateRunModal extends Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.props = props;

    this.onClickStart = this.onClickStart.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
    this.handleGoBackClick = this.handleGoBackClick.bind(this);
    this.handleStopWords = this.handleStopWords.bind(this);
    this.onStopWordsChange = this.onStopWordsChange.bind(this);

    this.styleOverride = Object.assign({}, {
      ...dialogStyles,
      container: {
        maxWidth: '450px',
        maxHeight: '600px',
        display: 'grid',
        gridTemplateRows: '60px auto 60px',
      },
      childContainer: {
        marginTop: '10px',
        marginBottom: '10px',
      },
      content: {
        maxWidth: '450px',
        maxHeight: '570px',
        left: 'calc((100vw - 450px) / 2)',
      },
      overlay: {
        zIndex: 9000,
      },
    },
    this.props.styleOverride
    );

    this.state = {
      formData: {},
      isValid: false,
      showStopWords: false
    };

    this.stopWords = [];
    this.stopWordBtn = 'Add Watch Words >>';
  }

  onClickStart() {
    this.form.current.submit();
  }

  onClickCancel() {
    const { dispatch } = this.props;

    dispatch(setModalIsOpen(true, {
      modalName: constants.modals.confirm,
      header: Language.RUN.cancelHeader,
      message: Language.RUN.cancelMessage,
      onClickOk: this.handleGoBackClick,
    }));
  }

  onSubmit() {
    const { dispatch } = this.props;
    const { formData } = this.state;

    const data = {
      ...formData,
      stopWords: JSON.stringify(this.stopWords)
    };

    dispatch(runActions.createRun(data));
  }

  onFormChange(data, errors) {
    if (errors.length === 0) {
      this.setState({
        formData: data,
        isValid: true
      });
    } else if (errors.length > 0) {
      this.setState({
        isValid: false
      });
    }
  }

  onStopWordsChange(stopWords) {
    this.stopWords = stopWords;
  }

  handleStopWords() {
    const { showStopWords } = this.state;
    this.setState({
      showStopWords: !showStopWords
    });
  }

  handleGoBackClick() {
    const { dispatch } = this.props;
    const { formData } = this.state;

    dispatch(setModalIsOpen(true, {
      modalName: constants.modals.createRun,
      formData,
    }));
  }

  render() {
    const {
      header, size, formData, errorType, ...otherProps
    } = this.props;

    const { isValid, showStopWords } = this.state;

    const { buttons } = constants;
    const { submit: okChildren } = buttons;
    const { cancel: cancelChildren } = buttons;

    const formStyle = showStopWords ? stopwordsStyle.hiddenStyle : stopwordsStyle.visibleStyle;
    const stopWordPageStyle = !showStopWords ? stopwordsStyle.hiddenStyle : stopwordsStyle.visibleStyle;

    return (
      <div>
        <Dialog
          size={size}
          headerChildren={header}
          {...otherProps}
          isOpen
          okVisible
          okDisabled={!isValid}
          okChildren={okChildren}
          cancelVisible
          cancelChildren={cancelChildren}
          closeIconVisible
          styleOverride={this.styleOverride}
          onClickOk={this.onClickStart}
          onClickCancel={this.onClickCancel}
          centerContent={false}
        >
          <div>
            {errorType && (
              <ErrorLayout errorMsg={errorType} />
            )}
            <div style={formStyle}>
              <Form
                uiSchema={createRunUiSchema}
                jsonSchema={createRunJsonSchema}
                onSubmit={this.onSubmit}
                onChange={this.onFormChange}
                formData={formData}
                ref={this.form}
                liveValidate
              />
              <Button
                type='flat'
                name='stop-words'
                onClick={this.handleStopWords}
                styleOverride={{ marginTop: '15px' }}
              >
                {this.stopWordBtn}
              </Button>
            </div>
            <div style={stopWordPageStyle}>
              <StopWords onClickBack={this.handleStopWords} onStopWordChange={this.onStopWordsChange} />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

CreateRunModal.propTypes = {
  dispatch: PropTypes.func,
  header: PropTypes.string,
  closeIconVisible: PropTypes.bool,
  onClickOk: PropTypes.func,
  onClickClose: PropTypes.func,
  styleOverride: PropTypes.object,
  size: PropTypes.string,
  formData: PropTypes.object,
  errorType: PropTypes.string,
};

CreateRunModal.defaultProps = {
  dispatch: () => {},
  closeIconVisible: true,
  onClickOk: () => {},
  onClickClose: () => {},
  styleOverride: {},
  size: 'large',
  formData: {},
  errorType: '',
  header: constants.modalInfo.createRun.header,
};
