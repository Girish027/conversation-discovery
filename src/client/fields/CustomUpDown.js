import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ObjectUtils from '../utils/ObjectUtils';
import { customUpDown } from '../styles/customComponentsStyles';
import ValidationPlaceholder from './ValidationPlaceholder';
import GenericTooltip from '../components/Tooltip/Tooltip';
import Language from '../Language';

export default class CustomUpDown extends Component {
  constructor(props) {
    super(props);
    this.schema = props.schema;
    const value = ObjectUtils.isEmptyOrNull(props.formData)
      ? this.schema.default
      : props.formData;
    this.state = {
      value,
      validationMessage: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  getLabel() {
    return (
      <div
        style={customUpDown.label}
      >
        {this.schema.title}
      </div>
    );
  }

  getField() {
    const { validationMessage } = this.state;
    let validationMsg = '';

    if (validationMessage) {
      validationMsg = validationMessage.slice(0, validationMessage.indexOf('('));
    }

    return (
      <React.Fragment>
        <GenericTooltip content={this.props.name === 'numOfClusters' ? Language.RUN.TOOLTIP.custers : Language.RUN.TOOLTIP.turns}>
          <input
            value={this.state.value}
            name={this.props.name}
            type='number'
            onChange={this.handleChange}
            min={this.schema.minimum}
            max={this.schema.maximum}
            style={customUpDown.field}
          />
        </GenericTooltip>
        {validationMessage && (
          <ValidationPlaceholder validationMessage={validationMsg} />
        )}
      </React.Fragment>
    );
  }

  handleChange(event) {
    const { value, validationMessage } = event.target;
    const newValue = parseInt(value, 10);
    this.setState({ value: newValue, validationMessage });
    this.props.onChange(newValue);
  }

  render() {
    return (
      <div
        style={customUpDown}
      >
        {this.getLabel()}
        {this.getField()}
      </div>
    );
  }
}

CustomUpDown.propTypes = {
  name: PropTypes.string,
  schema: PropTypes.object.isRequired,
  formData: PropTypes.number,
  onChange: PropTypes.func,
};

CustomUpDown.defaultProps = {
  onChange: () => {},
  name: 'updown',
};
