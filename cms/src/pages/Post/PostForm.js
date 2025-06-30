import React, { useContext, useState, useEffect } from 'react';
import PostContext from '../../context/PostContext';
import axios from '../../config/axios';
import Select from 'react-select'; // Import react-select
import { format, parseISO } from 'date-fns';
import ReactQuill from 'react-quill'; // Import ReactQuill
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import styles from '../../html/css/Post.module.css'; // Using CSS modules
import { toast } from 'react-toastify'; // ✅ Import toast
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import toast styles
import CreatableSelect from 'react-select/creatable';
import ContextContext from '../../context/ContextContext';
import TileTemplateContext from '../../context/TileTemplateContext';
import JsxParser from 'react-jsx-parser';
import Tile from '../../components/Tile';

// Get current date in IST timezone
const getCurrentDateInIST = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // IST is UTC+5:30
    return istTime.toISOString().split('T')[0];
};

const currentDateInIST = getCurrentDateInIST();

const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      padding: '10px 15px',
      display: 'flex',
      alignItems: 'center',
      height: '70px', // Give each option a fixed height
      backgroundColor: state.isFocused ? '#e9ecef' : 'white',
      color: state.isFocused ? '#212529' : '#495057',
      cursor: 'pointer',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    control: (provided) => ({
        ...provided,
        minHeight: '45px',
    })
  };

