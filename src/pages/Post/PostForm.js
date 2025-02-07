import React, { useContext, useState, useEffect } from 'react';
import PostContext from '../../context/PostContext';
import axios from '../../config/axios';
import Select from 'react-select'; // Import react-select
import { format, parseISO } from 'date-fns';
import ReactQuill from 'react-quill'; // Import ReactQuill
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import '../../html/css/Post.css'; // Ensure this CSS file is created

export default function PostForm({ handleFormSubmit }) {
    const { posts, postsDispatch, contexts, countries, companies, sources, setIsFormVisible, isFormVisible } = useContext(PostContext);

    const [postTitle, setPostTitle] = useState('');
    const [date, setDate] = useState('');
    const [postType, setPostType] = useState('');
    const [isTrending, setIsTrending] = useState(false);
    const [homePageShow, setHomePageShow] = useState(false);
    const [selectedContext, setSelectedContext] = useState(null); // Updated to handle object
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [summary, setSummary] = useState('');
    const [completeContent, setCompleteContent] = useState('');
    const [sentiment, setSentiment] = useState('');
    const [primaryCompanies, setPrimaryCompanies] = useState([]);
    const [secondaryCompanies, setSecondaryCompanies] = useState([]);
    const [source, setSource] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [generalComment, setGeneralComment] = useState('');
    const [includeInContainer, setIncludeInContainer] = useState(false); // New state for includeInContainer field

    useEffect(() => {
        if (posts.editId) {
            const post = posts.data.find((ele) => ele._id === posts.editId);
            if (post) {
                const selectedContext = contexts.data.find(ctx => post.context.includes(ctx._id)) || null;
                setSelectedContext(selectedContext ? { value: selectedContext._id, label: selectedContext.contextTitle } : null);
                
                setPostTitle(post.postTitle);
                setDate(format(parseISO(post.date), 'yyyy-MM-dd')); // Format date for display
                setPostType(post.postType);
                setIsTrending(post.isTrending);
                setHomePageShow(post.homePageShow);
                setSelectedCountries(post.countries || []);
                setSummary(post.summary || '');
                setCompleteContent(post.completeContent || '');
                setSentiment(post.sentiment || '');
                setPrimaryCompanies(post.primaryCompanies || []);
                setSecondaryCompanies(post.secondaryCompanies || []);
                setSource(post.source || '');
                setSourceUrl(post.sourceUrl || '');
                setGeneralComment(post.generalComment || '');
                setIncludeInContainer(post.includeInContainer || false); // Load includeInContainer if available
            }
        } else {
            // Clear fields if no editId
            setPostTitle('');
            setDate('');
            setPostType('');
            setIsTrending(false);
            setHomePageShow(false);
            setSelectedContext(null);
            setSelectedCountries([]);
            setSummary('');
            setCompleteContent('');
            setSentiment('');
            setPrimaryCompanies([]);
            setSecondaryCompanies([]);
            setSource('');
            setSourceUrl('');
            setGeneralComment('');
            setIncludeInContainer(false); // Reset includeInContainer
        }
    }, [posts.editId, posts.data, contexts.data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = {
            postTitle,
            date: new Date(date).toISOString(),
            postType,
            isTrending,
            homePageShow,
            context: selectedContext ? selectedContext.value : '', // Ensure valid contextId
            countries: selectedCountries,
            summary,
            completeContent,
            sentiment,
            primaryCompanies,
            secondaryCompanies,
            source,
            sourceUrl,
            generalComment
        };
    
        try {
            let response;
            if (posts.editId) {
                response = await axios.put(`/api/admin/posts/${posts.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    
                if (response.status === 200) {
                    console.log("✅ Post updated successfully:", response.data);
                    postsDispatch({ type: 'UPDATE_POST', payload: response.data });
                    handleFormSubmit("Post updated successfully");
    
                    //  Call context update **only if the post update succeeds**
                    await updateContextWithPost(response.data.updatedPost._id, includeInContainer);
                }
            } else {
                response = await axios.post('/api/admin/posts', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    
                if (response.status === 201) {
                    console.log("✅ Post added successfully:", response.data);
                    postsDispatch({ type: 'ADD_POST', payload: response.data });
                    handleFormSubmit("Post added successfully");
    
                    //  Call context update **only if the post creation succeeds**
                    await updateContextWithPost(response.data._id, includeInContainer);
                }
            }
        } catch (err) {
            console.error("❌ Error submitting form:", err.response?.data || err.message);
            alert("An error occurred while submitting the form.");
        }
    };
    
    if (!isFormVisible) {
        return null; // Prevents rendering the form if isFormVisible is false
    }
   
    const updateContextWithPost = async (postId, includeInContainer) => {
        if (!selectedContext || !selectedContext.value) {
            console.error("❌ Selected Context is missing or invalid:", selectedContext);
            return; // Prevent making an invalid API request
        }
    
        if (!postId) {
            console.error("❌ Post ID is missing or invalid:", postId);
            return;
        }
    
        console.log('🔄 Inside updateContextWithPost:', {
            contextId: selectedContext.value,
            postId,
            includeInContainer
        });
    
        try {
            const response = await axios.put(
                `/api/admin/contexts/${selectedContext.value}/postId`,
                { postId, includeInContainer },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
    
            console.log("✅ Context updated successfully:", response.data);
        } catch (err) {
            console.error('❌ Error updating context with postId:', err.response?.data || err.message);
            alert('An error occurred while updating the context.');
        }
    };
    
    
    const contextOptions = contexts.data.map(ctx => ({
        value: ctx._id,
        label: ctx.contextTitle
    }));

    const handleSelectChange = (option) => {
        setSelectedContext(option);
    };

    const handleHomeNav = () => {
        setIsFormVisible(false);
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
                <label htmlFor="context"><b>Context</b></label>
                <Select
                    id="context"
                    value={selectedContext}
                    onChange={handleSelectChange}
                    options={contextOptions}
                    placeholder="Select Context"
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
                <select
                    id="countries"
                    value={selectedCountries}
                    onChange={(e) => setSelectedCountries(Array.from(e.target.selectedOptions, option => option.value))}
                    className="post-select"
                    multiple
                >
                    {countries.data && countries.data.map(country => (
                        <option key={country._id} value={country._id}>{country.countryName}</option>
                    ))}
                </select>
                <label htmlFor="summary"><b>Summary</b></label>
                <ReactQuill
                    id="summary"
                    value={summary}
                    onChange={setSummary}
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
                <select
                    id="primaryCompanies"
                    value={primaryCompanies}
                    onChange={(e) => setPrimaryCompanies(Array.from(e.target.selectedOptions, option => option.value))}
                    className="post-select"
                    multiple
                >
                    {companies.data && companies.data.map(company => (
                        <option key={company._id} value={company._id}>{company.companyName}</option>
                    ))}
                </select>
                <label htmlFor="secondaryCompanies"><b>Secondary Companies</b></label>
                <select
                    id="secondaryCompanies"
                    value={secondaryCompanies}
                    onChange={(e) => setSecondaryCompanies(Array.from(e.target.selectedOptions, option => option.value))}
                    className="post-select"
                    multiple
                >
                    {companies.data && companies.data.map(company => (
                        <option key={company._id} value={company._id}>{company.companyName}</option>
                    ))}
                </select>
                <label htmlFor="source"><b>Source</b></label>
                <select
                    id="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="post-select"
                >
                    <option value="">Select Source</option>
                    {sources.data && sources.data.map(src => (
                        <option key={src._id} value={src._id}>{src.sourceName}</option>
                    ))}
                </select>
                <label htmlFor="sourceUrl"><b>Source URL</b></label>
                <input
                    id="sourceUrl"
                    type="url"
                    placeholder="Source URL"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="post-input"
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
