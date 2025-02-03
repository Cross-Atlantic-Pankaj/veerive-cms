import React, { useContext } from 'react';
import SubSectorList from './SubSectorList';
import SubSectorForm from './SubSectorForm';
import SubSectorContext from '../../context/SubSectorContext';
import SectorContext from '../../context/SectorContext';
import '../../html/css/SubSector.css';

export default function SubSectorPage() {
    const { subSectors, isFormVisible, handleAddClick, handleFormSubmit } = useContext(SubSectorContext);
    const { sectors } = useContext(SectorContext);

    return (
        <div className="sub-sectors-container">
            <h2>Sub-Sectors Master</h2>
            {!isFormVisible ? (
                <>
                    <button className="add-sub-sector-btn" onClick={handleAddClick}>Add Sub-Sector</button>
                    <SubSectorList />
                </>
            ) : (
                <SubSectorForm sectors={sectors} handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
}
