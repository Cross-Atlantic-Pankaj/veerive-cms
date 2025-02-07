// components/SectorDropdown.js
import React from 'react';

const SectorDropdown = ({ sectors, subSectors, onChange }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <select style={{ width: '100%', padding: '10px', fontSize: '16px' }} onChange={onChange}>
        <option value="">Select Sector</option>
        {sectors.map(sector => (
          <React.Fragment key={sector._id}>
            <option value={sector._id}>{sector.sectorName}</option>
            {subSectors
              .filter(subSector => subSector.sectorId === sector._id)
              .map(subSector => (
                <option key={subSector._id} value={subSector._id}>
                  {'-- ' + subSector.subSectorName}
                </option>
              ))}
          </React.Fragment>
        ))}
      </select>
    </div>
  );
};

export default SectorDropdown;
