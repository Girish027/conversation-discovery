import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@tfs/ui-components';
import { colors } from '../../styles';

export default class IconButton extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.onFocus = this.onFocus.bind(this);
    this.clearFocus = this.clearFocus.bind(this);

    this.state = {
      focus: false,
    };
  }

  onFocus() {
    this.setState({
      focus: true
    });
  }

  getFillColor = () => {
    const {
      focusedColor,
      defaultColor,
      disabledColor,
      disabled,
    } = this.props;
    const { focus } = this.state;

    if (disabled) {
      return disabledColor;
    }
    return focus ? focusedColor : defaultColor;
  }

  getStrokeColor = () => {
    const {
      strokeColor
    } = this.props;
    return strokeColor;
  }

  clearFocus() {
    this.setState({
      focus: false
    });
  }

  render() {
    const {
      onClick,
      icon: Icon,
      height,
      width,
      padding,
      title,
      disabled,
    } = this.props;

    return (
      <Button
        onClick={onClick}
        type='flat'
        styleOverride={{
          height: 'auto',
          border: 'none',
          padding,
          backgroundColor: 'initial'
        }}
        disabled={disabled}
        onBlur={this.clearFocus}
        onFocus={this.onFocus}
        onMouseEnter={this.onFocus}
        onMouseOver={this.onFocus}
        onMouseLeave={this.clearFocus}
        onMouseOut={this.clearFocus}
        name='action-button'
        title={title}
      >
        <Icon
          fill={this.getFillColor()}
          width={width}
          height={height}
          stroke={this.getStrokeColor()}
        />
      </Button>
    );
  }
}

IconButton.propTypes = {
  icon: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  padding: PropTypes.string,
  focusedColor: PropTypes.string,
  defaultColor: PropTypes.string,
  disabledColor: PropTypes.string,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  strokeColor: PropTypes.string
};

IconButton.defaultProps = {
  onClick: () => {},
  width: 10,
  height: 10,
  padding: '1px 1px 3px 1px',
  focusedColor: colors.prussianBlue,
  defaultColor: colors.cobalt,
  disabledColor: colors.disabledText,
  title: '',
  disabled: false,
  strokeColor: 'none'
};
