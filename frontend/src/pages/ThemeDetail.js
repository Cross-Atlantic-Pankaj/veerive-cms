// // pages/ThemeDetail.js
// import React, { useContext } from 'react';
// import { useParams } from 'react-router-dom';
// import { HomeFeedContext } from '../context/HomeFeedContext';
// import ThemeTable from '../components/ThemeHome/ThemeTable'; // Reuse the ThemeTable component
// import ContextTile from '../components/ContextDetail/ContextTile';  // Import the ContextTile component
// import '../html/css/ThemeDetail.css'; // Add any additional styling here

// const ThemeDetail = () => {
//   const { id } = useParams(); // Get theme ID from URL parameters
//   const { themes, contexts, sectors, subSectors, signalCategories, subSignalCategories } = useContext(HomeFeedContext);

//   // Find the selected theme by ID
//   const selectedTheme = themes.find(theme => theme._id === id);

//   if (!selectedTheme) {
//     return <div>Theme not found</div>;
//   }

//   // Find sectors and sub-sectors of the selected theme
//   const themeSectors = selectedTheme.sectors.map(sectorId => {
//     const sector = sectors.find(s => s._id === sectorId);
//     return sector ? sector.sectorName : 'Unknown';
//   }).join(' | ');

//   const themeSubSectors = selectedTheme.subSectors.map(subSectorId => {
//     const subSector = subSectors.find(s => s._id === subSectorId);
//     return subSector ? subSector.subSectorName : 'Unknown';
//   }).join(' | ');

//   // Filter contexts where the selected theme is present in the theme array of the context
//   const filteredContexts = contexts.filter(context => 
//     context.themes.includes(selectedTheme._id)
//   );

//   return (
//     <div style={{ padding: '20px' }}>
//       {/* Display theme details */}
//       <h1>{selectedTheme.themeTitle}</h1>
//       <p>{themeSectors} | {themeSubSectors}</p>
//       <p>{selectedTheme.themeDescription}</p>
//       <p>
//         Trending Pulse: {selectedTheme.trendingScore} | 
//         Disruption Potential: {selectedTheme.impactScore} | 
//         Predictive Momentum: {selectedTheme.predictiveMomentumScore}
//       </p>

//       {/* Display table of themes tagged to the same sectors */}
//       <h2>Related Themes in the Same Sector</h2>
//       <ThemeTable
//         themes={[selectedTheme]} // Reuse the existing table for displaying themes
//         sectors={sectors}
//         subSectors={subSectors}
//       />

//       {/* Display ContextTiles */}
//       <div className="context-tile-container">
//         {filteredContexts.length > 0 ? (
//           filteredContexts.map(context => (
//             <ContextTile
//               key={context._id}
//               context={context}
//               sectors={sectors}
//               subSectors={subSectors}
//               signalCategories={signalCategories}
//               subSignalCategories={subSignalCategories}
//             />
//           ))
//         ) : (
//           <p>No contexts available for this theme</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ThemeDetail;
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
