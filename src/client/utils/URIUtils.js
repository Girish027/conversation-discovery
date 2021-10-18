import memoizeOne from 'memoize-one';

export const getURLParams = memoizeOne((url = '') => {
  const paramObject = {};
  const search = url.split('?');
  if (search[1]) {
    const params = search[1].split('&');
    params.forEach((param) => {
      const [key, value] = param.split('=');
      paramObject[key] = value;
    });
  }
  return paramObject;
});
