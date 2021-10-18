import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  TextField, Plus, Xmark, Button
} from '@tfs/ui-components';
import IconButton from '../../IconButton/IconButton';
import { stopwordsStyle } from '../../../styles/index';
import { shouldHandle } from '../../../utils/KeyboardUtils';
import GenericTooltip from '../../Tooltip/Tooltip';
import Language from '../../../Language';

export default class StopWords extends PureComponent {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.onClickBack = this.onClickBack.bind(this);

    this.state = {
      inputValue: '',
      stopWords: []
    };
    this.backButton = ' << Back ';
  }

    onEnterPressed = (event) => {
      if (shouldHandle(event)) {
        this.addStopWord(event.target.value);
      }
    }

    onClickBack() {
      this.props.onClickBack();
    }

    addStopWord = (stopWord) => {
      const { stopWords } = this.state;
      let newList = stopWords.slice();

      stopWord = stopWord.trim();

      if (!(stopWords.indexOf(stopWord) > -1) && stopWord.length > 0) {
        newList = newList.concat([stopWord]);
        this.updateStopWords(newList);
      }

      this.updateValue('');
    }

    updateValue = (value) => {
      if (value === ' ') {
        return;
      }
      this.setState({
        inputValue: value
      });
    }


    removeStopWord = (removeStopWord) => {
      const { stopWords } = this.state;
      const newStopWords = stopWords.filter((tag) => tag !== removeStopWord);
      this.updateStopWords(newStopWords);
    }

    updateStopWords = (stopWords) => {
      this.setState({
        stopWords
      }, () => this.props.onStopWordChange(stopWords));
    }

    handleChange(e) {
      this.updateValue(e.target.value);
    }

    render() {
      const { inputValue, stopWords } = this.state;

      return (
        <React.Fragment>
          <div style={stopwordsStyle.label}>
            <span> Watch Words </span>
            <Button
              name='back-btn'
              type='flat'
              onClick={this.onClickBack}
              styleOverride={{ float: 'right' }}
            >
              {this.backButton}
            </Button>
          </div>
          <div style={stopwordsStyle.filedIcon}>
            <IconButton
              onClick={() => this.addStopWord(inputValue)}
              icon={Plus}
              strokeColor='#ffffff'
              data-qa={'add-stopword'}
              padding={'3px'}
              title='Add'
            />
          </div>
          <GenericTooltip content={Language.RUN.TOOLTIP.watch}>
            <TextField
              name='stop-words'
              onChange={this.handleChange}
              value={inputValue}
              placeholder='Add a new watch word'
              styleOverride={stopwordsStyle.field}
              onKeyPress={(e) => this.onEnterPressed(e)}
            />
          </GenericTooltip>
          <div style={stopwordsStyle.stopWordsWrap}>
            {stopWords && stopWords.map((tag) => (
              <div
                style={stopwordsStyle.tagStyle}
                key={tag}
                label={tag}
              >
                <div style={stopwordsStyle.pillStyle}>
                  {tag}
                  <IconButton
                    onClick={() => this.removeStopWord(tag)}
                    icon={Xmark}
                    data-qa={'remove-stopword'}
                    padding={'0px 0px 0px 14px'}
                    title='Remove'
                  />
                </div>
              </div>
            ))}
          </div>
        </React.Fragment>
      );
    }
}

StopWords.propTypes = {
  onStopWordChange: PropTypes.func,
  onClickBack: PropTypes.func,
};

StopWords.defaultProps = {
  onStopWordChange: () => {},
  onClickBack: () => {},
};
