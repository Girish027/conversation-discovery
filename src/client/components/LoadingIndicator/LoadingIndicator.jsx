import React from 'react';
import PropTypes from 'prop-types';
import { LoadingScreen } from '@tfs/ui-components';

const LoadingIndicator = (props) => {
  const {
    color,
    size,
    isHerbie,
    message
  } = props;
  return (
    <LoadingScreen
      spinnerSize={size}
      spinnerColor={color}
      isHerbie={isHerbie}
      message={message}
    />
  );
};

LoadingIndicator.defaultProps = {
  size: 30,
  color: '#A7A9AF',
  isHerbie: false,
  message: ''
};

LoadingIndicator.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  isHerbie: PropTypes.bool,
  message: PropTypes.string
};

export default LoadingIndicator;
