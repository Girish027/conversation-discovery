import React, { PureComponent } from 'react';
import { TagCloud } from 'react-tagcloud';
import PropTypes from 'prop-types';

class WordCloud extends PureComponent {
  rangeSplit = (low, high, parts) => {
    const result = [];
    const part = (high - low) / (parts - 1);
    while (low < high) {
      result.push(low);
      low += part;
    }
    result.push(high);
    return result.reverse();
  };

  formSignificantScores = (wordString, low, high, separator) => {
    const res = [];
    const trimString = wordString.replace(/\s/g, '');
    const splitArr = trimString.split(separator);
    const sigScore = this.rangeSplit(low, high, splitArr.length);
    for (let i = 0; i < sigScore.length; i += 1) {
      const obj = {};
      obj.value = splitArr[i];
      obj.count = sigScore[i];
      res.push(obj);
    }
    return res;
  };

  customRenderer = (tag) => (
    <span
      key={tag.count}
      style={{
        margin: '5px',
        padding: '5px',
        display: 'inline-block',
        color: '#999999',
        fontSize: `${(tag.count) / 16}em`,
        fontFamily: 'Lato',
        fontWeight: 'bold',
      }}
    >
      {tag.value}
    </span>
  );

  render() {
    const { wordCloudcontent, showWordCloud } = this.props;
    const wordScoreList = this.formSignificantScores(wordCloudcontent, 12, 55, ',');

    if (!showWordCloud) {
      return ('');
    }

    return (
      <div>
        <TagCloud
          minSize={10}
          maxSize={30}
          tags={wordScoreList}
          shuffle
          style={{ textAlign: 'center' }}
          renderer={this.customRenderer}
        />
      </div>
    );
  }
}

WordCloud.defaultProps = {
  wordCloudcontent: '',
  showWordCloud: false,
};

WordCloud.propTypes = {
  wordCloudcontent: PropTypes.string,
  showWordCloud: PropTypes.bool,
};

export default WordCloud;
