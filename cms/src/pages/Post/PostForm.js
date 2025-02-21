import React, { useContext, useState, useEffect } from 'react';
import PostContext from '../../context/PostContext';
import axios from '../../config/axios';
import Select from 'react-select'; // Import react-select
import { format, parseISO } from 'date-fns';
import ReactQuill from 'react-quill'; // Import ReactQuill
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import '../../html/css/Post.css'; // Ensure this CSS file is created
import { toast } from 'react-toastify'; // ✅ Import toast
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import toast styles
import CreatableSelect from 'react-select/creatable';
import ContextContext from '../../context/ContextContext';

export default function PostForm({ handleFormSubmit }) {
    const { posts, postsDispatch,fetchPosts,  countries, companies, sources, setIsFormVisible, isFormVisible } = useContext(PostContext);
    const { contexts, contextsDispatch } = useContext(ContextContext);
    const [postTitle, setPostTitle] = useState('');
    const [date, setDate] = useState('');
    const [postType, setPostType] = useState('');
    const [isTrending, setIsTrending] = useState(false);
    const [homePageShow, setHomePageShow] = useState(false);
    const [selectedContexts, setSelectedContexts] = useState([]); // ✅ Multiple contexts
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [summary, setSummary] = useState('');
    const [completeContent, setCompleteContent] = useState('');
    const [sentiment, setSentiment] = useState('');
    const [primaryCompanies, setPrimaryCompanies] = useState([]);
    const [secondaryCompanies, setSecondaryCompanies] = useState([]);
    const [source, setSource] = useState([]);
    const [sourceUrls, setSourceUrls] = useState([]); // ✅ Store multiple URLs
    const [generalComment, setGeneralComment] = useState('');
    const [includeInContainer, setIncludeInContainer] = useState(false); // New state for includeInContainer field

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

                // ✅ Store form values in localStorage for persistence
                
            
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
                setSelectedCountries(post.countries || []);
                setSummary(post.summary || '');
                setCompleteContent(post.completeContent || '');
                setSentiment(post.sentiment || '');
                setPrimaryCompanies(post.primaryCompanies || []);
                setSecondaryCompanies(post.secondaryCompanies || []);
                setSource(post.source || []);
                setSourceUrls(post.sourceUrls || []);
                setGeneralComment(post.generalComment || '');
                setIncludeInContainer(post.includeInContainer || false);
            }
        } else {
            // ✅ Restore from localStorage if available
            const savedData = JSON.parse(localStorage.getItem("postFormData"));
            if (savedData) {
                console.log("Saved Form Data from LocalStorage:", savedData);
                console.log("Saved Contexts:", savedData.contexts);
                setSelectedContexts(
                    savedData.contexts && Array.isArray(savedData.contexts)
                        ? savedData.contexts.map(ctx => ({
                              value: ctx._id,
                              label: ctx.contextTitle
                          }))
                        : []
                );
                setPostTitle(savedData.postTitle);
                setDate(format(parseISO(savedData.date), 'yyyy-MM-dd'));
                setPostType(savedData.postType);
                setIsTrending(savedData.isTrending);
                setHomePageShow(savedData.homePageShow);
                setSelectedCountries(savedData.countries || []);
                setSummary(savedData.summary || '');
                setCompleteContent(savedData.completeContent || '');
                setSentiment(savedData.sentiment || '');
                setPrimaryCompanies(savedData.primaryCompanies || []);
                setSecondaryCompanies(savedData.secondaryCompanies || []);
                setSource(savedData.source || []);
                setSourceUrls(savedData.sourceUrls || []);
                setGeneralComment(savedData.generalComment || '');
                setIncludeInContainer(savedData.includeInContainer || false);
            }
            localStorage.removeItem("postFormData"); // ✅ Ensure old data is not restored
        }
    }, [posts.editId, posts.data, contexts]); // ✅ Only update when posts.editId or posts.data changes
    

    // ✅ Ensure form does not disappear after reload
    useEffect(() => {
        if (localStorage.getItem("isFormVisible") === "true") {
            setIsFormVisible(true);
        }
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // ✅ Allow adding URLs without blocking due to missing fields
        if (postTitle.trim() === "" && sourceUrls.length > 0) {
            console.log("✅ Testing Source URLs:", sourceUrls);
            return;
        }
    
        // ✅ Check Required Fields Before Submitting
        if (!postTitle.trim()) {
            toast.warn("⚠️ Post Title is required.");
            return;
        }
    
        if (!date) {
            toast.warn("⚠️ Date is required.");
            return;
        }
    
        if (!postType) {
            toast.warn("⚠️ Post Type is required.");
            return;
        }
    
        if (!summary) {
            toast.warn("⚠️ Summary must be Written.");
            return;
        }
    
        if (!Array.isArray(sourceUrls) || sourceUrls.length === 0) {
            toast.warn("⚠️ At least one Source URL is required.");
            return;
        }
    
        if (!sentiment) {
            toast.warn("⚠️ Please select a sentiment.");
            return;
        }
    
        const formData = {
            postTitle,
            date: new Date(date).toISOString(),
            postType,
            isTrending,
            homePageShow,
            contexts: selectedContexts.length > 0
                ? selectedContexts.map(ctx => ({ _id: ctx.value, contextTitle: ctx.label }))
                : [],
            countries: selectedCountries,
            summary,
            completeContent,
            sentiment,
            primaryCompanies,
            secondaryCompanies,
            source,
            sourceUrls, // ✅ Send an array of URLs instead of a single URL
            generalComment
        };
    
        try {
            let response;
            if (posts.editId) {
                response = await axios.put(`/api/admin/posts/${posts.editId}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
    
                if (response.status === 200) {
                    console.log("✅ Post updated successfully:", response.data);
                    postsDispatch({ type: 'UPDATE_POST', payload: response.data });
                    handleFormSubmit("Post updated successfully");
                    toast.success("✅ Context updated successfully!");
    
                    // ✅ Ensure `postId` is correctly extracted
                    const postId = response.data.updatedPost?._id || response.data._id;
                    if (!postId) {
                        console.error("❌ Post ID is missing in the response:", response.data);
                        toast.error("❌ Post ID is missing or invalid.");
                        return;
                    }
    
                    await updateContextWithPost(postId, includeInContainer);
                    await fetchPosts();
                    setTimeout(() => {
                        console.log("✅ Fetching updated posts...");
                        console.log("Updated Posts:", posts.data);
                    }, 1000);
                }
            } else {
                response = await axios.post('/api/admin/posts', formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
    
                if (response.status === 201) {
                    console.log("✅ Post added successfully:", response.data);
                    postsDispatch({ type: 'ADD_POST', payload: response.data });
                    handleFormSubmit("Post added successfully");
                    toast.success("✅ Context added successfully!");
    
                    // ✅ Ensure `postId` is correctly extracted
                    const postId = response.data.post?._id || response.data._id;
                    if (!postId) {
                        console.error("❌ Post ID is missing in the response:", response.data);
                        toast.error("❌ Post ID is missing or invalid.");
                        return;
                    }
    
                    await updateContextWithPost(postId, includeInContainer);
                    await fetchPosts();
                    setTimeout(() => {
                        console.log("✅ Fetching updated posts...");
                        console.log("Updated Posts:", posts.data);
                    }, 1000);
                }
            }
        } catch (err) {
            console.error("❌ Error submitting form:", err.response?.data || err.message);
            toast.error("An error occurred while submitting the form.");
        }
    };
    
    
    if (!isFormVisible) {
        return null; // Prevents rendering the form if isFormVisible is false
    }
   
    const updateContextWithPost = async (postId, includeInContainer) => {
        console.log("📌 Received postId:", postId); // Log postId
        console.log("📌 Selected contexts:", selectedContexts);
    
        if (!selectedContexts || selectedContexts.length === 0) {
            toast.error("❌ No contexts selected. Please select at least one context.");
            return;
        }
    
        if (!postId || typeof postId !== "string") { 
            toast.error("❌ Post ID is missing or invalid.");
            console.error("❌ Invalid postId received:", postId);
            return;
        }
    
        console.log('🔄 Updating multiple contexts with postId:', {
            contexts: selectedContexts.map(ctx => ctx.value), // Get context IDs
            postId,
            includeInContainer
        });
    
        try {
            // ✅ Send requests for each selected context
                    await Promise.all(
                    selectedContexts.map(async (context) => {
            try {
                const response = await axios.put(
                    `/api/admin/contexts/${context.value}/postId`,
                    { postId, includeInContainer },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                console.log(`✅ Context ${context.label} updated successfully:`, response.data);
            } catch (error) {
                console.error(`❌ Error updating context ${context.label}:`, error.response?.data || error.message);
            }
        })
    );
    toast.success("✅ All selected contexts updated with posts successfully!");
        } catch (err) {
            console.error('❌ Error updating contexts with postId:', err.response?.data || err.message);
            toast.error('An error occurred while updating the contexts.');
        }
    };
    
    const contextOptions = (contexts?.data || []).map(ctx => ({
        value: ctx._id,
        label: ctx.contextTitle
    }));
    
    
    const handleSelectChange = (selectedOptions) => {
        setSelectedContexts(selectedOptions || []); // ✅ Allow multiple selections
    };
    

    const handleSummaryChange = (value) => {
        const cleanedSummary = value.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags and spaces
        setSummary(cleanedSummary === "" ? "" : value);
    };
    
    const handleHomeNav = () => {
        setIsFormVisible(false);
        localStorage.removeItem("isFormVisible"); // ✅ Reset form state when navigating back
    };
    
    const handleCountriesChange = (selectedOptions) => {
        setSelectedCountries(selectedOptions ? selectedOptions.map(option => option.value) : []);
    };
    
    // Create options for react-select from countries data
    const countryOptions = countries.data?.map(country => ({
        value: country._id,
        label: country.countryName
    })) || [];
    const handlePrimaryCompaniesChange = (selectedOptions) => {
        setPrimaryCompanies(selectedOptions ? selectedOptions.map(option => option.value) : []);
    };
    
    const primaryCompanyOptions = companies.data?.map(company => ({
        value: company._id,
        label: company.companyName
    })) || [];

    const handleSecondaryCompaniesChange = (selectedOptions) => {
        setSecondaryCompanies(selectedOptions ? selectedOptions.map(option => option.value) : []);
    };
    
    const secondaryCompanyOptions = companies.data?.map(company => ({
        value: company._id,
        label: company.companyName
    })) || [];

    const handleSourceChange = (selectedOptions) => {
        setSource(selectedOptions ? selectedOptions.map(option => option.value) : []);
    };
    
    const sourceOptions = sources.data?.map(src => ({
        value: src._id,
        label: src.sourceName
    })) || [];
    
    const handleCreateUrl = (inputValue) => {
        const newUrl = inputValue.trim();
    
        // ✅ Validate URL format (must start with "http://" or "https://")
        if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
            toast.warn("⚠️ Please enter a valid URL (starting with http:// or https://)");
            return;
        }
    
        // ✅ Prevent duplicates
        if (!sourceUrls.includes(newUrl)) {
            setSourceUrls([...sourceUrls, newUrl]); // ✅ Add URL inside input field
        }
    };
    
    return (
        <div className="post-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Post Home</button>
            <form onSubmit={handleSubmit} className="post-form">
                <label htmlFor="postTitle"><b>Post Title</b></label>
                <input
                    id="postTitle"
                    type="text"
                    placeholder="Post Title"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="post-input"
                    required
                />
                <label htmlFor="date"><b>Date</b></label>
                <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="post-input"
                />
                <label htmlFor="postType"><b>Post Type</b></label>
                <select
                    id="postType"
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="post-select"
                >
                    <option value="">Select Post Type</option>
                    <option value="News">News</option>
                    <option value="Expert Opinion">Expert Opinion</option>
                    <option value="Research Report">Research Report</option>
                    <option value="Infographic">Infographic</option>
                    <option value="Interview">Interview</option>
                </select>
                <label htmlFor="isTrending"><b>Is Trending?</b></label>
                <input
                    id="isTrending"
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="post-checkbox"
                />
                <label htmlFor="homePageShow"><b>Show on Home Page?</b></label>
                <input
                    id="homePageShow"
                    type="checkbox"
                    checked={homePageShow}
                    onChange={(e) => setHomePageShow(e.target.checked)}
                    className="post-checkbox"
                />
              <label htmlFor="Contexts"><b>Contexts</b></label>
                    <Select
                        id="contexts"
                        value={selectedContexts}
                        onChange={handleSelectChange} // ✅ Calls handleSelectChange
                        options={contextOptions} // ✅ Uses contextOptions here
                        isMulti
                        placeholder="Select Context(s)"
                        className="post-select"
                    />

                <label htmlFor="includeInContainer"><b>Include in Container?</b></label>
                <input
                    id="includeInContainer"
                    type="checkbox"
                    checked={includeInContainer}
                    onChange={(e) => setIncludeInContainer(e.target.checked)}
                    className="post-checkbox"
                />
                <label htmlFor="countries"><b>Countries</b></label>
                <Select
                        id="countries"
                        value={countryOptions.filter(option => selectedCountries.includes(option.value))} // Set selected values
                        onChange={handleCountriesChange} // Handle selection
                        options={countryOptions} // Options from API
                        isMulti // Enable multiple selection
                        isSearchable // Enable search functionality
                        placeholder="Search and select countries"
                        className="post-select"
                    />
                <label htmlFor="summary"><b>Summary</b></label>
                <ReactQuill
                        id="summary"
                        value={summary}
                        onChange={handleSummaryChange}
                        className="post-quill"
                    />

                <label htmlFor="completeContent"><b>Complete Content</b></label>
                <textarea
                    id="completeContent"
                    placeholder="Complete Content"
                    value={completeContent}
                    onChange={(e) => setCompleteContent(e.target.value)}
                    className="post-textarea"
                />
                <label htmlFor="sentiment"><b>Sentiment</b></label>
                <select
                    id="sentiment"
                    value={sentiment}
                    onChange={(e) => setSentiment(e.target.value)}
                    className="post-select"
                >
                    <option value="">Select Sentiment</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                    <option value="Neutral">Neutral</option>
                </select>
                <label htmlFor="primaryCompanies"><b>Primary Companies</b></label>
                <Select
                        id="primaryCompanies"
                        value={primaryCompanyOptions.filter(option => primaryCompanies.includes(option.value))}
                        onChange={handlePrimaryCompaniesChange}
                        options={primaryCompanyOptions}
                        isMulti
                        isSearchable
                        placeholder="Search and select primary companies"
                        className="post-select"
                    />
                <label htmlFor="secondaryCompanies"><b>Secondary Companies</b></label>
                <Select
                        id="secondaryCompanies"
                        value={secondaryCompanyOptions.filter(option => secondaryCompanies.includes(option.value))}
                        onChange={handleSecondaryCompaniesChange}
                        options={secondaryCompanyOptions}
                        isMulti
                        isSearchable
                        placeholder="Search and select secondary companies"
                        className="post-select"
                    />

                <label htmlFor="source"><b>Source</b></label>
                <Select
                        id="source"
                        value={sourceOptions.filter(option => source.includes(option.value))}
                        onChange={handleSourceChange}
                        options={sourceOptions}
                        isMulti // ✅ Allows multiple selection
                        isSearchable // ✅ Enables search functionality
                        placeholder="Search and select sources"
                        className="post-select"
                    />
                    <label htmlFor="sourceUrls"><b>Source URLs</b></label>
                    <CreatableSelect
                        id="sourceUrls"
                        value={sourceUrls.map(url => ({ value: url, label: url }))} // ✅ Show URLs inside input field
                        onChange={(selectedOptions) => setSourceUrls(selectedOptions.map(opt => opt.value))} // ✅ Update state
                        isMulti
                        isSearchable
                        placeholder="Enter URL and press Enter"
                        className="post-select"
                        onCreateOption={handleCreateUrl} // ✅ Handle Enter key for adding URLs
                    />

                <label htmlFor="generalComment"><b>General Comment</b></label>
                <textarea
                    id="generalComment"
                    placeholder="General Comment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    className="post-textarea"
                />
                <button type="submit" className="submit-btn">Save Post</button>
            </form>
        </div>
    );
}
