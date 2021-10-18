import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { SearchIcon, Xmark, TextField } from '@tfs/ui-components';
import IconButton from '../IconButton/index';
import { shouldHandle } from '../../utils/KeyboardUtils';
import { searchBarStyle } from '../../styles/index';

export default class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      value: '',
    };

    this.onSearch = this.onSearch.bind(this);
    this.onClickClear = this.onClickClear.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  onSearch(event) {
    this.setState({
      value: event.target.value
    }, () => this.props.onSearch(this.state.value));
  }

  onClickClear() {
    this.setState({
      value: '',
    }, () => this.props.onSearch(''));
  }

  onKeyPress(event) {
    if (shouldHandle(event)) {
      this.onSearch(event);
    }
  }

  render() {
    const {
      placeholder, styleOverride, closeIcon
    } = this.props;

    const { value } = this.state;

    // TODO: Need to add width to main container and correct the clear icon styling
    return (
      <div
        style={{
          ...searchBarStyle,
          ...styleOverride
        }}
      >
        <div style={searchBarStyle.searchIcon}>
          <SearchIcon width='12px' fill='#004c97' />
        </div>
        <div style={{ ...searchBarStyle.textFieldContainerStyle, ...styleOverride.container }}>
          <TextField
            name='search-bar'
            onChange={this.onSearch}
            defaultValue={value}
            placeholder={placeholder}
            onKeyPress={this.onKeyPress}
            styleOverride={{ ...searchBarStyle.textFieldStyle, ...styleOverride.textField }}
          />
        </div>
        {closeIcon && value && (
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

SearchBox.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  styleOverride: PropTypes.object,
  closeIcon: PropTypes.bool,
};

SearchBox.defaultProps = {
  placeholder: '',
  onSearch: () => {},
  styleOverride: {},
  closeIcon: true
};
