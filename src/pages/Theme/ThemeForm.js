import React, { useContext, useState, useEffect } from 'react';
import ThemeContext from '../../context/ThemeContext';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import '../../html/css/Theme.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

export default function ThemeForm({ handleFormSubmit }) {
    const { themes, themesDispatch, sectors: sectorsData, subSectors: subSectorsData, setIsFormVisible, isFormVisible } = useContext(ThemeContext);
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

    useEffect(() => {
        if (themes.editId) {
            const theme = themes.data.find((ele) => ele._id === themes.editId);
            if (theme) {
                setThemeTitle(theme.themeTitle);
                setIsTrending(theme.isTrending);
                setSelectedSectors(theme.sectors || []);
                setSelectedSubSectors(theme.subSectors || []);
                setGeneralComment(theme.generalComment);
                setThemeDescription(theme.themeDescription || ''); // Set themeDescription
                setTrendingScore(theme.trendingScore || 0);
                setImpactScore(theme.impactScore || 0);
                setPredictiveMomentumScore(theme.predictiveMomentumScore || 0);
                setTrendingScoreImage(theme.trendingScoreImage || '');
                setImpactScoreImage(theme.impactScoreImage || '');
                setPredictiveMomentumScoreImage(theme.predictiveMomentumScoreImage || '');

                // Filter sub-sectors based on selected sectors for edit
                if (subSectorsData.data && theme.sectors) {
                    const filtered = subSectorsData.data.filter(subSector => theme.sectors.includes(subSector.sectorId));
                    setFilteredSubSectors(filtered);
                }
            }
        } else {
            setThemeTitle('');
            setIsTrending(false);
            setSelectedSectors([]);
            setSelectedSubSectors([]);
            setGeneralComment('');
            setThemeDescription(''); // Reset themeDescription
            setFilteredSubSectors([]);
            setTrendingScore(0);
            setImpactScore(0);
            setPredictiveMomentumScore(0);
            setTrendingScoreImage('');
            setImpactScoreImage('');
            setPredictiveMomentumScoreImage('');
        }
    }, [themes.editId, themes.data, subSectorsData.data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            themeTitle,
            isTrending,
            sectors: selectedSectors,
            subSectors: selectedSubSectors,
            generalComment,
            themeDescription, // Include themeDescription
            overallScore: overallScoreCalc,
            trendingScore,
            impactScore,
            predictiveMomentumScore,
            trendingScoreImage,
            impactScoreImage,
            predictiveMomentumScoreImage
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

    const handleSectorChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedSectors(selectedOptions);

        // Filter sub-sectors based on selected sectors
        if (subSectorsData.data) {
            const filtered = subSectorsData.data.filter(subSector => selectedOptions.includes(subSector.sectorId));
            setFilteredSubSectors(filtered);
        }
    };

    const handleSubSectorChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedSubSectors(selectedOptions);
    };

    const handleHomeNav = () => {
        setIsFormVisible(false);
    };

    return (
        <div className="theme-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Theme Home</button>

            <form onSubmit={handleSubmit} className="theme-form">
                <div className="form-group">
                    <label htmlFor="themeTitle"><b>Theme Title</b></label>
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
                    <label htmlFor="themeDescription"><b>Theme Description</b></label>
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
                    <label htmlFor="sectors"><b>Select Sectors</b></label>
                    <select
                        id="sectors"
                        multiple
                        value={selectedSectors}
                        onChange={handleSectorChange}
                        className="theme-select"
                    >
                        {sectorsData.data.map((sector) => (
                            <option key={sector._id} value={sector._id}>
                                {sector.sectorName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="subSectors"><b>Select Sub-Sectors</b></label>
                    <select
                        id="subSectors"
                        multiple
                        value={selectedSubSectors}
                        onChange={handleSubSectorChange}
                        className="theme-select"
                    >
                        {filteredSubSectors.map((subSector) => (
                            <option key={subSector._id} value={subSector._id}>
                                {subSector.subSectorName}
                            </option>
                        ))}
                    </select>
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

                <button type="submit" className="submit-btn">Save</button>
            </form>
        </div>
    );
}
