import React, { useState, useContext } from 'react';
import '../../html/css/DisplayPostTile.css';
import { HomeFeedContext } from '../../context/HomeFeedContext'; // Assuming context is set up already

const DisplayPostTile = ({ postTitle, summary }) => {
  // Combine sectors, subSectors, and signals into one array of tags
 // const tags = [...sectors, ...subSectors, ...signals];
//const { postTitle, summary } = useContext(HomeFeedContext);
  return (
    <div className="tile">
      <h2 className="tile-title">{postTitle || 'No Title Available'}</h2>

      <p className="tile-summary">
        {summary || 'No Summary Available'}
      </p>

      <button className="tile-button">See More</button>
    </div>
  );
};

export default DisplayPostTile;
