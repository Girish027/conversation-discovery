import { connect } from 'react-redux';
import WordCloud from './WordCloud';
import { getWordCloudContentSelector, getShowWordCloudSelector } from 'state/appState';

const mapStateToProps = (state) => ({
  wordCloudcontent: getWordCloudContentSelector(state),
  showWordCloud: getShowWordCloudSelector(state),
});

export default connect(mapStateToProps)(WordCloud);
