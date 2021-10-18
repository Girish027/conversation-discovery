import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  ContextualActionsBar, ContextualActionItem, DropDown, Search, SearchIcon, Xmark, TextField,
} from '@tfs/ui-components';

import IconButton from '../IconButton/index';
import { shouldHandle } from '../../utils/KeyboardUtils';
import { searchBarStyle, KeywordsSearchBarStyle } from '../../styles/index';
import { prepareKeywordName } from '../../utils/stringOperations';

export default class KeywordsSearchBar extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      value: '',
    };

    this.maxWords = 5;
    this.onSearch = this.onSearch.bind(this);
    this.onClickClear = this.onClickClear.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onClickWord = this.onClickWord.bind(this);
  }

  onBlur = () => {
    this.props.onBlur();
  };

  onSearch(event, enterPress = false) {
    this.setState({
      value: event.target.value
    }, () => this.props.onSearch(this.state.value, enterPress));
  }

  onClickClear() {
    this.setState({
      value: '',
    }, () => this.props.onSearch('', true));
  }

  onClickWord(word) {
    this.setState({
      value: word,
    }, () => this.props.onSearch(word, true));
  }

  onKeyPress(event) {
    if (shouldHandle(event)) {
      this.onSearch(event, true);
    }
  }

  renderWordsLink(words) {
    if (words.length > this.maxWords) {
      return this.renderWordsWithMore(words);
    }
    return this.renderOnlyWords(words);
  }

  renderOnlyWords(words) {
    const wordsWithSeparator = words.join(',|,');
    const wordsWithSeparatorList = wordsWithSeparator.split(',');

    return (
      <div>
        {wordsWithSeparatorList.map((word, index) => (
          (word === '|')
            ? (
              <ContextualActionItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                styleOverride={{ ...KeywordsSearchBarStyle.separatorActionItem }}
              >
                {word}
              </ContextualActionItem>
            )
            : (
              <ContextualActionItem
                key={word}
                styleOverride={{ ...KeywordsSearchBarStyle.wordActionItem }}
                onClickAction={() => { this.onClickWord(prepareKeywordName(word)); }}
              >
                {prepareKeywordName(word)}
              </ContextualActionItem>
            )
        ))}
      </div>
    );
  }

  renderWordsWithMore(words) {
    const labelWords = words.slice(0, 4);
    let dropdownWords = words.slice(4);
    dropdownWords = dropdownWords.map((word) => prepareKeywordName(word));

    return (
      <div>
        {this.renderOnlyWords(labelWords)}
        <ContextualActionItem
          styleOverride={{ ...KeywordsSearchBarStyle.separatorActionItem }}
        >
          {'|'}
        </ContextualActionItem>
        <ContextualActionItem styleOverride={{ ...KeywordsSearchBarStyle.DropDownActionItem }}>
          <DropDown
            itemList={dropdownWords}
            onItemSelected={(selectedValue) => {
              this.onClickWord(selectedValue);
            }}
            shouldHandleClickOutside
            type='menu'
            labelName={`+ ${dropdownWords.length} more`}
            styleOverride={{ fontWeight: 'normal', fontSize: '13px', fontFamily: 'Lato' }}
          />
        </ContextualActionItem>
      </div>
    );
  }

  render() {
    const {
      closeIcon, words
    } = this.props;

    const { value } = this.state;

    return (
      <div>
        <span
          style={{ ...KeywordsSearchBarStyle.filterKeywordLabel }}
        >
          Filter by Keywords
        </span>
        <ContextualActionsBar
          styleOverride={{ ...KeywordsSearchBarStyle.actionBar }}
        >
          {this.renderWordsLink(words)}
          <ContextualActionItem
            styleOverride={{ ...KeywordsSearchBarStyle.searchActionItem }}
            icon={Search}
            right
          >
            <div style={{ display: 'flex' }}>
              <div style={searchBarStyle.searchIcon}>
                <SearchIcon width='12px' fill='#004c97' />
              </div>
              <div style={{ ...searchBarStyle.textFieldContainerStyle }}>
                <TextField
                  name='conversation-search-bar'
                  onChange={this.onSearch}
                  value={value}
                  placeholder={'Filter by Keywords'}
                  onKeyPress={this.onKeyPress}
                  styleOverride={{ ...searchBarStyle.textFieldStyle, border: 'transparent' }}
                />
              </div>
              {closeIcon && value && (
                <div style={{ position: 'absolute', right: '30px' }}>
                  <IconButton
                    onClick={this.onClickClear}
                    icon={Xmark}
                    data-qa={'clear-topic'}
                    padding={'12px 10px'}
                    title='Clear'
                  />
                </div>
              )
              }
            </div>
          </ContextualActionItem>
        </ContextualActionsBar>
      </div>
    );
  }
}

KeywordsSearchBar.propTypes = {
  onBlur: PropTypes.func,
  onSearch: PropTypes.func,
  closeIcon: PropTypes.bool,
  words: PropTypes.array,
};

KeywordsSearchBar.defaultProps = {
  onBlur: () => {},
  onSearch: () => {},
  closeIcon: true,
  words: [],
};
