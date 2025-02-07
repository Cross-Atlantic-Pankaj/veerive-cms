import React, { useContext, useState, useEffect } from 'react';
import { HomeFeedContext } from '../context/HomeFeedContext';
import SearchBar from '../components/ThemeHome/SearchBar';
import SectorDropdown from '../components/SectorDropdown';
import ContextTile from '../components/ContextDetail/ContextTile';
import axios from 'axios'; // Assuming you use axios for API calls
import '../html/css/SectorHome.css';

const SectorHome = () => {
  const { contexts, themes, subSectors, sectors, signalCategories, subSignalCategories } = useContext(HomeFeedContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [filteredContextTiles, setFilteredContextTiles] = useState([]);

  // Calculate the average scores for each sub-sector
  const subSectorScores = subSectors.map(subSector => {
    const relatedContexts = contexts.filter(context => context.subSectors.includes(subSector._id));

    const relatedThemes = relatedContexts.flatMap(context =>
      context.themes.map(themeId => themes.find(theme => theme._id === themeId))
    ).filter(theme => theme);

    const totalScore = relatedThemes.reduce((acc, theme) => acc + theme.overallScore, 0);
    const averageScore = relatedThemes.length > 0 ? (totalScore / relatedThemes.length).toFixed(2) : 0;

    const trendScores = relatedContexts.map(context => context.trendingScore);
    const disruptionPotentials = relatedContexts.map(context => context.impactScore);
    const predictiveMomentums = relatedContexts.map(context => context.predictiveMomentumScore);

    const averageTrendScore = trendScores.length > 0 ? (trendScores.reduce((acc, score) => acc + score, 0) / trendScores.length).toFixed(2) : 'N/A';
    const averageDisruptionPotential = disruptionPotentials.length > 0 ? (disruptionPotentials.reduce((acc, score) => acc + score, 0) / disruptionPotentials.length).toFixed(2) : 'N/A';
    const averagePredictiveMomentum = predictiveMomentums.length > 0 ? (predictiveMomentums.reduce((acc, score) => acc + score, 0) / predictiveMomentums.length).toFixed(2) : 'N/A';

    return {
      subSectorName: subSector.subSectorName,
      averageScore: parseFloat(averageScore),
      averageTrendScore,
      averageDisruptionPotential,
      averagePredictiveMomentum,
      sectorId: subSector.sectorId // Assuming you have a sectorId in subSector
    };
  });

  // Sort sub-sectors by their overall average score and select the top 10
  const topSubSectors = [...subSectorScores]
    .sort((a, b) => b.averageScore - a.averageScore) // Sort in descending order
    .slice(0, 10); // Get the top 10 subsectors

  // Find the sectors associated with the top subsectors
  const topSectors = sectors.filter(sector => topSubSectors.some(subSector => subSector.sectorId === sector._id));

  // Step 1: Fetch story orders for the last 3 months from StoryOrder schema
  useEffect(() => {
    const fetchStoryOrders = async () => {
      try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const response = await axios.get(`/api/storyorders`, {
          params: {
            publishDate: { $gte: threeMonthsAgo }
          }
        });

        const storyOrders = response.data; // Fetch records for the last 3 months
        filterContextTiles(storyOrders); // Step 2: Filter based on top 10 subsectors
      } catch (error) {
        console.error('Error fetching story orders:', error);
      }
    };

    fetchStoryOrders();
  }, [topSubSectors]); // Run the effect when topSubSectors changes

  // Step 2: Filter ContextTiles based on top 10 subsectors
  const filterContextTiles = (storyOrders) => {
    // Filter storyOrders based on topSubSectors
    const filteredStories = storyOrders.filter(story =>
      topSubSectors.some(subSector => story.subSectors.includes(subSector.subSectorName))
    );

    // Step 3: Sort the filtered stories by publishDate in descending order
    const sortedStories = filteredStories.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

    // Update state with the sorted stories
    setFilteredContextTiles(sortedStories);
  };

  return (
    <div className="sector-home">
      <h1>Top 10 Sub-Sectors by Overall Score</h1>

      {/* Search Bar */}
      <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

      {/* Sector Dropdown */}
      <SectorDropdown 
        sectors={sectors} 
        subSectors={subSectors} 
        onChange={(e) => setSelectedSector(e.target.value)}
      />

      <table className="sector-table">
        <thead>
          <tr>
            <th>Sector Name</th>
            <th>Sub-Sector Name</th>
            <th>Overall Score</th>
            <th>Trend Score</th>
            <th>Disruption Potential</th>
            <th>Predictive Momentum</th>
          </tr>
        </thead>
        <tbody>
          {topSectors.map(sector => (
            <React.Fragment key={sector._id}>
              <tr>
                <td>{sector.sectorName}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              {topSubSectors
                .filter(subSector => subSector.sectorId === sector._id)
                .map(subSector => (
                  <tr key={subSector.subSectorName}>
                    <td style={{ paddingLeft: '20px' }}>{subSector.subSectorName}</td>
                    <td>{subSector.averageScore}</td>
                    <td>{subSector.averageTrendScore}</td>
                    <td>{subSector.averageDisruptionPotential}</td>
                    <td>{subSector.averagePredictiveMomentum}</td>
                  </tr>
                ))
              }
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Step 4: Display Context Tiles for filtered subsectors */}
      <h2>Recent Context Tiles for Top Sub-Sectors</h2>
      <div className="context-tile-container">
        {filteredContextTiles.map(context => (
          <ContextTile 
            key={context._id} 
            context={context} 
            sectors={sectors} 
            subSectors={subSectors} 
            signalCategories={signalCategories} 
            subSignalCategories={subSignalCategories} 
          />
        ))}
      </div>
    </div>
  );
};

export default SectorHome;
