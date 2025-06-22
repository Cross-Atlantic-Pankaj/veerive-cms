import React from 'react';
import TileTemplateForm from './TileTemplateForm';
import '../../html/css/TileTemplate.css';

const TileTemplateFormPage = () => {
    
    const handleClose = () => {
        window.close();
    };

    return (
        <div className="tile-template-form-page">
            <TileTemplateForm onClose={handleClose} />
        </div>
    );
};

export default TileTemplateFormPage; 