import React, { useContext } from 'react';
import SectorList from './SectorList';
import SectorForm from './SectorForm';
import SectorContext from '../../context/SectorContext';
import '../../html/css/Sector.css';

export default function SectorPage() {
    const {  isFormVisible, handleAddClick, handleFormSubmit } = useContext(SectorContext);

    return (
        <div className="sectors-container">
            <h2>Sectors Master</h2>
            {!isFormVisible ? (
                <>
                    <button className="add-sector-btn" onClick={handleAddClick}>Add Sector</button>
                    <SectorList />
                </>
            ) : (
                <SectorForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
}
