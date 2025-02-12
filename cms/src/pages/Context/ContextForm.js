import React, { useContext, useState, useEffect } from 'react';
import ContextContext from '../../context/ContextContext';
import axios from '../../config/axios';
import Select from 'react-select';
import Quill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import '../../html/css/Context.css';
import { toast } from 'react-toastify'; // ✅ Import toast
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import toast styles
import PostContext from '../../context/PostContext';

export default function ContextForm({ handleFormSubmit }) {
    const { contexts, contextsDispatch, sectors: sectorsData, subSectors: subSectorsData, signals: signalsData, subSignals: subSignalsData, themes: themesData, setIsFormVisible, isFormVisible } = useContext(ContextContext);
    const{ posts, fetchPosts} = useContext(PostContext)

    // State for form inputs
    const [contextTitle, setContextTitle] = useState('');
    const [date, setDate] = useState(''); // New state for date field
    const [containerType, setContainerType] = useState('Type-One'); // New state for container type
    const [isTrending, setIsTrending] = useState(false);
    const [displayOrder, setDisplayOrder] = useState(0);
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [selectedSubSectors, setSelectedSubSectors] = useState([]);
    const [selectedSignalCategories, setSelectedSignalCategories] = useState([]);
    const [selectedSignalSubCategories, setSelectedSignalSubCategories] = useState([]);
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [selectedPosts, setSelectedPosts] = useState([]); // New state for selected posts
    const [bannerShow, setBannerShow] = useState(false);
    const [homePageShow, setHomePageShow] = useState(false);
    const [bannerImage, setBannerImage] = useState('');
    const [otherImage, setOtherImage] = useState('');
    const [generalComment, setGeneralComment] = useState('');
    const [dataForTypeNum, setDataForTypeNum] = useState('');
    const [summary, setSummary] = useState('');
    const [hasSlider, setHasSlider] = useState(false);
    const [slides, setSlides] = useState({
        slide1: { title: '', description: '' },
        slide2: { title: '', description: '' },
        slide3: { title: '', description: '' },
        slide4: { title: '', description: '' },
        slide5: { title: '', description: '' },
        slide6: { title: '', description: '' },
        slide7: { title: '', description: '' },
        slide8: { title: '', description: '' },
        slide9: { title: '', description: '' },
        slide10: { title: '', description: '' }
    });

    // ✅ Fetch latest posts when the form is visible
    // useEffect(() => {
    //     const fetchPosts = async () => {
    //         try {
    //             const response = await axios.get('/api/admin/posts?page=1&limit=999', {
    //                 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    //             });

    //             contextsDispatch({ type: "SET_POSTS", payload: response.data.posts });
    //         } catch (error) {
    //             console.error("❌ Error fetching posts:", error);
    //             toast.error("Error fetching posts."); // ✅ Show error message
    //         }
    //     };

    //     fetchPosts();
    // }, []);
    

    // ✅ Fix: Fetch posts only if they are not already fetched
    useEffect(() => {
        if (!posts.data || posts.data.length === 0) {
            console.log("🔄 Fetching posts since none exist in state...");
            fetchPosts();  // ✅ Fetch all posts
        } else {
            console.log("✅ Posts already available in ContextForm:", posts.data.length);
        }
    }, [posts.data]);  // ✅ Fix dependency

    
    useEffect(() => {
        if (contexts.editId) {
            const context = contexts.data.find((ele) => ele._id === contexts.editId);

            if (context) {
                setContextTitle(context.contextTitle);
                setDate(new Date(context.date).toISOString().substring(0, 10)); // Set the date field
                setContainerType(context.containerType || 'Type-One'); // Set container type
                setIsTrending(context.isTrending);
                setDisplayOrder(context.displayOrder);
                setSelectedSectors(context.sectors || []);
                setSelectedSubSectors(context.subSectors || []);
                setSelectedSignalCategories(context.signalCategories || []);
                setSelectedSignalSubCategories(context.signalSubCategories || []);
                
                // Set selected themes with the correct format for react-select
                setSelectedThemes(context.themes.map(themeId => ({
                    value: themeId,
                    label: themesData.data.find(theme => theme._id === themeId)?.themeTitle || ''
                })));
                
                // Set selected posts with the correct format for react-select
                setSelectedPosts(context.posts.map(post => ({
                    value: post.postId, // Make sure to pass the correct postId
                    label: posts.find(p => p._id === post.postId)?.postTitle || '',
                    includeInContainer: post.includeInContainer // Preserve the includeInContainer field
                })));
                
                

                setBannerShow(context.bannerShow);
                setHomePageShow(context.homePageShow);
                setBannerImage(context.bannerImage || '');
                setOtherImage(context.otherImage || '');
                setGeneralComment(context.generalComment || '');
                setDataForTypeNum(context.dataForTypeNum || '');
                setSummary(context.summary || '');
                setHasSlider(context.hasSlider || false);
                setSlides({
                    slide1: context.slide1 || { title: '', description: '' },
                    slide2: context.slide2 || { title: '', description: '' },
                    slide3: context.slide3 || { title: '', description: '' },
                    slide4: context.slide4 || { title: '', description: '' },
                    slide5: context.slide5 || { title: '', description: '' },
                    slide6: context.slide6 || { title: '', description: '' },
                    slide7: context.slide7 || { title: '', description: '' },
                    slide8: context.slide8 || { title: '', description: '' },
                    slide9: context.slide9 || { title: '', description: '' },
                    slide10: context.slide10 || { title: '', description: '' }
                });
            }
        } else {
            setContextTitle('');
            setDate('');
            setContainerType('');
            setIsTrending(false);
            setSelectedSectors([]);
            setSelectedSubSectors([]);
            setSelectedSignalCategories([]);
            setSelectedSignalSubCategories([]);
            setSelectedThemes([]);
            setSelectedPosts([]); // Reset posts when adding a new context
            setBannerShow(false);
            setHomePageShow(false);
            setBannerImage('');
            setOtherImage('');
            setGeneralComment('');
            setDataForTypeNum('');
            setSummary('');
            setHasSlider(false);
            setSlides({
                slide1: { title: '', description: '' },
                slide2: { title: '', description: '' },
                slide3: { title: '', description: '' },
                slide4: { title: '', description: '' },
                slide5: { title: '', description: '' },
                slide6: { title: '', description: '' },
                slide7: { title: '', description: '' },
                slide8: { title: '', description: '' },
                slide9: { title: '', description: '' },
                slide10: { title: '', description: '' }
            });
            
        }
        
    }, [contexts.editId, contexts.data,posts]);

   

    const filteredSubSectors = subSectorsData.data.filter(subSector =>
        selectedSectors.includes(subSector.sectorId)
    );

    const filteredSignalSubCategories = subSignalsData.data.filter(subSignal =>
        selectedSignalCategories.includes(subSignal.signalId)
    );

    

    // ✅ Update selectedPosts when posts change
    // useEffect(() => {
    //     setSelectedPosts((prevSelectedPosts) =>
    //         prevSelectedPosts.map((post) => ({
    //             value: post.value,
    //             label: posts.find((p) => p._id === post.value)?.postTitle || post.label,
    //             includeInContainer: post.includeInContainer || false,
    //         }))
    //     );
    //     console.log("🔍 Debug: Posts in ContextForm:", posts); // ✅
    // }, [posts]); // ✅ Runs when posts update

    useEffect(() => {
        if (!posts || posts.length === 0) return; // ✅ Avoid running if posts are empty
    
        setSelectedPosts((prevSelectedPosts) =>
            prevSelectedPosts.map((post) => {
                const matchedPost = posts.find((p) => p._id === post.value);
                return {
                    value: post.value,
                    label: matchedPost ? matchedPost.postTitle || post.label : post.label,
                    includeInContainer: post.includeInContainer || false,
                };
            })
        );
    
        console.log("🔍 Debug: Updated Posts in ContextForm:", posts); // ✅ Debugging log
    }, [posts]); // ✅ Runs when posts update
    

    const handleSubmit = async (e) => {
        e.preventDefault();
         
        // ✅ Check Required Fields Before Submitting
    if (!contextTitle.trim()) {
        toast.warn("⚠️ Context Title is required.");
        return;
    }

    if (!date) {
        toast.warn("⚠️ Date is required.");
        return;
    }

    if (!containerType) {
        toast.warn("⚠️ Container Type is required.");
        return;
    }

    if (selectedThemes.length === 0) {
        toast.warn("⚠️ At least one theme must be selected.");
        return;
    }

    if (selectedPosts.length === 0) {
        toast.warn("⚠️ At least one post must be assigned to the context.");
        return;
    }
    
        try {
            const updatedPosts = selectedPosts.map(post => ({
                postId: post.value,
                includeInContainer: post.includeInContainer || false, // Preserve includeInContainer
            }));
    
            // Step 1: Fetch existing contexts tagged to each selected post
            const existingContextUpdates = await Promise.all(
                selectedPosts.map(async (post) => {
                    const postId = post.value;
                    const response = await axios.get(`/api/admin/posts/${postId}/contexts`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    return response.data; // tagged contexts for the post
                })
            );
    
            // Step 2: Update contexts with merged posts
            for (const taggedContexts of existingContextUpdates) {
                for (const taggedContext of taggedContexts) {
                    // Merge existing posts with new selected posts
                    const existingPosts = taggedContext.posts || [];
                    const mergedPosts = [...existingPosts, ...updatedPosts];
    
                    // Remove duplicates
                    const uniquePosts = Array.from(
                        new Map(mergedPosts.map(post => [post.postId, post])).values()
                    );
    
                    // Update the context with the new list of posts
                    await axios.put(`/api/admin/contexts/${taggedContext._id}`, {
                        posts: uniquePosts,
                    }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                }
            }
    
            // Step 3: Save or update the current context
            const formData = {
                contextTitle,
                date,
                containerType,
                isTrending,
                displayOrder,
                sectors: selectedSectors,
                subSectors: selectedSubSectors,
                signalCategories: selectedSignalCategories,
                signalSubCategories: selectedSignalSubCategories,
                themes: selectedThemes.map(theme => theme.value),
                posts: updatedPosts,
                bannerShow,
                homePageShow,
                bannerImage,
                otherImage,
                generalComment,
                dataForTypeNum,
                summary,
                hasSlider,
                slide1: slides.slide1,
                slide2: slides.slide2,
                slide3: slides.slide3,
                slide4: slides.slide4,
                slide5: slides.slide5,
                slide6: slides.slide6,
                slide7: slides.slide7,
                slide8: slides.slide8,
                slide9: slides.slide9,
                slide10: slides.slide10,
            };
    
            if (contexts.editId) {
                const response = await axios.put(`/api/admin/contexts/${contexts.editId}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                contextsDispatch({ type: 'UPDATE_CONTEXT', payload: response.data });
                handleFormSubmit('Context updated successfully');
                toast.success("✅ Context updated successfully!"); // ✅ Show success toast
                await fetchPosts(); // ✅ Fetch latest posts after adding a new one
            } else {
                const response = await axios.post('/api/admin/contexts', formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                contextsDispatch({ type: 'ADD_CONTEXT', payload: response.data });
                handleFormSubmit('Context added successfully');
                toast.success("✅ Context added successfully!"); // ✅ Show success toast
                await fetchPosts(); // ✅ Fetch latest posts after adding a new one
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            toast.error('An error occurred while submitting the form.');
        }
    };
        
    const containerTypeOptions = [
        { value: 'Type-One', label: 'Type-One' },
        { value: 'Type-Two', label: 'Type-Two' },
        { value: 'Type-Three', label: 'Type-Three' },
        { value: 'Type-Four', label: 'Type-Four' },
        { value: 'Type-Five', label: 'Type-Five' },
        { value: 'Type-Num', label: 'Type-Num' },
    ];

    const handleHomeNav = () => {
        setIsFormVisible(false);
    }

    const handleSlideChange = (slideNumber, field, value) => {
        setSlides(prevSlides => ({
            ...prevSlides,
            [slideNumber]: {
                ...prevSlides[slideNumber],
                [field]: value
            }
        }));
    };

    // Convert themesData into a format suitable for react-select
    const themeOptions = themesData.data.map(theme => ({
        value: theme._id,
        label: theme.themeTitle
    }));

    
// const postOptions = Array.isArray(posts) ? posts.map(post => ({
//     value: post._id,
//     label: post.postTitle
//   })) : [];
// const postOptions = Array.isArray(posts.data) && posts.data.length > 0
// ? posts.data.map(post => ({
//     value: post._id || post.id, // Ensure correct ID
//     label: post.postTitle || post.title || "Untitled Post" // Ensure correct title
// }))
// : [];
// console.log("🔍 Processed Post Options:", postOptions);

const postOptions = Array.isArray(posts.data) && posts.data.length > 0
    ? posts.data.map(post => ({
        value: post._id || post.id, // Ensure correct ID
        label: post.postTitle || post.title || "Untitled Post" // Ensure correct title
    }))
    : [];

console.log("🔍 Processed Post Options:", postOptions);

    return (
        <div className="context-form-container">
            <button type="button" className="submit-btn" onClick={() => setIsFormVisible(false)}>Context Home</button>
            <form onSubmit={handleSubmit} className="context-form">
                <label htmlFor="contextTitle"><b>Context Title</b></label>
                <input
                    id="contextTitle"
                    type="text"
                    placeholder="Context Title"
                    value={contextTitle}
                    onChange={(e) => setContextTitle(e.target.value)}
                    className="context-input"
                    required
                />

                 {/* Date Field */}
                 <label htmlFor="date"><b>Date</b></label>
                <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="context-input"
                    required
                />

                {/* Container Type Dropdown */}
                <label htmlFor="containerType"><b>Container Type</b></label>
                <Select
                    id="containerType"
                    options={containerTypeOptions}
                    value={containerTypeOptions.find(option => option.value === containerType)}
                    onChange={(selectedOption) => setContainerType(selectedOption.value)}
                    className="context-select"
                    required
                />

                <div className="checkbox-container">
                    <label htmlFor="isTrending" className="checkbox-label"><b>Is Trending?</b></label>
                    <input
                        id="isTrending"
                        type="checkbox"
                        checked={isTrending}
                        onChange={(e) => setIsTrending(e.target.checked)}
                        className="context-checkbox"
                    />
                </div>

                    <div >
                        <label htmlFor="displayOrder"><b>Display Order</b></label>
                        <input
                            id="displayOrder"
                            type="number"
                            placeholder="Display Order"
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(Number(e.target.value))}
                        />
                    </div>
                {/* Sectors and Sub-Sectors in one row */}
                <div className="row">
                    <div className="column">
                        <label htmlFor="sectors"><b>Sectors</b></label>
                        <select
                            id="sectors"
                            name="sectors"
                            value={selectedSectors}
                            onChange={(e) => setSelectedSectors(Array.from(e.target.selectedOptions, option => option.value))}
                            className="context-select"
                            multiple
                        >
                            {sectorsData.data.map(sector => (
                                <option key={sector._id} value={sector._id}>{sector.sectorName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="column">
                        <label htmlFor="subSectors"><b>Sub-Sectors</b></label>
                        <select
                            id="subSectors"
                            name="subSectors"
                            value={selectedSubSectors}
                            onChange={(e) => setSelectedSubSectors(Array.from(e.target.selectedOptions, option => option.value))}
                            className="context-select"
                            multiple
                        >
                            {subSectorsData.data.filter(subSector => selectedSectors.includes(subSector.sectorId)).map(subSector => (
                                <option key={subSector._id} value={subSector._id}>{subSector.subSectorName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Signal Categories and Sub-Categories in another row */}
                <div className="row">
                    <div className="column">
                        <label htmlFor="signalCategories"><b>Signal Categories</b></label>
                        <select
                            id="signalCategories"
                            name="signalCategories"
                            value={selectedSignalCategories}
                            onChange={(e) => setSelectedSignalCategories(Array.from(e.target.selectedOptions, option => option.value))}
                            className="context-select"
                            multiple
                        >
                            {signalsData.data.map(signal => (
                                <option key={signal._id} value={signal._id}>{signal.signalName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="column">
                        <label htmlFor="signalSubCategories"><b>Signal Sub-Categories</b></label>
                        <select
                            id="signalSubCategories"
                            name="signalSubCategories"
                            value={selectedSignalSubCategories}
                            onChange={(e) => setSelectedSignalSubCategories(Array.from(e.target.selectedOptions, option => option.value))}
                            className="context-select"
                            multiple
                        >
                            {subSignalsData.data.filter(subSignal => selectedSignalCategories.includes(subSignal.signalId)).map(subSignal => (
                                <option key={subSignal._id} value={subSignal._id}>{subSignal.subSignalName}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="row">
                        <div className="column">
                            <label htmlFor="themes"><b>Themes</b></label>
                            <Select
                                id="themes"
                                isMulti
                                options={themeOptions}
                                value={selectedThemes}
                                onChange={setSelectedThemes}
                                className="context-select"
                            />
                        </div>
                    </div>
                    <div className="row">
                    <div className="column">
                        <label htmlFor="posts"><b>Posts</b></label>
                        {/* <Select
                            id="posts"
                            isMulti
                            options={postOptions}
                            value={selectedPosts}
                            onChange={setSelectedPosts}
                            className="context-select"
                        /> */}
                        <Select
                            id="posts"
                            isMulti
                            options={postOptions}
                            value={selectedPosts}
                            onChange={setSelectedPosts}
                            getOptionLabel={(e) => e.label} // Ensure labels appear
                            getOptionValue={(e) => e.value} // Ensure values map correctly
                            className="context-select"
                        />

                    </div>
                </div>

                <div className="checkbox-container">
                    <label htmlFor="bannerShow" className="checkbox-label"><b>Show Banner?</b></label>
                    <input
                        id="bannerShow"
                        type="checkbox"
                        checked={bannerShow}
                        onChange={(e) => setBannerShow(e.target.checked)}
                        className="context-checkbox"
                    />
                </div>
                <div className="checkbox-container">
                    <label htmlFor="homePageShow" className="checkbox-label"><b>Show on Homepage?</b></label>
                    <input
                        id="homePageShow"
                        type="checkbox"
                        checked={homePageShow}
                        onChange={(e) => setHomePageShow(e.target.checked)}
                        className="context-checkbox"
                    />
                </div>
                <label htmlFor="bannerImage"><b>Banner Image URL</b></label>
                <input
                    id="bannerImage"
                    type="text"
                    placeholder="Banner Image URL"
                    name="bannerImage"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="context-input"
                />
                <label htmlFor="otherImage"><b>Other Image URL</b></label>
                <input
                    id="otherImage"
                    type="text"
                    placeholder="Other Image URL"
                    name="otherImage"
                    value={otherImage}
                    onChange={(e) => setOtherImage(e.target.value)}
                    className="context-input"
                />
                <label htmlFor="generalComment"><b>General Comment</b></label>
                <textarea
                    id="generalComment"
                    placeholder="General Comment"
                    name="generalComment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    className="context-textarea"
                />
                
                <label htmlFor="dataForTypeNum"><b>Data for Type-Num</b></label>
                <input
                    id="dataForTypeNum"
                    type="text"
                    placeholder="Enter data for Type-Num"
                    value={dataForTypeNum}
                    onChange={(e) => setDataForTypeNum(e.target.value)}
                    className="context-input"
                />
                
                {/* Summary */}
                <label htmlFor="summary"><b>Summary</b></label>
                <Quill
                    id="summary"
                    value={summary}
                    onChange={setSummary}
                    theme="snow"
                />

                {/* Slider Fields */}
                <div className="slider-container">
                    <label htmlFor="hasSlider" className="checkbox-label"><b>Has Slider?</b></label>
                    <input
                        id="hasSlider"
                        type="checkbox"
                        checked={hasSlider}
                        onChange={(e) => setHasSlider(e.target.checked)}
                        className="context-checkbox"
                    />
                    {hasSlider && (
                        <div className="slides-container">
                            {[...Array(10)].map((_, index) => {
                                const slideNumber = `slide${index + 1}`;
                                return (
                                    <div key={slideNumber} className="slide">
                                        <label htmlFor={`${slideNumber}Title`}><b>Slide {index + 1} Title</b></label>
                                        <input
                                            id={`${slideNumber}Title`}
                                            type="text"
                                            placeholder={`Slide ${index + 1} Title`}
                                            value={slides[slideNumber]?.title || ''}
                                            onChange={(e) => handleSlideChange(slideNumber, 'title', e.target.value)}
                                            className="context-input"
                                        />
                                        <label htmlFor={`${slideNumber}Description`}><b>Slide {index + 1} Description</b></label>
                                        <Quill
                                            id={`${slideNumber}Description`}
                                            value={slides[slideNumber]?.description || ''}
                                            onChange={(value) => handleSlideChange(slideNumber, 'description', value)}
                                            theme="snow"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <button type="submit" className="submit-btn">Save Context</button>
            </form>
        </div>
    );
}
