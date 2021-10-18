import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import Spinner from 'components/Status/Spinner';

describe('<Spinner />', function () {
  let wrapper;

  test('should render correctly with default props', () => {
    wrapper = shallow(<Spinner />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  test('should render correctly with given props', () => {
    wrapper = shallow(<Spinner
      height={'10px'}
      width={'10px'}
      stroke={'#ddd'}
    />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
