import React, { useContext } from 'react';
import { HomeFeedContext } from '../../context/HomeFeedContext';
import '../../html/css/TypeOneContainer.css'; 

export default function TypeOneContainer({ context }) {
    const { sectorMap, subSectorMap } = useContext(HomeFeedContext); // Access the maps from context
    const { sectors, subSectors, contextTitle } = context;

    // Map the IDs to their respective names
    const sectorNames = sectors.map(id => sectorMap[id]).filter(Boolean);
    const subSectorNames = subSectors.map(id => subSectorMap[id]).filter(Boolean);

    // Join the sector and subSector names with "|"
    const categories = `${sectorNames.join(' | ')} | ${subSectorNames.join(' | ')}`;

    return (
        <div className="article-container">
            <div className="image-placeholder">1000 x 630</div>
            <div className="category">
                <span>{categories}</span> {/* Updated to display dynamic categories */}
            </div>
            <h4 className="headline">
                {contextTitle} {/* Updated to display contextTitle */}
            </h4>
            <div className="metrics">
                <div className="metric">
                    <div className="metric-icon trending">0</div>
                    <div>Trending Pulse</div>
                </div>
                <div className="metric">
                    <div className="metric-icon disruption">7</div>
                    <div>Disruption Potential</div>
                </div>
                <div className="metric">
                    <div className="metric-icon predictive">0</div>
                    <div>Predictive Momentum</div>
                </div>
            </div>
        </div>
    );
}
