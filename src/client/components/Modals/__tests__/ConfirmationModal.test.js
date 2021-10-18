import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ConfirmationModal from 'components/Modals/ConfirmationModal';

describe('<ConfirmationModal />', function () {
  let wrapper;


  const props = {
    header: 'Confirming action',
    message: 'Are you sure you want to do this?'
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<ConfirmationModal
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly in confirmation mode', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly in delete confirm mode', () => {
      wrapper = getShallowWrapper({ ...props, deleteMode: true });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeEach(() => {
      props.onClickClose = jest.fn();
      props.onClickOk = jest.fn();
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onClickOk', () => {
      test('should close the dialog and call the okay handler', () => {
        wrapper.instance().onClickOk();
        expect(props.onClickClose).toHaveBeenCalled();
        expect(props.onClickOk).toHaveBeenCalled();
      });
    });
  });
});
