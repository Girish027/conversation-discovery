import API from 'utils/api';
import mockServer from 'utils/mockServer';
import Constants from '../../constants';
import { setDefaultsForAPI } from 'utils/api';
import axios from 'axios';

jest.mock('utils/mockServer');

jest.mock('axios');

describe('utils/api', function () {
  const apiData = {
    url: undefined,
    onApiError : Constants.noop,
    onApiNoResponse : Constants.noop,
    onApiSuccess : Constants.noop,
    onFinalizeApi : Constants.noop,
    data : {},
    params : {},
    headers : {},
    dispatch : () => {},
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('API methods', function () {
    beforeEach(function () {
      API._api = jest.fn();
      // dispatch = jest.fn();
    });

    test('GET', () => {
      API.get(apiData);
      expect(API._api).toHaveBeenCalledWith(apiData, 'get');
    });

    test('POST', () => {
      API.post(apiData);
      expect(API._api).toHaveBeenCalledWith(apiData, 'post');
    });


    test('PATCH', () => {
      API.patch(apiData);
      expect(API._api).toHaveBeenCalledWith(apiData, 'patch');
    });


    test('PUT', () => {
      API.put(apiData);
      expect(API._api).toHaveBeenCalledWith(apiData, 'put');
    });

    test('DELETE', () => {
      API.delete(apiData);
      expect(API._api).toHaveBeenCalledWith(apiData, 'delete');
    });

    test('_apiMock', () => {
      API._apiMock(apiData);
      expect(mockServer).toHaveBeenCalledWith(apiData);
    });

    // test('_api', () => {
    //   expect(API._api(apiData)).toEquals(mockServer);
    // });

    // test('_handleSuccess', () => {
    //   const response = {
    //     data: {

    //     }
    //   };
    //   let onApiSuccess = Constants.noop;
    //   let dispatch = (func = () => {}) => {};
    //   API._handleSuccess(response, onApiSuccess, dispatch);
    //   expect(dispatch).toHaveBeenCalledWith('onApiSuccess');
    // });

  });
});
