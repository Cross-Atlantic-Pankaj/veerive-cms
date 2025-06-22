import React, { useContext, useState } from 'react';
import TileTemplateContext from '../../context/TileTemplateContext';
import JsxParser from 'react-jsx-parser';
import Tile from '../../components/Tile';

const TileTemplateList = () => {
    const { tileTemplates, deleteTileTemplate } = useContext(TileTemplateContext);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            deleteTileTemplate(id);
        }
    };

    const handleAddNew = () => {
        window.open('/tile-templates/new', '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
    };

    const handleEdit = (templateId) => {
        window.open(`/tile-templates/edit/${templateId}`, '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
    };
    
    const filteredTemplates = tileTemplates.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="tile-template-list">
            <div className="list-header">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                <button onClick={handleAddNew} className="btn btn-add">Add New Tile Template</button>
            </div>
            <ul className="tile-grid">
                {filteredTemplates.map((template) => (
                    <li key={template._id} className="tile-template-item">
                        <h4>{template.name}</h4>
                        <p>Type: {template.type}</p>
                        <div className="tile-preview">
                            <JsxParser
                                jsx={template.jsxCode}
                                components={{ Tile }}
                                onError={(error) => console.error('JSX Parser Error:', error)}
                            />
                        </div>
                        <div className="tile-actions">
                            <button onClick={() => handleEdit(template._id)} className="btn btn-edit">Edit</button>
                            <button onClick={() => handleDelete(template._id)} className="btn btn-delete">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TileTemplateList; 