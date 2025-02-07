import React, { useContext } from 'react';
import '../../html/css/TypeNumContainer.css'; // Import the CSS file
import { HomeFeedContext } from '../../context/HomeFeedContext';

export default function TypeNumContainer({context}) {
  //const { sectorMap, subSectorMap } = useContext(HomeFeedContext); // Access the maps from context
//  const { contextTitle, dataForTypeNum, summary } = context;

  // Map the IDs to their respective names
  //const sectorNames = sectors.map(id => sectorMap[id]).filter(Boolean);
  //const subSectorNames = subSectors.map(id => subSectorMap[id]).filter(Boolean);

  // Join the sector and subSector names with "|"
  //const categories = `${sectorNames.join(' | ')} | ${subSectorNames.join(' | ')}`;

  return (
    <div className="container">
      <div className="content">
        <div className="left-column">
          {/* Display dynamic big text */}
          <div className="big-text">{'$ XX Billion'}</div>
        </div>
        <div className="right-column">
          {/* Display dynamic summary --  <div className="bullet-list" dangerouslySetInnerHTML={{ __html: summary }} />*/}
          <div className="bullet-list" dangerouslySetInnerHTML={{ __html: 'Lorem Ipsum'}}/>

        </div>
      </div>
    </div>
  );
}
