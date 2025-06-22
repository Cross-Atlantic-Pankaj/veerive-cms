import React, { useState } from 'react';
import TileTemplateList from './TileTemplateList';
import TileTemplateForm from './TileTemplateForm';
import '../../html/css/TileTemplate.css';

const TileTemplatePage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const handleAdd = () => {
        setEditingTemplate(null);
        setShowForm(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingTemplate(null);
    };

    return (
        <div className="tile-template-page-container">
            <div className="tile-template-layout">
                <div className="tile-list-container">
                    <h2>Tile Templates</h2>
                    <TileTemplateList 
                        onAddClick={handleAdd} 
                        onEditClick={handleEdit}
                    />
                </div>
                {showForm && (
                    <div className="tile-form-container">
                        <TileTemplateForm
                            template={editingTemplate}
                            onClose={handleCloseForm}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TileTemplatePage; 