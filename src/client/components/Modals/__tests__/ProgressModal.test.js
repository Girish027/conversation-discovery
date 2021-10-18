import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ProgressModal from 'components/Modals/ProgressModal';

describe('<ProgressModal />', function () {
  let wrapper;


  const props = {
    message: 'operation in progress...'
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = shallow(<ProgressModal
        {...props}
      />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly for default props', () => {
      wrapper = shallow(<ProgressModal
        {...props}
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when cancel button is to be shown', () => {
      wrapper = shallow(<ProgressModal
        {...props}
        showCancelButton
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders with closeIcon visible when given via props', () => {
      wrapper = shallow(<ProgressModal
        {...props}
        closeIconVisible
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
