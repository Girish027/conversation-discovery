import Constants from 'components/../constants';

const loadCFDStore = () => {
  let savedStore = localStorage.getItem(Constants.localStorageBucket);
  if (savedStore) {
    try {
      savedStore = JSON.parse(savedStore);
    } catch (err) {
      savedStore = {};
    }
  } else {
    savedStore = {};
  }
  return savedStore;
};

export const loadStorage = (key, defaultReturnValue = null) => {
  const savedStore = loadCFDStore();
  const { [key]: value = defaultReturnValue } = savedStore;
  return value;
};

export const saveStorage = (key, value) => {
  try {
    const savedStore = loadCFDStore();
    savedStore[key] = value;
    localStorage.setItem(Constants.localStorageBucket, JSON.stringify(savedStore));
  } catch (err) {
    /* DO nothing */
  }
};

export const clearStorage = (key) => {
  try {
    const { [key]: removedData, ...savedStore } = loadCFDStore();
    localStorage.setItem(Constants.localStorageBucket, JSON.stringify(savedStore));
  } catch (err) {
    /* DO nothing */
  }
};
