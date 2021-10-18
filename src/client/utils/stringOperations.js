export const convertFirstLetterUppercase = (str = '') => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const replaceUnderscoreWithSpace = (str = '') => str.replace(/_/g, ' ');

export const putSpaceAfterComma = (str = '') => str.replace(/,\s*/g, ', ');

export const prepareClusterName = (str = '') => convertFirstLetterUppercase(putSpaceAfterComma(replaceUnderscoreWithSpace(str)));

export const prepareKeywordName = (str = '') => convertFirstLetterUppercase(replaceUnderscoreWithSpace(str));
