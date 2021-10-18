import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  TextField
} from '@tfs/ui-components';
import ObjectUtils from '../utils/ObjectUtils';
import { customTextField } from '../styles/customComponentsStyles';
import ValidationPlaceholder from './ValidationPlaceholder';

export default class CustomTextField extends Component {
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
        style={customTextField.label}
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
        <TextField
          name={this.props.name}
          onChange={this.handleChange}
          defaultValue={this.state.value}
          placeholder={this.schema.placeholder}
          styleOverride={customTextField.field}
          minLength={this.schema.minLength}
          maxLength={this.schema.maxLength}
        />
        {validationMessage && (
          <ValidationPlaceholder validationMessage={validationMsg} />
        )}
      </React.Fragment>
    );
  }

  handleChange(event) {
    const { value, validationMessage } = event.target;
    this.setState({ value, validationMessage });
    this.props.onChange(value);
  }

  render() {
    return (
      <div
        style={customTextField}
      >
        {this.getLabel()}
        {this.getField()}
      </div>
    );
  }
}

CustomTextField.propTypes = {
  name: PropTypes.string,
  schema: PropTypes.object.isRequired,
  formData: PropTypes.string,
  onChange: PropTypes.func
};

CustomTextField.defaultProps = {
  onChange: () => {},
  name: 'textfield',
};
