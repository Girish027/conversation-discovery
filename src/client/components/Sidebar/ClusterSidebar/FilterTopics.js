import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, fromJS } from 'immutable';
import { connect } from 'react-redux';
import _ from 'lodash';

import {
  clusterSelectors,
  clusterActions,
  initialFilterState,
} from '../../../state/clusterState';
import { runSelectors } from '../../../state/runsState';
import { Checkbox, DropDown, TextField } from '@tfs/ui-components';
import { filterPopupStyle } from '../../../styles';
import 'styles/sidebar.scss';

export class FilterTopics extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDropDownChange = this.handleDropDownChange.bind(this);

    this.volumeFilterBy = {
      count: 'Count',
      percent: 'Percent'
    };

    this.state = this.props.filters.toJS();
    this.flag = {
      volume: this.state.flag.volume,
      similarityCutOff: this.state.flag.similarityCutOff
    };
    this.filterItems = {
      finalized: 'finalized',
      open: 'open',
      similarityCutOff: 'similarityCutOff',
      volume: 'volume'
    };
  }

  handleDropDownChange(selectedValue) {
    const { dispatch } = this.props;
    if (selectedValue === this.volumeFilterBy.percent) {
      if (!this.flag.volume) {
        this.setState({
          selectedTopFilter: this.volumeFilterBy.percent,
          volume: {},
        });
      } else {
        this.setState({
          selectedTopFilter: this.volumeFilterBy.percent,
        }, () => {
          let newFilters = {};
          if (this.flag.volume) {
            if (!_.isEmpty(this.state.volume)) {
              newFilters = {
                volume: { volumeByPercent: this.state.volume.volumeByCount || this.state.volume.volumeByPercent },
                flag: this.flag,
                selectedTopFilter: this.volumeFilterBy.percent
              };
              dispatch(clusterActions.setFilter(newFilters));
            } else {
              newFilters = {
                volume: {},
                flag: this.flag,
                selectedTopFilter: this.volumeFilterBy.percent
              };
              dispatch(clusterActions.setFilter(newFilters));
            }
          }
        });
      }
    } else if (selectedValue === this.volumeFilterBy.count) {
      if (!this.flag.volume) {
        this.setState({
          selectedTopFilter: this.volumeFilterBy.count,
          volume: {},
        });
      } else {
        this.setState({
          selectedTopFilter: this.volumeFilterBy.count,
        }, () => {
          let newFilters = {};
          if (this.flag.volume) {
            if (!_.isEmpty(this.state.volume)) {
              newFilters = {
                volume: { volumeByCount: this.state.volume.volumeByPercent || this.state.volume.volumeByCount },
                flag: this.flag,
                selectedTopFilter: this.volumeFilterBy.count
              };
              dispatch(clusterActions.setFilter(newFilters));
            } else {
              newFilters = {
                volume: {},
                flag: this.flag,
                selectedTopFilter: this.volumeFilterBy.count
              };
              dispatch(clusterActions.setFilter(newFilters));
            }
          }
        });
      }
    }
  }

  handleInputChange(val, filteredItem) {
    const { selectedTopFilter } = this.state;
    const { dispatch } = this.props;

    if (filteredItem === this.filterItems.similarityCutOff) {
      this.setState({
        similarityCutOff: parseFloat(val),
      }, () => {
        const { similarityCutOff } = this.state;
        let newFilters = {};
        if (this.flag.similarityCutOff) {
          if (similarityCutOff) {
            newFilters = {
              similarityCutOff: this.state.similarityCutOff,
              flag: this.flag
            };
            dispatch(clusterActions.setFilter(newFilters));
          }
        } else {
          newFilters = {
            similarityCutOff: '',
            flag: this.flag
          };
          dispatch(clusterActions.setFilter(newFilters));
        }
      });
    } else if (filteredItem === this.filterItems.volume && selectedTopFilter) {
      if (selectedTopFilter === this.volumeFilterBy.count) {
        this.setState({
          volume: {
            volumeByCount: parseInt(val, 10),
          }
        }, () => {
          let newFilters = {};
          if (this.flag.volume) {
            if (!_.isEmpty(this.state.volume)) {
              newFilters = {
                volume: this.state.volume,
                flag: this.flag,
                selectedTopFilter
              };
            }
            dispatch(clusterActions.setFilter(newFilters));
          } else {
            newFilters = {
              volume: {},
              flag: this.flag,
              selectedTopFilter
            };
            dispatch(clusterActions.setFilter(newFilters));
          }
        });
      } else if (selectedTopFilter === this.volumeFilterBy.percent) {
        this.setState({
          volume: {
            volumeByPercent: parseInt(val, 10),
          }
        }, () => {
          let newFilters = {};
          if (this.flag.volume) {
            if (!_.isEmpty(this.state.volume)) {
              newFilters = {
                volume: this.state.volume,
                flag: this.flag,
                selectedTopFilter
              };
            }
            dispatch(clusterActions.setFilter(newFilters));
          } else {
            newFilters = {
              volume: {},
              flag: this.flag,
              selectedTopFilter
            };
            dispatch(clusterActions.setFilter(newFilters));
          }
        });
      }
    }
  }

  toggleCheckbox(checked, value) {
    const { dispatch } = this.props;
    const { volume, selectedTopFilter } = this.state;
    const { filters: filtersImmutable } = this.props;
    const filters = filtersImmutable.toJS();

    /* TODO: revisit once api for similarity score and top volume is ready, currently this is dummy code to check the filtering */

    if (value === this.filterItems.volume) {
      this.flag.volume = checked;
      let newFilters = {};
      if (checked) {
        if (!_.isEmpty(volume)) {
          newFilters = {
            volume,
            flag: this.flag,
            selectedTopFilter
          };
        }
        dispatch(clusterActions.setFilter(newFilters));
      } else {
        newFilters = {
          volume: {},
          flag: this.flag,
          selectedTopFilter
        };
        dispatch(clusterActions.setFilter(newFilters));
      }
    }

    if (value === this.filterItems.similarityCutOff) {
      this.flag.similarityCutOff = checked;
      let newFilters = {};
      if (checked) {
        if (this.state.similarityCutOff) {
          newFilters = {
            similarityCutOff: this.state.similarityCutOff,
            flag: this.flag
          };
          dispatch(clusterActions.setFilter(newFilters));
        }
      } else {
        newFilters = {
          similarityCutOff: '',
          flag: this.flag
        };
        dispatch(clusterActions.setFilter(newFilters));
      }
    }

    if (value === this.filterItems.finalized) {
      const newFilters = {
        finalized: !filters.finalized,
      };
      dispatch(clusterActions.setFilter(newFilters));
    }
    if (value === this.filterItems.open) {
      const newFilters = {
        open: !filters.open,
      };
      dispatch(clusterActions.setFilter(newFilters));
    }
  }

  render() {
    const { similarityCutOff, volume } = this.state;
    const { filters: filtersImmutable } = this.props;
    const filters = filtersImmutable.toJS();
    let textFieldVal = '';

    if (!_.isEmpty(filters.volume)) {
      textFieldVal = filters.volume.volumeByCount ? filters.volume.volumeByCount : filters.volume.volumeByPercent;
    } else {
      textFieldVal = !_.isEmpty(volume) && (volume.volumeByPercent ? volume.volumeByPercent : volume.volumeByCount);
    }

    return (
      <div>
        <div style={filterPopupStyle.filterTopContainer}>
          <Checkbox
            key='one'
            checked={!_.isEmpty(filters.volume) && (filters.volume.volumeByCount !== null || filters.volume.volumeByPercent !== null)}
            label='Top'
            onChange={(event) => {
              this.toggleCheckbox(event.target.checked, 'volume');
            }}
          />

          <TextField
            type='number'
            min={0}
            max={100}
            class='filter-input'
            defaultValue={textFieldVal}
            onChange={
              (event) => this.handleInputChange(event.target.value, this.filterItems.volume)
            }
            name='top-topics'
            placeholder={50}
            styleOverride={filterPopupStyle.textboxStyle}
          />

          <DropDown
            itemList={[this.volumeFilterBy.count, this.volumeFilterBy.percent]}
            labelName=' '
            selectedIndex={filters.selectedTopFilter === 'Percent' ? 1 : 0}
            styleOverride={filterPopupStyle.dropdownStyle}
            shouldRetainState
            onItemSelected={(selectedValue) => this.handleDropDownChange(selectedValue)}
          />
        </div>

        <div style={filterPopupStyle.filterSimilarity}>
          <Checkbox
            key='two'
            checked={filters.similarityCutOff !== '' || this.flag.similarityCutOff === true}
            value={this.filterItems.similarityCutOff}
            disabled={similarityCutOff === '' && !(similarityCutOff === '' && filters.similarityCutOff)}
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
            defaultValue={filters.similarityCutOff !== '' ? filters.similarityCutOff : similarityCutOff}
          />
        </div>

        <Checkbox
          key='three'
          checked={filters.finalized}
          value={this.filterItems.finalized}
          label='Finalized Topics'
          styleOverride={{ paddingBottom: '5px' }}
          onChange={(event) => {
            this.toggleCheckbox(event.target.checked, this.filterItems.finalized);
          }}
        />

        <Checkbox
          key='four'
          checked={filters.open}
          value={this.filterItems.open}
          label='Open Topics'
          onChange={(event) => {
            this.toggleCheckbox(event.target.checked, this.filterItems.open);
          }}
        />
      </div>
    );
  }
}

FilterTopics.propTypes = {
  filters: PropTypes.object,
  dispatch: PropTypes.func,
};

FilterTopics.defaultProps = {
  filters: fromJS(initialFilterState),
  dispatch: () => {},
};

const mapStateToProps = (state) => {
  const allFilters = clusterSelectors.getFilters(state) || new Map({});
  const selectedRunId = runSelectors.getSelectedRunId(state) || '';
  const filters = allFilters.get(selectedRunId);
  return {
    filters,
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(FilterTopics);
