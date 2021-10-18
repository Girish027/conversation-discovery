import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { SearchIcon, Xmark, TextField } from '@tfs/ui-components';
import IconButton from '../IconButton/index';
import { shouldHandle } from '../../utils/KeyboardUtils';
import { searchBarStyle } from '../../styles/index';

class ConversationSearchBar extends Component {
  constructor(props) {
    super(props);

    this.style = {
      paddingTop: '12px',
      paddingLeft: '0px',
      marginTop: '-12px',

      container: {
        marginRight: '0px',
        width: '350px',
      }
    };

    this.state = {
      value: '',
    };

    this.onSearch = this.onSearch.bind(this);
    this.onClickClear = this.onClickClear.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
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
    }, () => this.props.onSearch(''));
  }

  onKeyPress(event) {
    if (shouldHandle(event)) {
      this.onSearch(event, true);
    }
  }

  render() {
    const {
      styleOverride, closeIcon, ...others
    } = this.props;

    const { value } = this.state;

    return (
      <div
        style={{
          ...searchBarStyle,
          ...this.style,
          ...styleOverride
        }}
      >
        <div style={searchBarStyle.searchIcon}>
          <SearchIcon width='12px' fill='#004c97' />
        </div>
        <div style={{ ...searchBarStyle.textFieldContainerStyle, ...this.style.container }}>
          <TextField
            name='search-bar'
            onChange={this.onSearch}
            defaultValue={value}
            placeholder='Find Conversations'
            onKeyPress={this.onKeyPress}
            onBlur={this.onBlur}
            styleOverride={{ ...searchBarStyle.textFieldStyle, ...styleOverride.textField }}
            {...others}
          />
        </div>
        {closeIcon && (
          <div style={{ ...searchBarStyle.clearIcon, ...styleOverride.clearIcon }}>
            <IconButton
              onClick={this.onClickClear}
              icon={Xmark}
              data-qa={'clear-topic'}
              padding={'12px 10px'}
              title='Clear'
            />
          </div>
        )}
      </div>
    );
  }
}

ConversationSearchBar.propTypes = {
  onBlur: PropTypes.func,
  onSearch: PropTypes.func,
  value: PropTypes.string,
  closeIcon: PropTypes.bool,
  styleOverride: PropTypes.func
};

ConversationSearchBar.defaultProps = {
  onBlur: () => {},
  onSearch: () => {},
  value: '',
  closeIcon: false,
  styleOverride: {},
};

export default ConversationSearchBar;
