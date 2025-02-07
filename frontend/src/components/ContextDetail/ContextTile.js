// components/ContextTile.js
import React from 'react';
import '../../html/css/ContextTile.css'; // Externalize the CSS for better structure

const ContextTile = ({ context, sectors, subSectors, signalCategories, subSignalCategories }) => {
  // Format sectors and sub-sectors
  const formatSectors = () => {
    const sectorNames = context.sectors.map(sectorId => {
      const sector = sectors.find(s => s._id === sectorId);
      return sector ? sector.sectorName : 'Unknown';
    });

    const subSectorNames = context.subSectors.map(subSectorId => {
      const subSector = subSectors.find(s => s._id === subSectorId);
      return subSector ? subSector.subSectorName : 'Unknown';
    });

    return [...sectorNames, ...subSectorNames].join(' | ');
  };

  // Format signal categories and sub-signal categories
  const formatSignals = () => {
    // Get signal names from signalCategories (check if context.signalCategories exists)
    const signalNames = context.signalCategories ? context.signalCategories.map(signalId => {
      const signal = signalCategories.find(s => s._id.toString() === signalId.toString());
      return signal ? signal.signalName : 'Unknown';
    }) : []; // If signalCategories is undefined or empty, return an empty array.
  
    // Check if subSignalCategories exists and has elements before mapping
    //console.log('context.subSignals', context.signalSubCategories)
    //console.log('context', context)  

    const subSignalNames = context.signalSubCategories ? context.signalSubCategories.map(subSignalId => {
      const subSignal = subSignalCategories.find(s => s._id.toString() === subSignalId.toString());
      return subSignal ? subSignal.subSignalName : 'Unknown';
    }) : []; // If subSignalCategories is undefined or empty, return an empty array.
  
    // Join and return signal and sub-signal names
    return [...signalNames, ...subSignalNames].join(' | ');
  };
  
  

  return (
    <div className="news-tile">
      <h2 className="news-title">{context.contextTitle}</h2>
      <div className="news-sectors">
        <span className="sector">{formatSectors()}</span>
      </div>
      <span className="news-topic">{formatSignals()}</span>
    </div>
  );
};

export default ContextTile;
