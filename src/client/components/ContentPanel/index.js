import { connect } from 'react-redux';
import ContentPanel from './ContentPanel';
import { getPathnameSelector } from 'state/routerState';

const mapStateToProps = (state) => ({
  routeName: getPathnameSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});


export default connect(mapStateToProps, mapDispatchToProps)(ContentPanel);
