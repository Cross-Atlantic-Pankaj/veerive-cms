import React from 'react';
import { Link } from 'react-router-dom';
import '../../html/css/ThemeTile.css'; 

const ThemeTile = ({ themeTitle, sectors, subSectors, trendingScore, impactScore, predictiveMomentumScore, themeId }) => {
    // Format sectors and sub-sectors
  const formatCategories = () => {
    const sectorNames = sectors.join(' | ');
    const subSectorNames = subSectors.map(subSector => subSector).join(' | ');
    return [sectorNames, subSectorNames].filter(Boolean).join(' | ');
  };

  return (
    <div className="article-tile">
      <img src="/placeholder.svg?height=630&width=1000" alt="Article image" className="article-image" />
      <div className="article-content">
        <div className="article-category">{formatCategories()}</div>
        <h2 className="article-title">
            <Link to={`/theme/${themeId}`}>
                {themeTitle}
            </Link>
        </h2>
        <div className="article-metrics">
          <div className="metric">
            <div className="metric-value trending-pulse">{trendingScore}</div>
            <div className="metric-label">Trending Pulse</div>
          </div>
          <div className="metric">
            <div className="metric-value disruption-potential">{impactScore}</div>
            <div className="metric-label">Disruption Potential</div>
          </div>
          <div className="metric">
            <div className="metric-value predictive-momentum">{predictiveMomentumScore}</div>
            <div className="metric-label">Predictive Momentum</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTile;
