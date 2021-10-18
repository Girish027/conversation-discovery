import React from 'react';
import PropTypes from 'prop-types';

const Spinner = (props) => {
  const { height, width, stroke } = props;

  return (
    <svg width={width} height={height} viewBox='0 -2 40 50' xmlns='http://www.w3.org/2000/svg' stroke={stroke}>
      <g fill='none' fillRule='evenodd'>
        <g transform='translate(1 1)' strokeWidth='4'>
          <circle strokeOpacity='.1' cx='18' cy='18' r='18' />
          <path d='M36 18c0-9.94-8.06-18-18-18' transform='rotate(147.172 18 18)'>
            <animateTransform attributeName='transform' type='rotate' from='0 18 18' to='360 18 18' dur='1s' repeatCount='indefinite' />
          </path>
        </g>
      </g>
    </svg>
  );
};

Spinner.defaultProps = {
  height: '50',
  width: '50',
  stroke: '#EF8822'
};

Spinner.propTypes = {
  height: PropTypes.string,
  width: PropTypes.string,
  stroke: PropTypes.string,
};

export default Spinner;
