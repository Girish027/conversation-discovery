import dateFormat from 'dateformat';

export const getDateFromTimestamp = (timestamp, locale = 'en-US') => new Date(parseInt(timestamp, 10))
  .toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatTimestamp = (timestamp, format = 'mmm d, h:MM TT') => {
  const dateObj = new Date(parseInt(timestamp, 10));
  return dateFormat(dateObj, format);
};
