import React from 'react';

const ScoresRow = ({ overallScore, trendingScore, impactScore, predictiveMomentumScore }) => {
  return (
    <div className="scores-row">
      <div>Overall Score: {overallScore || 'N/A'}</div>
      <div>Trending Score: {trendingScore || 'N/A'}</div>
      <div>Impact Score: {impactScore || 'N/A'}</div>
      <div>Predictive Momentum Score: {predictiveMomentumScore || 'N/A'}</div>
    </div>
  );
};

export default ScoresRow;
