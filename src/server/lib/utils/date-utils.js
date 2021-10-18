'use strict';

module.exports.toShortFormat = (date) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const monthName = monthNames[monthIndex];
  const year = date.getFullYear();

  return `${day}-${monthName}-${year}`;
};