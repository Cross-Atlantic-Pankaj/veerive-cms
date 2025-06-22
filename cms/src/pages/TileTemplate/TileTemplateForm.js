import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TileTemplateContext from '../../context/TileTemplateContext';
import JsxParser from 'react-jsx-parser';
import Tile from '../../components/Tile';

const TileTemplateForm = ({ onClose }) => {
    const { id } = useParams();
    const { tileTemplates, addTileTemplate, updateTileTemplate } = useContext(TileTemplateContext);
    
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('#007bff');
    const [iconName, setIconName] = useState('LineChart');
    const [iconColor, setIconColor] = useState('#ffffff');
    const [iconSize, setIconSize] = useState(32);
    const [jsxCode, setJsxCode] = useState('');

    useEffect(() => {
        if (id) {
            const template = tileTemplates.find(t => t._id === id);
            if (template) {
                setName(template.name);
                setType(template.type);
                setBackgroundColor(template.backgroundColor || '#007bff');
                setIconName(template.iconName || 'LineChart');
                // For simplicity, we don't parse color/size from old JSX.
                // New templates will store these explicitly if needed in the future.
            }
        }
    }, [id, tileTemplates]);

    useEffect(() => {
        // Auto-generate the JSX code whenever a property changes
        const generatedJsx = `<Tile bg="${backgroundColor}" icon="${iconName}" color="${iconColor}" size={${iconSize}} />`;
        setJsxCode(generatedJsx);
    }, [backgroundColor, iconName, iconColor, iconSize]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const templateData = { name, type, jsxCode, backgroundColor, iconName };
        try {
            if (id) {
                await updateTileTemplate(id, templateData);
            } else {
                await addTileTemplate(templateData);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save tile template', error);
        }
    };

    return (
        <div className="tile-template-form-wrapper">
            <form onSubmit={handleSubmit}>
                <div className="form-header">
                    <h3>{id ? 'Edit' : 'Add'} Tile Template</h3>
                    <span className="close-btn" onClick={onClose}>&times;</span>
                </div>
                
                <div className="form-group">
                    <label className="form-label">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Type</label>
                    <input type="text" value={type} onChange={(e) => setType(e.target.value)} required className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Background Color</label>
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Icon Name</label>
                    <input type="text" value={iconName} onChange={(e) => setIconName(e.target.value)} className="form-input" />
                    <small className="form-help-text">Icon names from lucide-react (e.g., "LineChart", "check-circle").</small>
                </div>
                <div className="form-group">
                    <label className="form-label">Icon Color</label>
                    <input type="color" value={iconColor} onChange={(e) => setIconColor(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Icon Size</label>
                    <input type="range" min="16" max="96" value={iconSize} onChange={(e) => setIconSize(e.target.value)} className="form-range" />
                </div>

                <div className="form-group">
                    <label className="form-label">Live Preview:</label>
                    <div className="tile-preview">
                        <JsxParser
                            jsx={jsxCode}
                            components={{ Tile }}
                            onError={(error) => console.error('JSX Parser Error:', error)}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-edit">Save</button>
                    <button type="button" onClick={onClose} className="btn">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default TileTemplateForm; 