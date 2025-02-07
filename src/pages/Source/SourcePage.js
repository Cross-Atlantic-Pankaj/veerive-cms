// pages/Region/RegionPage.js
import React, { useContext } from 'react';
import SourceList from './SourceList';
import SourceForm from './SourceForm';
import SourceContext from '../../context/SourceContext';
import '../../html/css/Source.css';

const SourcePage = () => {
    const {  isFormVisible, handleAddClick, handleFormSubmit } = useContext(SourceContext);

    return (
        <div className="source-page">
            <h2>Sources Master</h2>
            {!isFormVisible ? (
                <>
                    <button className="add-region-btn" onClick={handleAddClick}>Add Source</button>
                    <SourceList />
                </>
            ) : (
                <SourceForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
};

export default SourcePage;
