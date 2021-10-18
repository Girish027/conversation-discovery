import React from 'react';
import PropTypes from 'prop-types';
import { FaAngleRight } from 'react-icons/fa';
import { IconContext } from 'react-icons';

function AngleRight(props) {
  const { width, height } = props;
  return (
    <IconContext.Provider
      value={{
        color: '#2C3E50',
        style: { backgroundColor: '#FFFFFF', borderRadius: '8px', boxShadow: '0 2px 7px 0 rgba(0, 0, 0, 0.16)' },
        width,
        height,
      }}
    >
      <div>
        <FaAngleRight size={16} />
      </div>
    </IconContext.Provider>
  );
}

AngleRight.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

AngleRight.defaultProps = {
  width: '2.5em',
  height: '2.5em'
};

export default AngleRight;
