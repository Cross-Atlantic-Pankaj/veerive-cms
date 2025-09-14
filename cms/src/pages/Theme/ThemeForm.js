import React, { useContext, useState, useEffect } from 'react';
import ThemeContext from '../../context/ThemeContext';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import styles from '../../html/css/Theme.module.css';
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
    const [themeDescription, setThemeDescription] = useState(''); // New state
    const [teaser, setTeaser] = useState('');
    const [methodology, setMethodology] = useState('');
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

    // New: Drivers, Images and Regions datasets for dropdowns
    const [drivers, setDrivers] = useState([]);
    const [images, setImages] = useState([]);
    const [regions, setRegions] = useState([]);

    // New: Complex nested state per updated theme-model.js
    const [overviewSnapshot, setOverviewSnapshot] = useState({
        executiveSummary: {
            executiveSummaryIcon: '',
            trendSignificance: { content: '' },
            potentialChallenges: { content: '' },
        },
        marketMetrics: [], // { icon, value, text }
    });

    const [trendAnalysis, setTrendAnalysis] = useState({
        driversAndSignals: {
            keyDrivers: [], // { icon, driverType, driverTitle, description }
            signalsInAction: [], // { logo, title, description, initiative:{description}, strategicImperative:{description} }
        },
        impactAndOpinions: {
            title: { content: '', explanation: '' },
            disruptivePotential: {
                highLowContainer: { icon: '', impactArea: '', impactRating: '' },
                content: '',
                value: '',
            },
            trendMomentum: {
                highLowContainer: { icon: '', impactArea: '', impactRating: '' },
                content: '',
                value: '',
            },
        },
        regionalDynamics: {
            heatMapChartSection: [], // { nameOfRegion, values }
            regionalInsights: {
                overallSummary: '',
                regions: [], // { regionMapIcon, regionName, regionDescription }
            },
        },
        consumerDynamics: {
            behavioralInsights: [], // { heading, icon, text }
            impactAnalyser: [], // { consumerSegmentName, impactScore }
        },
    });

    // Helper: fetch datasets
    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const [driversRes, imagesRes, regionsRes] = await Promise.allSettled([
                    axios.get('/api/admin/drivers', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
                    axios.get('/api/admin/images', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
                    axios.get('/api/admin/regions', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
                ]);

                // Drivers
                if (driversRes.status === 'fulfilled') {
                    const d = driversRes.value?.data;
                    if (Array.isArray(d)) setDrivers(d);
                    else if (d?.success) setDrivers(d.data || []);
                } else {
                    console.warn('[ThemeForm] Drivers fetch failed (ignored):', driversRes.reason?.message || driversRes.reason);
                }

                // Images
                if (imagesRes.status === 'fulfilled') {
                    const im = imagesRes.value?.data;
                    if (Array.isArray(im)) setImages(im);
                    else if (im?.success) setImages(im.data || []);
                } else {
                    console.warn('[ThemeForm] Images fetch failed (ignored):', imagesRes.reason?.message || imagesRes.reason);
                }

                // Regions (admin)
                let regionsPayload = [];
                if (regionsRes.status === 'fulfilled') {
                    const rg = regionsRes.value?.data;
                    regionsPayload = Array.isArray(rg) ? rg : (rg?.data || []);
                } else {
                    console.warn('[ThemeForm] Admin regions fetch failed, falling back:', regionsRes.reason?.message || regionsRes.reason);
                }

                // Fallback to non-admin route if needed
                if (!Array.isArray(regionsPayload) || regionsPayload.length === 0) {
                    try {
                        const fallback = await axios.get('/api/regions', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                        const fb = fallback.data?.data || fallback.data;
                        if (Array.isArray(fb)) regionsPayload = fb;
                    } catch (err) {
                        console.warn('[ThemeForm] Fallback regions fetch failed:', err?.message || err);
                    }
                }

                if (Array.isArray(regionsPayload)) {
                    setRegions(regionsPayload);
                    try { window.__regions = regionsPayload; } catch (e) {}
                    console.log('[ThemeForm] Regions loaded:', regionsPayload.length, regionsPayload.map(r => r.regionName));
                } else {
                    console.warn('Regions payload not an array:', regionsPayload);
                }
            } catch (e) {
                console.error('Failed to fetch datasets', e);
            }
        };
        fetchDatasets();
    }, []);

    // Local Image selector (dropdown only)
    const ImageSelector = ({ label, value, onChange }) => {
        const options = (images || []).map(img => ({ value: img.imageLink, label: img.imageTitle }));
        const selected = options.find(opt => opt.value === value) || (value ? { value, label: value } : null);

        return (
            <div className="form-group">
                <label><b>{label}</b></label>
                <Select
                    value={selected}
                    onChange={(opt) => onChange(opt ? opt.value : '')}
                    options={options}
                    formatOptionLabel={({ label, value }) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                                src={value} 
                                alt={label} 
                                style={{ 
                                    width: 30, 
                                    height: 30, 
                                    objectFit: 'contain',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }} 
                            />
                            <span>{label}</span>
                        </div>
                    )}
                    isClearable
                    placeholder="Select from image library..."
                    className="theme-select"
                />
            </div>
        );
    };

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
                setThemeDescription(theme.themeDescription || '');
                setTeaser(theme.teaser || '');
                setMethodology(theme.methodology || '');
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

                // Prefill complex sections
                setOverviewSnapshot({
                    executiveSummary: {
                        executiveSummaryIcon: theme?.overviewSnapshot?.executiveSummary?.executiveSummaryIcon || '',
                        trendSignificance: { content: theme?.overviewSnapshot?.executiveSummary?.trendSignificance?.content || '' },
                        potentialChallenges: { content: theme?.overviewSnapshot?.executiveSummary?.potentialChallenges?.content || '' },
                    },
                    marketMetrics: Array.isArray(theme?.overviewSnapshot?.marketMetrics) ? theme.overviewSnapshot.marketMetrics.map(mm => ({
                        icon: mm.icon || '',
                        value: mm.value || '',
                        text: mm.text || '',
                    })) : [],
                });

                setTrendAnalysis({
                    driversAndSignals: {
                        keyDrivers: Array.isArray(theme?.trendAnalysis?.driversAndSignals?.keyDrivers) ? theme.trendAnalysis.driversAndSignals.keyDrivers.map(kd => ({
                            icon: kd.icon || '',
                            driverType: kd.driverType || null,
                            driverTitle: kd.driverTitle || '',
                            description: kd.description || '',
                        })) : [],
                        signalsInAction: Array.isArray(theme?.trendAnalysis?.driversAndSignals?.signalsInAction) ? theme.trendAnalysis.driversAndSignals.signalsInAction.map(sa => ({
                            logo: sa.logo || '',
                            title: sa.title || '',
                            description: sa.description || '',
                            initiative: { description: sa?.initiative?.description || '' },
                            strategicImperative: { description: sa?.strategicImperative?.description || '' },
                        })) : [],
                    },
                    impactAndOpinions: {
                        title: {
                            content: theme?.trendAnalysis?.impactAndOpinions?.title?.content || '',
                            explanation: theme?.trendAnalysis?.impactAndOpinions?.title?.explanation || '',
                        },
                        disruptivePotential: {
                            highLowContainer: {
                                icon: theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.highLowContainer?.icon || '',
                                impactArea: theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.highLowContainer?.impactArea || '',
                                impactRating: theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.highLowContainer?.impactRating || '',
                            },
                            content: theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.content || '',
                            value: theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.value || '',
                        },
                        trendMomentum: {
                            highLowContainer: {
                                icon: theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.highLowContainer?.icon || '',
                                impactArea: theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.highLowContainer?.impactArea || '',
                                impactRating: theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.highLowContainer?.impactRating || '',
                            },
                            content: theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.content || '',
                            value: theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.value || '',
                        },
                    },
                    regionalDynamics: {
                        heatMapChartSection: Array.isArray(theme?.trendAnalysis?.regionalDynamics?.heatMapChartSection) ? theme.trendAnalysis.regionalDynamics.heatMapChartSection.map(hm => ({
                            nameOfRegion: hm.nameOfRegion || '',
                            values: typeof hm.values === 'number' ? hm.values : 0,
                        })) : [],
                        regionalInsights: {
                            overallSummary: theme?.trendAnalysis?.regionalDynamics?.regionalInsights?.overallSummary || '',
                            regions: Array.isArray(theme?.trendAnalysis?.regionalDynamics?.regionalInsights?.regions) ? theme.trendAnalysis.regionalDynamics.regionalInsights.regions.map(r => ({
                                regionMapIcon: r.regionMapIcon || '',
                                regionName: r.regionName || '',
                                regionDescription: r.regionDescription || '',
                            })) : [],
                        },
                    },
                    consumerDynamics: {
                        behavioralInsights: Array.isArray(theme?.trendAnalysis?.consumerDynamics?.behavioralInsights) ? theme.trendAnalysis.consumerDynamics.behavioralInsights.map(b => ({
                            heading: b.heading || '',
                            icon: b.icon || '',
                            text: b.text || '',
                        })) : [],
                        impactAnalyser: Array.isArray(theme?.trendAnalysis?.consumerDynamics?.impactAnalyser) ? theme.trendAnalysis.consumerDynamics.impactAnalyser.map(i => ({
                            consumerSegmentName: i.consumerSegmentName || '',
                            impactScore: typeof i.impactScore === 'number' ? i.impactScore : 0,
                        })) : [],
                    },
                });
            } else {
                console.error("Theme not found with ID:", themes.editId);
            }
        } else if (!themes.editId) {
            // Reset form for new theme
            setThemeTitle('');
            setIsTrending(false);
            setSelectedSectors([]);
            setSelectedSubSectors([]);
            setThemeDescription('');
            setTeaser('');
            setMethodology('');
            setFilteredSubSectors([]);
            setTrendingScore(0);
            setImpactScore(0);
            setPredictiveMomentumScore(0);
            setTrendingScoreImage('');
            setImpactScoreImage('');
            setPredictiveMomentumScoreImage('');
            setTileTemplateId(null);

            setOverviewSnapshot({
                executiveSummary: {
                    executiveSummaryIcon: '',
                    trendSignificance: { content: '' },
                    potentialChallenges: { content: '' },
                },
                marketMetrics: [],
            });
            setTrendAnalysis({
                driversAndSignals: { keyDrivers: [], signalsInAction: [] },
                impactAndOpinions: {
                    title: { content: '', explanation: '' },
                    disruptivePotential: { highLowContainer: { icon: '', impactArea: '', impactRating: '' }, content: '', value: '' },
                    trendMomentum: { highLowContainer: { icon: '', impactArea: '', impactRating: '' }, content: '', value: '' },
                },
                regionalDynamics: {
                    heatMapChartSection: [],
                    regionalInsights: { overallSummary: '', regions: [] },
                },
                consumerDynamics: { behavioralInsights: [], impactAnalyser: [] },
            });
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
            themeDescription, // Include themeDescription
            teaser,
            methodology,
            overallScore: overallScoreCalc,
            trendingScore,
            impactScore,
            predictiveMomentumScore,
            trendingScoreImage,
            impactScoreImage,
            predictiveMomentumScoreImage,
            tileTemplateId: tileTemplateId ? tileTemplateId.value : null,
            overviewSnapshot,
            trendAnalysis,
        };

        try {
            if (themes.editId) {
                const response = await axios.put(`/api/admin/themes/${themes.editId}`, formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                themesDispatch({ type: 'UPDATE_THEME', payload: response.data });
                handleFormSubmit('Theme updated successfully');
            } else {
                const response = await axios.post('/api/admin/themes', formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
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
        <div className={styles.companyFormContainer}>
            <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={handleHomeNav}>
                ← Back to Themes
            </button>
            <h2>{themes.editId ? 'Edit Theme' : 'Add Theme'}</h2>

            <form onSubmit={handleSubmit} className={styles.companyForm}>
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
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                            ]
                        }}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="teaser"><b>Teaser</b></label>
                    <ReactQuill
                        id="teaser"
                        value={teaser}
                        onChange={setTeaser}
                        className="theme-quill-editor"
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                            ]
                        }}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="methodology"><b>Methodology</b></label>
                    <ReactQuill
                        id="methodology"
                        value={methodology}
                        onChange={setMethodology}
                        className="theme-quill-editor"
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                            ]
                        }}
                    />
                </div>

                {/* Overview / Snapshot Section */}
                <div style={{ 
                    marginTop: 32, 
                    border: '2px solid #e1e5e9', 
                    borderRadius: 8, 
                    padding: 0,
                    backgroundColor: '#f8f9fa'
                }}>
                    <details style={{ margin: 0 }}>
                        <summary style={{ 
                            cursor: 'pointer', 
                            fontWeight: 700, 
                            padding: '16px 20px', 
                            backgroundColor: '#4F46E5',
                            color: 'white',
                            fontSize: '1.1rem',
                            borderRadius: '6px 6px 0 0',
                            border: 'none',
                            outline: 'none'
                        }}>
                            📊 Overview / Snapshot
                        </summary>
                        <div style={{ padding: '20px', backgroundColor: 'white' }}>
                            <div style={{ marginBottom: 24 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1rem'
                                    }}>
                                        Executive Summary
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                <ImageSelector
                                    label="Executive Summary Icon"
                                    value={overviewSnapshot.executiveSummary.executiveSummaryIcon}
                                    onChange={(url) => setOverviewSnapshot(prev => ({
                                        ...prev,
                                        executiveSummary: { ...prev.executiveSummary, executiveSummaryIcon: url }
                                    }))}
                                />
                                <div className="form-group">
                                    <label><b>Trend Significance</b></label>
                                    <ReactQuill
                                        value={overviewSnapshot.executiveSummary.trendSignificance.content}
                                        onChange={(val) => setOverviewSnapshot(prev => ({
                                            ...prev,
                                            executiveSummary: { ...prev.executiveSummary, trendSignificance: { content: val } }
                                        }))}
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline'],
                                                [{ 'color': [] }, { 'background': [] }],
                                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                ['link'],
                                                ['clean']
                                            ]
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><b>Potential Challenges</b></label>
                                    <ReactQuill
                                        value={overviewSnapshot.executiveSummary.potentialChallenges.content}
                                        onChange={(val) => setOverviewSnapshot(prev => ({
                                            ...prev,
                                            executiveSummary: { ...prev.executiveSummary, potentialChallenges: { content: val } }
                                        }))}
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline'],
                                                [{ 'color': [] }, { 'background': [] }],
                                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                ['link'],
                                                ['clean']
                                            ]
                                        }}
                                    />
                                </div>
                                    </div>
                                </details>
                            </div>

                            {/* Market Metrics (max 4) */}
                            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1rem'
                                    }}>
                                        Market Metrics (up to 4)
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                {overviewSnapshot.marketMetrics.map((mm, idx) => (
                                    <div key={idx} style={{ 
                                        border: '1px solid #d1d5db', 
                                        padding: 16, 
                                        marginBottom: 12, 
                                        borderRadius: 6,
                                        backgroundColor: '#f9fafb'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <h5 style={{ margin: 0, color: '#6b7280' }}>Metric #{idx + 1}</h5>
                                            <button 
                                                type="button" 
                                                className={styles.cancelBtn} 
                                                onClick={() => setOverviewSnapshot(prev => ({
                                                    ...prev,
                                                    marketMetrics: prev.marketMetrics.filter((_, i) => i !== idx)
                                                }))}
                                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <ImageSelector
                                            label={`Icon #${idx + 1}`}
                                            value={mm.icon}
                                            onChange={(url) => setOverviewSnapshot(prev => ({
                                                ...prev,
                                                marketMetrics: prev.marketMetrics.map((m, i) => i === idx ? { ...m, icon: url } : m)
                                            }))}
                                        />
                                        <div className="form-group">
                                            <label><b>Value</b></label>
                                            <input
                                                type="text"
                                                className="theme-input"
                                                value={mm.value}
                                                onChange={(e) => setOverviewSnapshot(prev => ({
                                                    ...prev,
                                                    marketMetrics: prev.marketMetrics.map((m, i) => i === idx ? { ...m, value: e.target.value } : m)
                                                }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><b>Text</b></label>
                                            <ReactQuill
                                                value={mm.text}
                                                onChange={(val) => setOverviewSnapshot(prev => ({
                                                    ...prev,
                                                    marketMetrics: prev.marketMetrics.map((m, i) => i === idx ? { ...m, text: val } : m)
                                                }))}
                                                modules={{
                                                    toolbar: [
                                                        [{ 'header': [1, 2, 3, false] }],
                                                        ['bold', 'italic', 'underline'],
                                                        [{ 'color': [] }, { 'background': [] }],
                                                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                        ['link'],
                                                        ['clean']
                                                    ]
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={() => setOverviewSnapshot(prev => ({ ...prev, marketMetrics: [...prev.marketMetrics, { icon: '', value: '', text: '' }] }))}
                                    disabled={overviewSnapshot.marketMetrics.length >= 4}
                                    style={{ marginTop: 8 }}
                                >
                                    + Add Market Metric
                                </button>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </details>
                </div>

                {/* Trend Analysis Section */}
                <div style={{ 
                    marginTop: 32, 
                    border: '2px solid #e1e5e9', 
                    borderRadius: 8, 
                    padding: 0,
                    backgroundColor: '#f8f9fa'
                }}>
                    <details style={{ margin: 0 }}>
                        <summary style={{ 
                            cursor: 'pointer', 
                            fontWeight: 700, 
                            padding: '16px 20px', 
                            backgroundColor: '#059669',
                            color: 'white',
                            fontSize: '1.1rem',
                            borderRadius: '6px 6px 0 0',
                            border: 'none',
                            outline: 'none'
                        }}>
                            📈 Trend Analysis
                        </summary>
                        <div style={{ padding: '20px', backgroundColor: 'white' }}>
                            
                            {/* 1. Drivers and Signals */}
                            <div style={{ marginBottom: 32 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1.1rem', 
                                        borderBottom: '2px solid #e5e7eb', 
                                        paddingBottom: 8 
                                    }}>
                                        🚀 1. Drivers and Signals
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                
                                {/* Key Drivers */}
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Key Drivers (up to 8)
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        {trendAnalysis.driversAndSignals.keyDrivers.map((kd, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Driver #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.filter((_, i) => i !== idx) }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <ImageSelector
                                                    label={`Icon #${idx + 1}`}
                                                    value={kd.icon}
                                                    onChange={(url) => setTrendAnalysis(prev => ({
                                                        ...prev,
                                                        driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.map((k, i) => i === idx ? { ...k, icon: url } : k) }
                                                    }))}
                                                />
                                                <div className="form-group">
                                                    <label><b>Driver Type</b></label>
                                                    <Select
                                                        value={kd.driverType ? { value: kd.driverType, label: (drivers.find(d => String(d._id) === String(kd.driverType))?.driverName) || 'Selected' } : null}
                                                        onChange={(opt) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.map((k, i) => i === idx ? { ...k, driverType: opt ? opt.value : null } : k) }
                                                        }))}
                                                        options={(drivers || []).map(d => ({ value: d._id, label: d.driverName }))}
                                                        isClearable
                                                        placeholder="Select driver type..."
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Driver Title</b></label>
                                                    <input
                                                        type="text"
                                                        className="theme-input"
                                                        value={kd.driverTitle}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.map((k, i) => i === idx ? { ...k, driverTitle: e.target.value } : k) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Description</b></label>
                                                    <ReactQuill
                                                        value={kd.description}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.map((k, i) => i === idx ? { ...k, description: val } : k) }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className={styles.primaryButton}
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, driversAndSignals: { ...prev.driversAndSignals, keyDrivers: [...prev.driversAndSignals.keyDrivers, { icon: '', driverType: null, driverTitle: '', description: '' }] } }))}
                                            disabled={trendAnalysis.driversAndSignals.keyDrivers.length >= 8}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Key Driver
                                        </button>
                                    </div>
                                </details>

                                {/* Signals in Action */}
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Signals in Action (up to 8)
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        {trendAnalysis.driversAndSignals.signalsInAction.map((sa, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Signal #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.filter((_, i) => i !== idx) }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <ImageSelector
                                                    label={`Logo #${idx + 1}`}
                                                    value={sa.logo}
                                                    onChange={(url) => setTrendAnalysis(prev => ({
                                                        ...prev,
                                                        driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, logo: url } : s) }
                                                    }))}
                                                />
                                                <div className="form-group">
                                                    <label><b>Title</b></label>
                                                    <input
                                                        type="text"
                                                        className="theme-input"
                                                        value={sa.title}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, title: e.target.value } : s) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Description</b></label>
                                                    <ReactQuill
                                                        value={sa.description}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, description: val } : s) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Initiative - Description</b></label>
                                                    <ReactQuill
                                                        value={sa.initiative?.description || ''}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, initiative: { description: val } } : s) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Strategic Imperative - Description</b></label>
                                                    <ReactQuill
                                                        value={sa.strategicImperative?.description || ''}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, strategicImperative: { description: val } } : s) }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className={styles.primaryButton}
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, driversAndSignals: { ...prev.driversAndSignals, signalsInAction: [...prev.driversAndSignals.signalsInAction, { logo: '', title: '', description: '', initiative: { description: '' }, strategicImperative: { description: '' } }] } }))}
                                            disabled={trendAnalysis.driversAndSignals.signalsInAction.length >= 8}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Signal
                                        </button>
                                    </div>
                                </details>
                                    </div>
                                </details>
                            </div>

                            {/* 2. Impact and Opinions */}
                            <div style={{ marginBottom: 32 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1.1rem', 
                                        borderBottom: '2px solid #e5e7eb', 
                                        paddingBottom: 8 
                                    }}>
                                        💡 2. Impact and Opinions
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                <div className="form-group">
                                    <label><b>Title</b></label>
                                    <input
                                        type="text"
                                        className="theme-input"
                                        value={trendAnalysis.impactAndOpinions.title.content}
                                        onChange={(e) => setTrendAnalysis(prev => ({
                                            ...prev,
                                            impactAndOpinions: { ...prev.impactAndOpinions, title: { ...prev.impactAndOpinions.title, content: e.target.value } }
                                        }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><b>Explanation</b></label>
                                    <ReactQuill
                                        value={trendAnalysis.impactAndOpinions.title.explanation}
                                        onChange={(val) => setTrendAnalysis(prev => ({
                                            ...prev,
                                            impactAndOpinions: { ...prev.impactAndOpinions, title: { ...prev.impactAndOpinions.title, explanation: val } }
                                        }))}
                                    />
                                </div>

                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Disruptive Potential
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        <ImageSelector
                                            label="Icon"
                                            value={trendAnalysis.impactAndOpinions.disruptivePotential.highLowContainer.icon}
                                            onChange={(url) => setTrendAnalysis(prev => ({
                                                ...prev,
                                                impactAndOpinions: { ...prev.impactAndOpinions, disruptivePotential: { ...prev.impactAndOpinions.disruptivePotential, highLowContainer: { ...prev.impactAndOpinions.disruptivePotential.highLowContainer, icon: url } } }
                                            }))}
                                        />
                                        <div className="form-group">
                                            <label><b>Impact Area</b></label>
                                            <input
                                                type="text"
                                                className="theme-input"
                                                value={trendAnalysis.impactAndOpinions.disruptivePotential.highLowContainer.impactArea}
                                                onChange={(e) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, disruptivePotential: { ...prev.impactAndOpinions.disruptivePotential, highLowContainer: { ...prev.impactAndOpinions.disruptivePotential.highLowContainer, impactArea: e.target.value } } }
                                                }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><b>Impact Rating</b></label>
                                            <input
                                                type="text"
                                                className="theme-input"
                                                value={trendAnalysis.impactAndOpinions.disruptivePotential.highLowContainer.impactRating}
                                                onChange={(e) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, disruptivePotential: { ...prev.impactAndOpinions.disruptivePotential, highLowContainer: { ...prev.impactAndOpinions.disruptivePotential.highLowContainer, impactRating: e.target.value } } }
                                                }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><b>Content</b></label>
                                            <ReactQuill
                                                value={trendAnalysis.impactAndOpinions.disruptivePotential.content}
                                                onChange={(val) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, disruptivePotential: { ...prev.impactAndOpinions.disruptivePotential, content: val } }
                                                }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><b>Value</b></label>
                                            <input
                                                type="text"
                                                className="theme-input"
                                                value={trendAnalysis.impactAndOpinions.disruptivePotential.value}
                                                onChange={(e) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, disruptivePotential: { ...prev.impactAndOpinions.disruptivePotential, value: e.target.value } }
                                                }))}
                                                placeholder="Enter value for disruptive potential"
                                            />
                                        </div>
                                    </div>
                                </details>

                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Trend Momentum
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        <ImageSelector
                                            label="Icon"
                                            value={trendAnalysis.impactAndOpinions.trendMomentum.highLowContainer.icon}
                                            onChange={(url) => setTrendAnalysis(prev => ({
                                                ...prev,
                                                impactAndOpinions: { ...prev.impactAndOpinions, trendMomentum: { ...prev.impactAndOpinions.trendMomentum, highLowContainer: { ...prev.impactAndOpinions.trendMomentum.highLowContainer, icon: url } } }
                                            }))}
                                        />
                                        <div className="form-group">
                                            <label><b>Impact Area</b></label>
                                            <input
                                                type="text"
                                                className="theme-input"
                                                value={trendAnalysis.impactAndOpinions.trendMomentum.highLowContainer.impactArea}
                                                onChange={(e) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, trendMomentum: { ...prev.impactAndOpinions.trendMomentum, highLowContainer: { ...prev.impactAndOpinions.trendMomentum.highLowContainer, impactArea: e.target.value } } }
                                                }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><b>Impact Rating</b></label>
                                            <input
                                                type="text"
                                                className="theme-input"
                                                value={trendAnalysis.impactAndOpinions.trendMomentum.highLowContainer.impactRating}
                                                onChange={(e) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, trendMomentum: { ...prev.impactAndOpinions.trendMomentum, highLowContainer: { ...prev.impactAndOpinions.trendMomentum.highLowContainer, impactRating: e.target.value } } }
                                                }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><b>Content</b></label>
                                            <ReactQuill
                                                value={trendAnalysis.impactAndOpinions.trendMomentum.content}
                                                onChange={(val) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, trendMomentum: { ...prev.impactAndOpinions.trendMomentum, content: val } }
                                                }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><b>Value</b></label>
                                            <input
                                                type="text"
                                                className="theme-input"
                                                value={trendAnalysis.impactAndOpinions.trendMomentum.value}
                                                onChange={(e) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, trendMomentum: { ...prev.impactAndOpinions.trendMomentum, value: e.target.value } }
                                                }))}
                                                placeholder="Enter value for trend momentum"
                                            />
                                        </div>
                                    </div>
                                </details>
                                    </div>
                                </details>
                            </div>

                            {/* 3. Regional Dynamics */}
                            <div style={{ marginBottom: 32 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1.1rem', 
                                        borderBottom: '2px solid #e5e7eb', 
                                        paddingBottom: 8 
                                    }}>
                                        🌍 3. Regional Dynamics
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        HeatMap Chart Datasets
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        {trendAnalysis.regionalDynamics.heatMapChartSection.map((hm, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Dataset #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            regionalDynamics: { ...prev.regionalDynamics, heatMapChartSection: prev.regionalDynamics.heatMapChartSection.filter((_, i) => i !== idx) }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Region Name</b></label>
                                                    <input
                                                        type="text"
                                                        className="theme-input"
                                                        value={hm.nameOfRegion}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            regionalDynamics: { ...prev.regionalDynamics, heatMapChartSection: prev.regionalDynamics.heatMapChartSection.map((h, i) => i === idx ? { ...h, nameOfRegion: e.target.value } : h) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Values</b></label>
                                                    <input
                                                        type="number"
                                                        className="theme-input"
                                                        value={hm.values}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            regionalDynamics: { ...prev.regionalDynamics, heatMapChartSection: prev.regionalDynamics.heatMapChartSection.map((h, i) => i === idx ? { ...h, values: Number(e.target.value) } : h) }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            className={styles.primaryButton} 
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, regionalDynamics: { ...prev.regionalDynamics, heatMapChartSection: [...prev.regionalDynamics.heatMapChartSection, { nameOfRegion: '', values: 0 }] } }))}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Dataset
                                        </button>
                                    </div>
                                </details>

                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Regional Insights
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        <div className="form-group">
                                            <label><b>Overall Summary</b></label>
                                            <ReactQuill
                                                value={trendAnalysis.regionalDynamics.regionalInsights.overallSummary}
                                                onChange={(val) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    regionalDynamics: { ...prev.regionalDynamics, regionalInsights: { ...prev.regionalDynamics.regionalInsights, overallSummary: val } }
                                                }))}
                                            />
                                        </div>
                                        {trendAnalysis.regionalDynamics.regionalInsights.regions.map((r, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Region #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            regionalDynamics: { ...prev.regionalDynamics, regionalInsights: { ...prev.regionalDynamics.regionalInsights, regions: prev.regionalDynamics.regionalInsights.regions.filter((_, i) => i !== idx) } }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Select Region</b></label>
                                                    <Select
                                                        onMenuOpen={() => {
                                                            console.log('[ThemeForm] Region select opened. Regions count:', regions.length);
                                                            console.log('[ThemeForm] First 5 regions:', regions.slice(0,5));
                                                        }}
                                                        value={r.regionId ? { value: r.regionId, label: (regions.find(reg => String(reg._id) === String(r.regionId))?.regionName) || 'Selected Region' } : null}
                                                        onChange={(opt) => {
                                                            const selectedRegion = regions.find(reg => String(reg._id) === String(opt?.value));
                                                            console.log('[ThemeForm] Region selected:', opt, 'resolved:', selectedRegion);
                                                            setTrendAnalysis(prev => ({
                                                                ...prev,
                                                                regionalDynamics: { 
                                                                    ...prev.regionalDynamics, 
                                                                    regionalInsights: { 
                                                                        ...prev.regionalDynamics.regionalInsights, 
                                                                        regions: prev.regionalDynamics.regionalInsights.regions.map((x, i) => i === idx ? { 
                                                                            ...x, 
                                                                            regionId: opt ? opt.value : null,
                                                                            regionMapIcon: selectedRegion?.regionIcon || '',
                                                                            regionName: selectedRegion?.regionName || '',
                                                                            regionDescription: selectedRegion?.regionDescription || ''
                                                                        } : x) 
                                                                    } 
                                                                } 
                                                            }));
                                                        }}
                                                        options={(regions || []).map(reg => ({ value: reg._id, label: reg.regionName }))}
                                                        isClearable
                                                        placeholder="Select a region..."
                                                    />
                                                </div>
                                                {r.regionMapIcon && (
                                                    <div className="form-group">
                                                        <label><b>Region Icon</b></label>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <img src={r.regionMapIcon} alt={r.regionName} style={{ width: 40, height: 40, objectFit: 'contain', border: '1px solid #ddd', borderRadius: 4 }} />
                                                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Fetched from region</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {r.regionName && (
                                                    <div className="form-group">
                                                        <label><b>Region Name</b></label>
                                                        <input
                                                            type="text"
                                                            className="theme-input"
                                                            value={r.regionName}
                                                            readOnly
                                                            style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
                                                        />
                                                    </div>
                                                )}
                                                {r.regionDescription && (
                                                    <div className="form-group">
                                                        <label><b>Region Description</b></label>
                                                        <div 
                                                            style={{ 
                                                                border: '1px solid #d1d5db', 
                                                                borderRadius: 4, 
                                                                padding: 12, 
                                                                backgroundColor: '#f9fafb',
                                                                color: '#6b7280',
                                                                minHeight: 60
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: r.regionDescription }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            className={styles.primaryButton} 
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, regionalDynamics: { ...prev.regionalDynamics, regionalInsights: { ...prev.regionalDynamics.regionalInsights, regions: [...prev.regionalDynamics.regionalInsights.regions, { regionMapIcon: '', regionName: '', regionDescription: '' }] } } }))}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Region
                                        </button>
                                    </div>
                                </details>
                                    </div>
                                </details>
                            </div>

                            {/* 4. Consumer Dynamics */}
                            <div style={{ marginBottom: 32 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1.1rem', 
                                        borderBottom: '2px solid #e5e7eb', 
                                        paddingBottom: 8 
                                    }}>
                                        👥 4. Consumer Dynamics
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Behavioral Insights
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        {trendAnalysis.consumerDynamics.behavioralInsights.map((b, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Insight #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: prev.consumerDynamics.behavioralInsights.filter((_, i) => i !== idx) }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Heading</b></label>
                                                    <ReactQuill
                                                        value={b.heading}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: prev.consumerDynamics.behavioralInsights.map((x, i) => i === idx ? { ...x, heading: val } : x) }
                                                        }))}
                                                    />
                                                </div>
                                                <ImageSelector
                                                    label={`Icon #${idx + 1}`}
                                                    value={b.icon}
                                                    onChange={(url) => setTrendAnalysis(prev => ({
                                                        ...prev,
                                                        consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: prev.consumerDynamics.behavioralInsights.map((x, i) => i === idx ? { ...x, icon: url } : x) }
                                                    }))}
                                                />
                                                <div className="form-group">
                                                    <label><b>Text</b></label>
                                                    <ReactQuill
                                                        value={b.text}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: prev.consumerDynamics.behavioralInsights.map((x, i) => i === idx ? { ...x, text: val } : x) }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            className={styles.primaryButton} 
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: [...prev.consumerDynamics.behavioralInsights, { heading: '', icon: '', text: '' }] } }))}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Insight
                                        </button>
                                    </div>
                                </details>

                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Impact Analyser
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        {trendAnalysis.consumerDynamics.impactAnalyser.map((i, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Segment #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { ...prev.consumerDynamics, impactAnalyser: prev.consumerDynamics.impactAnalyser.filter((_, i) => i !== idx) }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Consumer Segment Name</b></label>
                                                    <input
                                                        type="text"
                                                        className="theme-input"
                                                        value={i.consumerSegmentName}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { ...prev.consumerDynamics, impactAnalyser: prev.consumerDynamics.impactAnalyser.map((x, ix) => ix === idx ? { ...x, consumerSegmentName: e.target.value } : x) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Impact Score (%)</b></label>
                                                    <input
                                                        type="number"
                                                        className="theme-input"
                                                        value={i.impactScore}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { ...prev.consumerDynamics, impactAnalyser: prev.consumerDynamics.impactAnalyser.map((x, ix) => ix === idx ? { ...x, impactScore: Number(e.target.value) } : x) }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            className={styles.primaryButton} 
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, consumerDynamics: { ...prev.consumerDynamics, impactAnalyser: [...prev.consumerDynamics.impactAnalyser, { consumerSegmentName: '', impactScore: 0 }] } }))}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Segment
                                        </button>
                                    </div>
                                </details>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </details>
                </div>

                <div className="form-group checkbox-group">
                    <label htmlFor="isTrending"><b>Is Trending?</b></label>
                    <input name="checkboxField" id="isTrending"
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
                    <input name="trendingscoreimageurl" id="trendingScoreImage"
                        type="text"
                        placeholder="Trending Score Image URL"
                        value={trendingScoreImage}
                        onChange={(e) => setTrendingScoreImage(e.target.value)}
                        className="theme-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="impactScoreImage"><b>Impact Score Image URL</b></label>
                    <input name="impactscoreimageurl" id="impactScoreImage"
                        type="text"
                        placeholder="Impact Score Image URL"
                        value={impactScoreImage}
                        onChange={(e) => setImpactScoreImage(e.target.value)}
                        className="theme-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="predictiveMomentumScoreImage"><b>Predictive Momentum Score Image URL</b></label>
                    <input name="predictivemomentumscoreimageurl" id="predictiveMomentumScoreImage"
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
                    <label>Tile Template</label>
                    <Select name="select" id="selectField" value={tileTemplateId}
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

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.companySubmitBtn}>
                        {themes.editId ? 'Update Theme' : 'Add Theme'}
                    </button>
                    <button type="button" onClick={handleHomeNav} className={styles.cancelBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
