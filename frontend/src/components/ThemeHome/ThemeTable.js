// components/ThemeTable.js
import React from 'react';
import { Link } from 'react-router-dom';

const ThemeTable = ({ themes, sectors, subSectors }) => {
  const getSectorNames = (themeSectors) => {
    return themeSectors.map(sectorId => {
      const sector = sectors.find(sector => sector._id === sectorId);
      return sector ? sector.sectorName : 'Unknown';
    }).join(', ');
  };

  const getSubSectorNames = (themeSubSectors) => {
    return themeSubSectors.map(subSectorId => {
      const subSector = subSectors.find(subSector => subSector._id === subSectorId);
      return subSector ? subSector.subSectorName : 'Unknown';
    }).join(', ');
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Theme</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Sector</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Sub-Sector</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Trending Score</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Impact Score</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Predictive Momentum Score</th>
        </tr>
      </thead>
      <tbody>
        {themes.map(theme => (
          <tr key={theme._id}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              <Link to={`/theme/${theme._id}`}>
                {theme.themeTitle}
              </Link>
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{getSectorNames(theme.sectors)}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{getSubSectorNames(theme.subSectors)}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{theme.trendingScore}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{theme.impactScore}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{theme.predictiveMomentumScore}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ThemeTable;
