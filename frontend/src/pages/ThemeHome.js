// // pages/ThemeHome.js
// import React, { useContext, useState } from 'react';
// import { HomeFeedContext } from '../context/HomeFeedContext';
// import SearchBar from '../components/ThemeHome/SearchBar';
// import SectorDropdown from '../components/SectorDropdown';
// import ThemeTable from '../components/ThemeHome/ThemeTable';
// import ThemeTile from '../components/ThemeHome/ThemeTile'; // Import the new ThemeTile component

// const ThemeHome = () => {
//   const { themes, sectors, subSectors } = useContext(HomeFeedContext);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedSector, setSelectedSector] = useState('');

//   // Filter the themes based on search term
//   const filteredThemes = themes.filter(theme =>
//     theme.themeTitle.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Filter themes based on selected sector/sub-sector
//   const displayedThemes = filteredThemes.filter(theme =>
//     selectedSector ? theme.sectors.includes(selectedSector) : true
//   );

//   return (
//     <div style={{ padding: '20px' }}>
//       {/* Search Bar */}
//       <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      
//       {/* Sector and Sub-Sector Dropdown */}
//       <SectorDropdown 
//         sectors={sectors} 
//         subSectors={subSectors} 
//         onChange={(e) => setSelectedSector(e.target.value)}
//       />

//       {/* Theme Table */}
//       <ThemeTable 
//         themes={displayedThemes.length > 0 ? displayedThemes : themes} 
//         sectors={sectors} 
//         subSectors={subSectors} 
//       />

//       {/* Theme Tiles in Flexbox Layout */}
//       <div className="theme-tile-container">
//         {displayedThemes.map(theme => {
//           const themeSectors = theme.sectors.map(sectorId => {
//             const sector = sectors.find(s => s._id === sectorId);
//             return sector ? sector.sectorName : 'Unknown';
//           });

//           const themeSubSectors = theme.subSectors.map(subSectorId => {
//             const subSector = subSectors.find(s => s._id === subSectorId);
//             return subSector ? subSector.subSectorName : 'Unknown';
//           });

//           return (
//             <ThemeTile
//               key={theme._id}
//               themeId={theme._id}
//               themeTitle={theme.themeTitle}
//               sectors={themeSectors}
//               subSectors={themeSubSectors}
//               trendingScore={theme.trendingScore}
//               impactScore={theme.impactScore}
//               predictiveMomentumScore={theme.predictiveMomentumScore}
//             />
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ThemeHome;

// pages/ThemeDetail.js
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { HomeFeedContext } from '../context/HomeFeedContext';
import ThemeTable from '../components/ThemeHome/ThemeTable'; // Reuse the ThemeTable component
import ContextTile from '../components/ContextDetail/ContextTile'; // Import the ContextTile component
import '../html/css/ThemeDetail.css'; // Add any additional styling here

const ThemeDetail = () => {
  const { id } = useParams(); // Get theme ID from URL parameters
  const { themes = [], contexts = [], sectors = [], subSectors = [], signalCategories = [], subSignalCategories = [] } = useContext(HomeFeedContext);

  // Find the selected theme by ID
  const selectedTheme = themes.find((theme) => theme._id === id);

  if (!selectedTheme) {
    return <div>Theme not found</div>;
  }

  // Find sectors and sub-sectors of the selected theme
  const themeSectors = selectedTheme.sectors
    ?.map((sectorId) => {
      const sector = sectors.find((s) => s._id === sectorId);
      return sector ? sector.sectorName : 'Unknown';
    })
    .join(' | ') || 'Uncategorized';

  const themeSubSectors = selectedTheme.subSectors
    ?.map((subSectorId) => {
      const subSector = subSectors.find((s) => s._id === subSectorId);
      return subSector ? subSector.subSectorName : 'Unknown';
    })
    .join(' | ') || 'Uncategorized';

  // Filter contexts where the selected theme is present in the theme array of the context
  const filteredContexts = contexts.filter((context) =>
    context.themes?.includes(selectedTheme._id)
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* Display theme details */}
      <h1>{selectedTheme.themeTitle}</h1>
      <p>{themeSectors} | {themeSubSectors}</p>
      <p>{selectedTheme.themeDescription}</p>
      <p>
        Trending Pulse: {selectedTheme.trendingScore || 'N/A'} | 
        Disruption Potential: {selectedTheme.impactScore || 'N/A'} | 
        Predictive Momentum: {selectedTheme.predictiveMomentumScore || 'N/A'}
      </p>

      {/* Display table of themes tagged to the same sectors */}
      <h2>Related Themes in the Same Sector</h2>
      <ThemeTable
        themes={[selectedTheme]} // Reuse the existing table for displaying themes
        sectors={sectors}
        subSectors={subSectors}
      />

      {/* Display ContextTiles */}
      <div className="context-tile-container">
        {filteredContexts.length > 0 ? (
          filteredContexts.map((context) => (
            <ContextTile
              key={context._id}
              context={context}
              sectors={sectors}
              subSectors={subSectors}
              signalCategories={signalCategories}
              subSignalCategories={subSignalCategories}
            />
          ))
        ) : (
          <p>No contexts available for this theme</p>
        )}
      </div>
    </div>
  );
};

export default ThemeDetail;
