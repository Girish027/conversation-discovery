import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox, TextField } from '@tfs/ui-components';
import { filterPopupStyle } from '../../styles/index';
import _ from 'lodash';
import 'styles/sidebar.scss';

export class FilterConversations extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = {
      similarityCutOff: '',
      selected: { ...this.props.filteredItems }
    };

    this.filterItems = {
      similarityCutOff: 'similarityCutOff',
    };
  }

  handleInputChange(val, filterItem) {
    if (filterItem === this.filterItems.similarityCutOff) {
      this.setState({
        similarityCutOff: parseFloat(val)
      });
    }
  }

  toggleCheckbox(checked, value) {
    if (value === this.filterItems.similarityCutOff) {
      let selected;
      if (checked && this.state.similarityCutOff !== '') {
        selected = { ...this.state.selected, similarity: this.state.similarityCutOff };
      } else {
        selected = { ...this.state.selected };
        delete (selected.similarity);
      }
      this.setState({
        selected
      }, this.props.onFilter(selected));
    }
  }

  render() {
    const { similarityCutOff, selected } = this.state;

    return (
      <div>
        <div style={filterPopupStyle.filterSimilarity}>
          <Checkbox
            key='one'
            value={this.filterItems.similarityCutOff}
            checked={!_.isEmpty(selected) && selected.similarity !== ''}
            label='Similarity Score greater than'
            onChange={(event) => {
              this.toggleCheckbox(event.target.checked, this.filterItems.similarityCutOff);
            }}
          />
          <TextField
            type='number'
            min={0}
            max={100}
            class='filter-input'
            styleOverride={filterPopupStyle.textboxStyle}
            placeholder={0.08}
            onChange={(event) => this.handleInputChange(event.target.value, this.filterItems.similarityCutOff)}
            name='similarity-score'
            value={selected.similarity || similarityCutOff}
          />
        </div>

        <div style={filterPopupStyle.filterSimilarity}>
          <Checkbox
            key='two'
            value=''
            label='Random Sample Size'
            onChange={(event) => {
              this.toggleCheckbox(event.target.checked, this.filterItems.similarityCutOff);
            }}
          />
          <TextField
            type='number'
            min={0}
            max={100}
            class='filter-input'
            styleOverride={filterPopupStyle.textboxStyle}
            placeholder={30}
            onChange={(event) => this.handleInputChange(event.target.value, this.filterItems.similarityCutOff)}
            name='sample-size'
            value={''}
          />
        </div>
      </div>
    );
  }
}

FilterConversations.propTypes = {
  onFilter: PropTypes.func,
  filteredItems: PropTypes.object
};

FilterConversations.defaultProps = {
  onFilter: () => {},
  filteredItems: {}
};

const mapStateToProps = () => {
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(FilterConversations);
