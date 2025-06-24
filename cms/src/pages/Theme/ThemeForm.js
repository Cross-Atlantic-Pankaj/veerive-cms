import React, { useContext, useState, useEffect } from 'react';
import ThemeContext from '../../context/ThemeContext';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import '../../html/css/Theme.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import TileTemplateContext from '../../context/TileTemplateContext';
import Select from 'react-select';
import JsxParser from 'react-jsx-parser';
import Tile from '../../components/Tile';

export default function ThemeForm({ handleFormSubmit }) {
    const { themes, themesDispatch, sectors: sectorsData, subSectors: subSectorsData, setIsFormVisible, isFormVisible } = useContext(ThemeContext);
    const { tileTemplates } = useContext(TileTemplateContext);
    const navigate = useNavigate();

    const [themeTitle, setThemeTitle] = useState('');
    const [isTrending, setIsTrending] = useState(false);
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [selectedSubSectors, setSelectedSubSectors] = useState([]);
    const [generalComment, setGeneralComment] = useState('');
    const [themeDescription, setThemeDescription] = useState(''); // New state
    const [filteredSubSectors, setFilteredSubSectors] = useState([]);

    // New state for additional fields
    const [trendingScore, setTrendingScore] = useState(0);
    const [impactScore, setImpactScore] = useState(0);
    const [predictiveMomentumScore, setPredictiveMomentumScore] = useState(0);
    const [trendingScoreImage, setTrendingScoreImage] = useState('');
    const [impactScoreImage, setImpactScoreImage] = useState('');
    const [predictiveMomentumScoreImage, setPredictiveMomentumScoreImage] = useState('');
    const overallScoreCalc = (trendingScore * 0.35) + (impactScore * 0.4) + (predictiveMomentumScore * 0.25);

    const [tileTemplateId, setTileTemplateId] = useState(null);

    // Prepare options for react-select
    const sectorOptions = sectorsData.data?.map(sector => ({ value: sector._id, label: sector.sectorName })) || [];
    const allSubSectorOptions = subSectorsData.data?.map(subSector => ({ value: subSector._id, label: subSector.subSectorName, sectorId: subSector.sectorId })) || [];
    const subSectorOptions = filteredSubSectors.map(subSector => ({ value: subSector._id, label: subSector.subSectorName, sectorId: subSector.sectorId }));

    useEffect(() => {
        if (themes.editId && sectorOptions.length > 0 && allSubSectorOptions.length > 0) {
            let theme = themes.data.find((ele) => ele._id === themes.editId);
            if (!theme && themes.allThemes) {
                theme = themes.allThemes.find((ele) => ele._id === themes.editId);
            }
            if (theme) {
                setThemeTitle(theme.themeTitle || '');
                setIsTrending(theme.isTrending || false);
                setSelectedSectors((theme.sectors || []).map(id => {
                    const sector = sectorOptions.find(opt => String(opt.value) === String(id));
                    return sector || { value: id, label: id };
                }));
                setSelectedSubSectors((theme.subSectors || []).map(id => {
                    const subSector = allSubSectorOptions.find(opt => String(opt.value) === String(id));
                    return subSector || { value: id, label: id };
                }));
                setGeneralComment(theme.generalComment || '');
                setThemeDescription(theme.themeDescription || '');
                setTrendingScore(theme.trendingScore || 0);
                setImpactScore(theme.impactScore || 0);
                setPredictiveMomentumScore(theme.predictiveMomentumScore || 0);
                setTrendingScoreImage(theme.trendingScoreImage || '');
                setImpactScoreImage(theme.impactScoreImage || '');
                setPredictiveMomentumScoreImage(theme.predictiveMomentumScoreImage || '');
                // Set tileTemplateId for edit
                if (theme.tileTemplateId) {
                    const template = tileTemplates.find(t => t._id === String(theme.tileTemplateId));
                    if (template) {
                        setTileTemplateId({ value: template._id, label: template.name, jsxCode: template.jsxCode });
                    }
                } else {
                    setTileTemplateId(null);
                }
                // Filter sub-sectors for dropdown display
                if (subSectorsData.data && theme.sectors) {
                    const filtered = subSectorsData.data.filter(subSector => theme.sectors.map(sid => String(sid)).includes(String(subSector.sectorId)));
                    setFilteredSubSectors(filtered);
                }
            } else {
                console.error("Theme not found with ID:", themes.editId);
            }
        } else if (!themes.editId) {
            // Reset form for new theme
            setThemeTitle('');
            setIsTrending(false);
            setSelectedSectors([]);
            setSelectedSubSectors([]);
            setGeneralComment('');
            setThemeDescription('');
            setFilteredSubSectors([]);
            setTrendingScore(0);
            setImpactScore(0);
            setPredictiveMomentumScore(0);
            setTrendingScoreImage('');
            setImpactScoreImage('');
            setPredictiveMomentumScoreImage('');
            setTileTemplateId(null);
        }
    }, [themes.editId, themes.data, themes.allThemes, subSectorsData.data, tileTemplates, sectorOptions.length, allSubSectorOptions.length]);

    // Update filteredSubSectors when selectedSectors changes
    useEffect(() => {
        if (subSectorsData.data && selectedSectors.length > 0) {
            const selectedSectorIds = selectedSectors.map(s => s.value);
            const filtered = subSectorsData.data.filter(subSector => selectedSectorIds.includes(subSector.sectorId));
            setFilteredSubSectors(filtered);
        } else {
            setFilteredSubSectors([]);
        }
    }, [selectedSectors, subSectorsData.data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            themeTitle,
            isTrending,
            sectors: selectedSectors.map(s => s.value),
            subSectors: selectedSubSectors.map(s => s.value),
            generalComment,
            themeDescription, // Include themeDescription
            overallScore: overallScoreCalc,
            trendingScore,
            impactScore,
            predictiveMomentumScore,
            trendingScoreImage,
            impactScoreImage,
            predictiveMomentumScoreImage,
            tileTemplateId: tileTemplateId ? tileTemplateId.value : null,
        };

        try {
            if (themes.editId) {
                const response = await axios.put(`/api/admin/themes/${themes.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                themesDispatch({ type: 'UPDATE_THEME', payload: response.data });
                handleFormSubmit('Theme updated successfully');
            } else {
                const response = await axios.post('/api/admin/themes', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                themesDispatch({ type: 'ADD_THEME', payload: response.data });
                handleFormSubmit('Theme added successfully');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('An error occurred while submitting the form.');
        }
    };

    const handleSectorChange = (selectedOptions) => {
        setSelectedSectors(selectedOptions || []);
    };

    const handleSubSectorChange = (selectedOptions) => {
        setSelectedSubSectors(selectedOptions || []);
    };

    const handleHomeNav = () => {
        // Clear edit state
        themesDispatch({ type: 'SET_EDIT_ID', payload: null });
        // Hide the form
        setIsFormVisible(false);
        // Navigate to themes list
        navigate('/themes');
    };

    return (
        <div className="theme-form-container">
            <button 
                type="button" 
                className="submit-btn" 
                onClick={handleHomeNav}
                style={{ marginBottom: '20px' }}
            >
                Theme Home
            </button>

            <form onSubmit={handleSubmit} className="theme-form">
                <div className="form-group">
                    <label htmlFor="themeTitle"><b>Theme Title</b> <span style={{color: 'red'}}>*</span></label>
                    <input
                        id="themeTitle"
                        type="text"
                        placeholder="Theme Title"
                        name="themeTitle"
                        value={themeTitle}
                        onChange={(e) => setThemeTitle(e.target.value)}
                        className="theme-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="themeDescription"><b>Theme Description</b> <span style={{color: 'red'}}>*</span></label>
                    <ReactQuill
                        id="themeDescription"
                        value={themeDescription}
                        onChange={setThemeDescription}
                        className="theme-quill-editor"
                    />
                </div>

                <div className="form-group checkbox-group">
                    <label htmlFor="isTrending"><b>Is Trending?</b></label>
                    <input
                        id="isTrending"
                        type="checkbox"
                        checked={isTrending}
                        onChange={(e) => setIsTrending(e.target.checked)}
                        className="theme-checkbox"
                    />
                </div>

                <div className="form-group scores-group">
                    <div className="score-field">
                        <label htmlFor="trendingScore"><b>Trending Score</b></label>
                        <input
                            id="trendingScore"
                            type="number"
                            placeholder="Trending Score"
                            value={trendingScore}
                            onChange={(e) => setTrendingScore(Number(e.target.value))}
                            className="theme-input"
                        />
                    </div>

                    <div className="score-field">
                        <label htmlFor="impactScore"><b>Impact Score</b></label>
                        <input
                            id="impactScore"
                            type="number"
                            placeholder="Impact Score"
                            value={impactScore}
                            onChange={(e) => setImpactScore(Number(e.target.value))}
                            className="theme-input"
                        />
                    </div>

                    <div className="score-field">
                        <label htmlFor="predictiveMomentumScore"><b>Predictive Momentum Score</b></label>
                        <input
                            id="predictiveMomentumScore"
                            type="number"
                            placeholder="Predictive Momentum Score"
                            value={predictiveMomentumScore}
                            onChange={(e) => setPredictiveMomentumScore(Number(e.target.value))}
                            className="theme-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="trendingScoreImage"><b>Trending Score Image URL</b></label>
                    <input
                        id="trendingScoreImage"
                        type="text"
                        placeholder="Trending Score Image URL"
                        value={trendingScoreImage}
                        onChange={(e) => setTrendingScoreImage(e.target.value)}
                        className="theme-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="impactScoreImage"><b>Impact Score Image URL</b></label>
                    <input
                        id="impactScoreImage"
                        type="text"
                        placeholder="Impact Score Image URL"
                        value={impactScoreImage}
                        onChange={(e) => setImpactScoreImage(e.target.value)}
                        className="theme-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="predictiveMomentumScoreImage"><b>Predictive Momentum Score Image URL</b></label>
                    <input
                        id="predictiveMomentumScoreImage"
                        type="text"
                        placeholder="Predictive Momentum Score Image URL"
                        value={predictiveMomentumScoreImage}
                        onChange={(e) => setPredictiveMomentumScoreImage(e.target.value)}
                        className="theme-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sectors"><b>Sectors</b> <span style={{color: 'red'}}>*</span></label>
                    <Select
                        id="sectors"
                        name="sectors"
                        value={selectedSectors}
                        onChange={handleSectorChange}
                        options={sectorOptions}
                        isMulti
                        className="theme-select"
                        required
                        placeholder="Select sectors..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="subSectors"><b>Select Sub-Sectors</b></label>
                    <Select
                        id="subSectors"
                        name="subSectors"
                        value={selectedSubSectors}
                        onChange={handleSubSectorChange}
                        options={subSectorOptions}
                        isMulti
                        className="theme-select"
                        placeholder="Select sub-sectors..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="generalComment"><b>General Comment</b></label>
                    <textarea
                        id="generalComment"
                        placeholder="General Comment"
                        value={generalComment}
                        onChange={(e) => setGeneralComment(e.target.value)}
                        className="theme-textarea"
                    />
                </div>

                <div className="form-group">
                    <label>Tile Template</label>
                    <Select
                        value={tileTemplateId}
                        onChange={setTileTemplateId}
                        options={tileTemplates.map(template => ({ value: template._id, label: template.name, jsxCode: template.jsxCode }))}
                        formatOptionLabel={({ label, jsxCode }) => (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                                <div style={{
                                    minWidth: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        transform: 'scale(0.6)',
                                        transformOrigin: 'center center',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <JsxParser
                                            jsx={jsxCode}
                                            components={{ Tile }}
                                            onError={(error) => console.error('JSX Parser Error:', error)}
                                        />
                                    </div>
                                </div>
                                <span>{label}</span>
                            </div>
                        )}
                        isClearable
                        placeholder="Select a Tile Template"
                        isSearchable={true}
                        filterOption={(option, inputValue) => {
                            const label = option.label || '';
                            const jsxCode = option.data.jsxCode || '';
                            return (
                                label.toLowerCase().includes(inputValue.toLowerCase()) ||
                                jsxCode.toLowerCase().includes(inputValue.toLowerCase())
                            );
                        }}
                    />
                </div>

                <button type="submit" className="submit-btn">Save</button>
            </form>
        </div>
    );
}
