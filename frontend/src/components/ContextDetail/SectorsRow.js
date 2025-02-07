import React from 'react';

const SectorsRow = ({ sector, subSector, signalCategory, subSignalCategory }) => {
  return (
    <div className="sectors-row">
      <div>Sector: {sector?.name || 'N/A'}</div>
      <div>Sub-Sector: {subSector?.name || 'N/A'}</div>
      <div>Signal Category: {signalCategory?.name || 'N/A'}</div>
      <div>Sub-Signal Category: {subSignalCategory?.name || 'N/A'}</div>
    </div>
  );
};

export default SectorsRow;
