import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import SimpleModal from 'components/Modals/SimpleModal';

describe('<SimpleModal />', function () {
  let wrapper;

  const props = {
    header: 'Access Denied',
    message: 'unauthorized to access this client'
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<SimpleModal
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly ', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeEach(() => {
      props.onClickClose = jest.fn();
      props.onClickOkButton = jest.fn();
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onClickOk', () => {
      test('should close the dialog and call the okay handler', () => {
        wrapper.instance().onClickOk();
        expect(props.onClickClose).toHaveBeenCalled();
        expect(props.onClickOkButton).toHaveBeenCalled();
      });
    });
  });
});
