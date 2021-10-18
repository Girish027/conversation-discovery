import React from 'react';
import PropTypes from 'prop-types';
import { FaChartPie } from 'react-icons/fa';
import { IconContext } from 'react-icons';

function PieChart(props) {
  const { fill, size } = props;
  return (
    <IconContext.Provider
      value={{
        color: fill,
        size,
      }}
    >
      <FaChartPie />
    </IconContext.Provider>
  );
}

PieChart.propTypes = {
  fill: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

PieChart.defaultProps = {
  fill: '#313f54',
  size: '10px'
};

export default PieChart;