const formatOptionLabel = ({ label, jsxCode }) => (
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
          overflow: 'hidden', // Contain the preview
        }}>
        <div style={{
            transform: 'scale(0.6)', // Scale down the preview to fit
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
  );

export default function PostForm({ handleFormSubmit, handleGoToPostList }) {
    const { posts, postsDispatch,fetchPosts,  countries, companies, sources, setIsFormVisible, isFormVisible } = useContext(PostContext);
    const { contexts, contextsDispatch } = useContext(ContextContext);
    const { tileTemplates } = useContext(TileTemplateContext);
    const [postTitle, setPostTitle] = useState('');
    const [date, setDate] = useState('');
    const [postType, setPostType] = useState('');
    const [isTrending, setIsTrending] = useState(false);
    const [homePageShow, setHomePageShow] = useState(false);
    const [selectedContexts, setSelectedContexts] = useState([]); // ✅ Multiple contexts
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [summary, setSummary] = useState('');
    const [completeContent, setCompleteContent] = useState('');
    const [sentiment, setSentiment] = useState(null); // Changed initial state
    const [primaryCompanies, setPrimaryCompanies] = useState([]);
    const [secondaryCompanies, setSecondaryCompanies] = useState([]);
    const [source, setSource] = useState([]);
    const [sourceUrls, setSourceUrls] = useState([]); // Changed initial state
    const [includeInContainer, setIncludeInContainer] = useState(false); // New state for includeInContainer field
    const [tileTemplateId, setTileTemplateId] = useState(null);
    const [infographicsUrl, setInfographicsUrl] = useState(''); // New field for Infographic posts
    const [researchReportsUrl, setResearchReportsUrl] = useState(''); // New field for Research Report posts

    const fetchAllContexts = async () => {
        try {
            const response = await axios.get("/api/admin/contexts/all", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
    
            if (response.data.success && Array.isArray(response.data.contexts)) {
                console.log("✅ Fetched All Contexts:", response.data.contexts.length);
                contextsDispatch({ type: "SET_CONTEXTS", payload: { contexts: response.data.contexts } });
            } else {
                console.error("❌ Invalid API response:", response.data);
                contextsDispatch({ type: "SET_CONTEXTS", payload: { contexts: [] } }); // ✅ Fallback to empty array
            }
        } catch (err) {
            console.error("❌ Error fetching all contexts:", err);
            contextsDispatch({ type: "SET_CONTEXTS", payload: { contexts: [] } }); // ✅ Fallback to empty array
        }
    };
    
    // ✅ Fetch all contexts when the form loads
    useEffect(() => {
        fetchAllContexts();
    }, []);
    
    useEffect(() => {
        if (posts.editId && posts.data.length > 0) {
            const post = posts.data.find((ele) => ele._id === posts.editId);
    
            if (post) {
                console.log("Editing Post Data:", post);
                console.log("Editing Post Contexts:", post.contexts);
            
            setSelectedContexts(
                post.contexts && Array.isArray(post.contexts)
                    ? post.contexts.map(ctx => ({
                        value: ctx._id, 
                        label: ctx.contextTitle
                    }))
                    : []
            );

                setPostTitle(post.postTitle);
                setDate(format(parseISO(post.date), 'yyyy-MM-dd'));
                setPostType(post.postType);
                setIsTrending(post.isTrending);
                setHomePageShow(post.homePageShow);
                setSelectedCountries(
                    post.countries && Array.isArray(post.countries)
                        ? post.countries.map(country => {
                            // If country is already in the correct format
                            if (country.value && country.label) {
                                return country;
                            }
                            // If country is just an ID, find the corresponding country data
                            const countryData = countries.data?.find(c => c._id === country) || {};
                            return {
                                value: countryData._id || country,
                                label: countryData.countryName || country
                            };
                        })
                        : []
                );
                setSummary(post.summary || '');
                setCompleteContent(post.completeContent || '');
                setSentiment(post.sentiment ? { value: post.sentiment, label: post.sentiment } : null);
                setPrimaryCompanies(
                    Array.isArray(post.primaryCompanies) ? post.primaryCompanies.map(pc => {
                        const companyData = companies.data?.find(c => c._id === pc);
                        return companyData ? { value: companyData._id, label: companyData.companyName } : null;
                    }).filter(Boolean) : []
                );
                setSecondaryCompanies(
                    Array.isArray(post.secondaryCompanies) ? post.secondaryCompanies.map(sc => {
                        const companyData = companies.data?.find(c => c._id === sc);
                        return companyData ? { value: companyData._id, label: companyData.companyName } : null;
                    }).filter(Boolean) : []
                );
                setSource(
                    post.source && Array.isArray(post.source)
                        ? post.source.map(src => {
                            // If source is just an ID, find the corresponding source data
                            const sourceData = sources.data?.find(s => s._id === src) || {};
                            return {
                                value: sourceData._id || src,
                                label: sourceData.sourceName || src
                            };
                        })
                        : []
                );
                setSourceUrls(post.sourceUrls || []);
                setIncludeInContainer(post.includeInContainer || false);
                setInfographicsUrl(post.infographicsUrl || '');
                setResearchReportsUrl(post.researchReportsUrl || '');
                if (post.tileTemplateId) {
                    const template = tileTemplates.find(t => t._id === post.tileTemplateId);
                    if (template) {
                        setTileTemplateId({ value: template._id, label: template.name, jsxCode: template.jsxCode });
                    }
                } else {
                    setTileTemplateId(null);
                }
            }
        } else {
            // Reset form for new post
            resetForm();
        }
    }, [posts.editId, posts.data, contexts, tileTemplates, companies.data, sources.data]); 
    

    // ✅ Ensure form does not disappear after reload
    useEffect(() => {
        if (localStorage.getItem("isFormVisible") === "true") {
            setIsFormVisible(true);
        }
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validation checks
        if (!postTitle.trim()) {
            toast.warn("⚠️ Post Title is required.");
            return;
        }
        if (!date) {
            toast.warn("⚠️ Date is required.");
            return;
        }
        if (new Date(date) > new Date(currentDateInIST)) {
            toast.warn("⚠️ Date cannot be in the future.");
            return;
        }
        if (!postType) {
            toast.warn("⚠️ Post Type is required.");
            return;
        }
        if (!summary) {
            toast.warn("⚠️ Summary is required.");
            return;
        }
        if (!sentiment) {
            toast.warn("⚠️ Sentiment is required.");
            return;
        }
        if (selectedContexts.length === 0) {
            toast.warn("⚠️ Please select at least one Context.");
            return;
        }
        if (selectedCountries.length === 0) {
            toast.warn("⚠️ Please select at least one Country.");
            return;
        }
        if (source.length === 0) {
            toast.warn("⚠️ Please select at least one Source.");
            return;
        }
        if (sourceUrls.length === 0) {
            toast.warn("⚠️ Please provide at least one Source URL.");
            return;
        }
        if (postType === 'Infographic' && !infographicsUrl.trim()) {
            toast.warn("⚠️ Infographics URL is required for Infographic posts.");
            return;
        }
        if (postType === 'Research Report' && !researchReportsUrl.trim()) {
            toast.warn("⚠️ Research Reports URL is required for Research Report posts.");
            return;
        }
    
        const formData = {
            postTitle,
            date,
            postType,
            isTrending,
            homePageShow,
            contexts: selectedContexts.map(c => c.value),
            countries: selectedCountries.map(c => c.value),
            summary,
            completeContent,
            sentiment: sentiment.value,
            primaryCompanies: primaryCompanies.map(c => c.value),
            secondaryCompanies: secondaryCompanies.map(c => c.value),
            source: source.map(s => s.value),
            sourceUrls,
            includeInContainer,
            tileTemplateId: tileTemplateId ? tileTemplateId.value : null,
            infographicsUrl,
            researchReportsUrl,
        };
    
        handleFormSubmit(formData, posts.editId);
    };
    
    if (!isFormVisible) {
        return null; // Prevents rendering the form if isFormVisible is false
    }

    const contextOptions = (contexts?.data || []).map(ctx => ({
        value: ctx._id,
        label: ctx.contextTitle
    }));
    
    
    const handleSelectChange = (selectedOptions) => {
        setSelectedContexts(selectedOptions || []); // ✅ Allow multiple selections
    };
    

    const handleSummaryChange = (value) => {
        setSummary(value);
    };
    
    const handleHomeNav = () => {
        setIsFormVisible(false);
        localStorage.removeItem("isFormVisible"); // ✅ Reset form state when navigating back
    };
    
    const handleCountriesChange = (selectedOptions) => {
        setSelectedCountries(selectedOptions || []);
    };
    
    // Create options for react-select from countries data
    const countryOptions = countries.data?.map(country => ({
        value: country._id,
        label: country.countryName
    })) || [];
    
    const primaryCompanyOptions = companies.data?.map(company => ({
        value: company._id,
        label: company.companyName
    })) || [];

    const secondaryCompanyOptions = companies.data?.map(company => ({
        value: company._id,
        label: company.companyName
    })) || [];

    const handleSourceChange = (selectedOptions) => {
        setSource(selectedOptions || []);
    };
    
    const sourceOptions = sources.data?.map(src => ({
        value: src._id,
        label: src.sourceName
    })) || [];
    
    const handleCreateUrl = (inputValue) => {
        const newUrl = inputValue.trim();
        if (newUrl) {
            setSourceUrls(prev => [...prev, newUrl]);
        }
    };


    // Add refresh functions for companies and sources
    const refreshCompanies = async () => {
        // This can be moved to the context provider
    };

    const refreshSources = async () => {
        // This can be moved to the context provider
    };

    const resetForm = () => {
        setPostTitle('');
        setDate('');
        setPostType('');
        setIsTrending(false);
        setHomePageShow(false);
        setSelectedContexts([]);
        setSelectedCountries([]);
        setSummary('');
        setCompleteContent('');
        setSentiment(null);
        setPrimaryCompanies([]);
        setSecondaryCompanies([]);
        setSource([]);
        setSourceUrls([]);
        setIncludeInContainer(false); // Reset includeInContainer
        setTileTemplateId(null);
        setInfographicsUrl('');
        setResearchReportsUrl('');
    }

    return (
        <div className={styles.postFormContainer}>
            <button type="button" className={styles.submitBtn} onClick={handleHomeNav}>Post Home</button>
            <form onSubmit={handleSubmit} className={styles.postForm}>
                <label htmlFor="postTitle">Post Title <span style={{color: 'red'}}>*</span></label>
                <input
                    id="postTitle"
                    type="text"
                    placeholder="Post Title"
                    name="postTitle"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className={styles.postInput}
                    required
                />
                <label htmlFor="date">Date <span style={{color: 'red'}}>*</span></label>
                <input
                    id="date"
                    type="date"
                    name="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={styles.postInput}
                    required
                    max={currentDateInIST}
                />
                <label htmlFor="postType">Post Type <span style={{color: 'red'}}>*</span></label>
                <select
                    id="postType"
                    name="postType"
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className={styles.postSelect}
                    required
                >
                    <option value="">Select Post Type</option>
                    <option value="News">News</option>
                    <option value="Expert Opinion">Expert Opinion</option>
                    <option value="Research Report">Research Report</option>
                    <option value="Infographic">Infographic</option>
                    <option value="Interview">Interview</option>
                </select>
                
                {/* Conditional Fields for Infographic */}
                {postType === 'Infographic' && (
                    <>
                        <label htmlFor="infographicsUrl">Infographics URL <span style={{color: 'red'}}>*</span></label>
                        <input
                            id="infographicsUrl"
                            type="url"
                            placeholder="Enter Infographics URL"
                            name="infographicsUrl"
                            value={infographicsUrl}
                            onChange={(e) => setInfographicsUrl(e.target.value)}
                            className={styles.postInput}
                            required
                        />
                    </>
                )}
                
                {/* Conditional Fields for Research Report */}
                {postType === 'Research Report' && (
                    <>
                        <label htmlFor="researchReportsUrl">Research Reports URL <span style={{color: 'red'}}>*</span></label>
                        <input
                            id="researchReportsUrl"
                            type="url"
                            placeholder="Enter Research Reports URL"
                            name="researchReportsUrl"
                            value={researchReportsUrl}
                            onChange={(e) => setResearchReportsUrl(e.target.value)}
                            className={styles.postInput}
                            required
                        />
                    </>
                )}
                
                <label htmlFor="isTrending"><b>Is Trending?</b></label>
                <input
                    id="isTrending"
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className={styles.postCheckbox}
                />
                <label htmlFor="homePageShow"><b>Show on Home Page?</b></label>
                <input
                    id="homePageShow"
                    type="checkbox"
                    checked={homePageShow}
                    onChange={(e) => setHomePageShow(e.target.checked)}
                    className={styles.postCheckbox}
                />
              <label htmlFor="Contexts">Contexts <span style={{color: 'red'}}>*</span></label>
                    <Select
                        id="contexts"
                        name="contexts"
                        value={selectedContexts}
                        onChange={handleSelectChange}
                        options={contextOptions}
                        isMulti
                        className={styles.postSelect}
                        required
                    />
                <label htmlFor="includeInContainer"><b>Include in Container?</b></label>
                <input
                    id="includeInContainer"
                    type="checkbox"
                    checked={includeInContainer}
                    onChange={(e) => setIncludeInContainer(e.target.checked)}
                    className={styles.postCheckbox}
                />
                <label htmlFor="countries">Countries <span style={{color: 'red'}}>*</span></label>
                <Select
                    id="countries"
                    name="countries"
                    value={selectedCountries}
                    onChange={handleCountriesChange}
                    options={countryOptions}
                    isMulti
                    className={styles.postSelect}
                    required
                />
                <label htmlFor="summary">Summary <span style={{color: 'red'}}>*</span></label>
                <ReactQuill
                    id="summary"
                    value={summary}
                    onChange={handleSummaryChange}
                    className={styles.postQuill}
                />

                <label htmlFor="completeContent"><b>Complete Content</b></label>
                <textarea
                    id="completeContent"
                    placeholder="Complete Content"
                    value={completeContent}
                    onChange={(e) => setCompleteContent(e.target.value)}
                    className={styles.postTextarea}
                />
                <div className={styles.formGroup}>
                    <label>Sentiment *</label>
                    <Select
                        value={sentiment}
                        onChange={setSentiment}
                        options={[
                            { value: 'Positive', label: 'Positive' },
                            { value: 'Negative', label: 'Negative' },
                            { value: 'Neutral', label: 'Neutral' }
                        ]}
                        placeholder="Select Sentiment"
                        className={styles.postSelect}
                        isClearable
                        required
                    />
                </div>
                <label htmlFor="primaryCompanies"><b>Primary Companies</b></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Select
                        id="primaryCompanies"
                        value={primaryCompanies}
                        onChange={setPrimaryCompanies}
                        options={primaryCompanyOptions}
                        isMulti
                        isSearchable
                        placeholder="Search and select primary companies"
                        className={styles.postSelect}
                    />
                </div>
                <label htmlFor="secondaryCompanies"><b>Secondary Companies</b></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Select
                        id="secondaryCompanies"
                        value={secondaryCompanies}
                        onChange={setSecondaryCompanies}
                        options={secondaryCompanyOptions}
                        isMulti
                        isSearchable
                        placeholder="Search and select secondary companies"
                        className={styles.postSelect}
                    />
                </div>
                <label htmlFor="source">Source <span style={{color: 'red'}}>*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Select
                        id="source"
                        name="source"
                        value={source}
                        onChange={handleSourceChange}
                        options={sourceOptions}
                        isMulti
                        className={styles.postSelect}
                        required
                    />
                </div>
                <label htmlFor="sourceUrls">Source URLs <span style={{color: 'red'}}>*</span></label>
                <CreatableSelect
                    id="sourceUrls"
                    name="sourceUrls"
                    value={sourceUrls.map(url => ({ value: url, label: url }))}
                    onChange={(selectedOptions) => setSourceUrls(selectedOptions ? selectedOptions.map(opt => opt.value) : [])}
                    isMulti
                    isSearchable
                    placeholder="Enter URL and press Enter"
                    className={styles.postSelect}
                    onCreateOption={handleCreateUrl}
                    required
                />

                <div className={styles.formGroup}>
                    <label>Tile Template</label>
                    <Select
                        value={tileTemplateId}
                        onChange={setTileTemplateId}
                        options={tileTemplates.map(template => ({ value: template._id, label: template.name, jsxCode: template.jsxCode }))}
                        formatOptionLabel={formatOptionLabel}
                        styles={customSelectStyles}
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
                <button type="submit" className={styles.submitBtn}>Save Post</button>
            </form>
        </div>
    );
}
