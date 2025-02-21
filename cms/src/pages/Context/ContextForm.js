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
    const{  fetchPosts} = useContext(PostContext)

    // State for form inputs
    const [posts, setPosts] = useState([]); // ✅ Store posts locally inside the component
    const [selectedPosts, setSelectedPosts] = useState([]); // ✅ Local selected posts state
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
    //const [selectedPosts, setSelectedPosts] = useState([]); // New state for selected posts
    const [bannerShow, setBannerShow] = useState(false);
    const [homePageShow, setHomePageShow] = useState(false);
    const [bannerImage, setBannerImage] = useState('');
    const [otherImage, setOtherImage] = useState('');
    const [generalComment, setGeneralComment] = useState('');
    const [dataForTypeNum, setDataForTypeNum] = useState('');
    const [summary, setSummary] = useState('');
    const [postOptions, setPostOptions] = useState([]); // ✅ Store processed post options
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

   // ✅ Fix: Fetch posts only if they are not already fetched

    const fetchAllPosts = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("❌ No token found, user might be logged out.");
            return;
        }

        try {
            console.log("🔄 Fetching ALL posts inside ContextForm...");
            const response = await axios.get(`/api/admin/posts/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                console.log("✅ Successfully fetched All Posts:", response.data.posts.length);
                setPosts(response.data.posts); // ✅ Store posts locally inside ContextForm
            }
        } catch (err) {
            console.error("❌ Error fetching all posts:", err);
        }
    };

    useEffect(() => {
        if (!posts || posts.length === 0) {
            console.log("🔄 Fetching all posts for Context Form...");
            fetchAllPosts();
        } else {
            console.log("✅ All posts already loaded in ContextForm:", posts.length);
        }
    }, [posts]);

    
    // useEffect(() => {
        
    //     if (contexts.editId && posts?.data?.length > 0) {
    //         const context = contexts.data.find((ele) => ele._id === contexts.editId);
    //         if (context) {
    //             setContextTitle(context.contextTitle);
    //             setDate(new Date(context.date).toISOString().substring(0, 10)); // Set the date field
    //             setContainerType(context.containerType || 'Type-One'); // Set container type
    //             setIsTrending(context.isTrending);
    //             setDisplayOrder(context.displayOrder);
    //             setSelectedSectors(context.sectors || []);
    //             setSelectedSubSectors(context.subSectors || []);
    //             setSelectedSignalCategories(context.signalCategories || []);
    //             setSelectedSignalSubCategories(context.signalSubCategories || []);
                
    //             // Set selected themes with the correct format for react-select
    //             setSelectedThemes(context.themes.map(themeId => ({
    //                 value: themeId,
    //                 label: themesData.data.find(theme => theme._id === themeId)?.themeTitle || ''
    //             })));
                
    //             setSelectedPosts(
    //             context.posts.map(post => {
    //                 const matchedPost = posts.data.find(p => p._id === post.postId);
    //                 return {
    //                     value: post.postId,
    //                     label: matchedPost?.postTitle && matchedPost.postTitle.trim() !== "" 
    //                         ? matchedPost.postTitle 
    //                         : "No Title Available",
    //                     includeInContainer: post.includeInContainer
    //                 };
    //             })
    //         );
        
    //             setBannerShow(context.bannerShow);
    //             setHomePageShow(context.homePageShow);
    //             setBannerImage(context.bannerImage || '');
    //             setOtherImage(context.otherImage || '');
    //             setGeneralComment(context.generalComment || '');
    //             setDataForTypeNum(context.dataForTypeNum || '');
    //             setSummary(context.summary || '');
    //             setHasSlider(context.hasSlider || false);
    //             setSlides({
    //                 slide1: context.slide1 || { title: '', description: '' },
    //                 slide2: context.slide2 || { title: '', description: '' },
    //                 slide3: context.slide3 || { title: '', description: '' },
    //                 slide4: context.slide4 || { title: '', description: '' },
    //                 slide5: context.slide5 || { title: '', description: '' },
    //                 slide6: context.slide6 || { title: '', description: '' },
    //                 slide7: context.slide7 || { title: '', description: '' },
    //                 slide8: context.slide8 || { title: '', description: '' },
    //                 slide9: context.slide9 || { title: '', description: '' },
    //                 slide10: context.slide10 || { title: '', description: '' }
    //             });
    //         }
    //     } else {
    //         setContextTitle('');
    //         setDate('');
    //         setContainerType('');
    //         setIsTrending(false);
    //         setSelectedSectors([]);
    //         setSelectedSubSectors([]);
    //         setSelectedSignalCategories([]);
    //         setSelectedSignalSubCategories([]);
    //         setSelectedThemes([]);
    //         setSelectedPosts([]); // Reset posts when adding a new context
    //         setBannerShow(false);
    //         setHomePageShow(false);
    //         setBannerImage('');
    //         setOtherImage('');
    //         setGeneralComment('');
    //         setDataForTypeNum('');
    //         setSummary('');
    //         setHasSlider(false);
    //         setSlides({
    //             slide1: { title: '', description: '' },
    //             slide2: { title: '', description: '' },
    //             slide3: { title: '', description: '' },
    //             slide4: { title: '', description: '' },
    //             slide5: { title: '', description: '' },
    //             slide6: { title: '', description: '' },
    //             slide7: { title: '', description: '' },
    //             slide8: { title: '', description: '' },
    //             slide9: { title: '', description: '' },
    //             slide10: { title: '', description: '' }
    //         });
            
    //     }
        
    // }, [contexts.editId, contexts.data,posts.data]);

    useEffect(() => {
        if (contexts.editId && Array.isArray(posts) && posts.length > 0) {
            console.log("✏️ Editing Context Data, Pre-filling form...");
    
            const context = contexts.data.find((ele) => ele._id === contexts.editId);
            if (context) {
                setContextTitle(context.contextTitle);
                setDate(new Date(context.date).toISOString().substring(0, 10)); // ✅ Set the date field
                setContainerType(context.containerType || 'Type-One'); // ✅ Set container type
                setIsTrending(context.isTrending);
                setDisplayOrder(context.displayOrder);
                setSelectedSectors(context.sectors || []);
                setSelectedSubSectors(context.subSectors || []);
                setSelectedSignalCategories(context.signalCategories || []);
                setSelectedSignalSubCategories(context.signalSubCategories || []);
                
                // ✅ Set selected themes with the correct format for react-select
                setSelectedThemes(context.themes.map(themeId => ({
                    value: themeId,
                    label: themesData.data.find(theme => theme._id === themeId)?.themeTitle || ''
                })));
    
                // ✅ Fix: Set Selected Posts Correctly
                setSelectedPosts(
                    Array.from(new Map(
                        context.posts
                            .filter(post => posts.some(existingPost => existingPost._id === post.postId)) // ✅ Remove deleted posts
                            .map(post => {
                                const matchedPost = posts.find(p => p._id === post.postId);
                                return [
                                    post.postId, 
                                    {
                                        value: post.postId,
                                        label: matchedPost?.postTitle?.trim() || "Untitled Post",
                                        includeInContainer: post.includeInContainer || false
                                    }
                                ];
                            })
                    ).values()) 
                );
                
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
            console.log("➖ No Edit Mode, Resetting Form...");
            setContextTitle('');
            setDate('');
            setContainerType('');
            setIsTrending(false);
            setSelectedSectors([]);
            setSelectedSubSectors([]);
            setSelectedSignalCategories([]);
            setSelectedSignalSubCategories([]);
            setSelectedThemes([]);
            setSelectedPosts([]); // ✅ Reset posts when adding a new context
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
    }, [contexts.editId, contexts.data, posts]); // ✅ Fix: Use `posts` directly
    
   

    const filteredSubSectors = subSectorsData.data.filter(subSector =>
        selectedSectors.includes(subSector.sectorId)
    );

    const filteredSignalSubCategories = subSignalsData.data.filter(subSignal =>
        selectedSignalCategories.includes(subSignal.signalId)
    );

    

    // ✅ Update selectedPosts when posts change
    useEffect(() => {
        
        if (!posts?.data || !Array.isArray(posts.data) || posts.data.length === 0) return; // ✅ Ensure posts.data is an array
        setSelectedPosts((prevSelectedPosts) =>
            prevSelectedPosts.map((post) => {
                // const matchedPost = posts.find((p) => p._id === post.value);
                const matchedPost = Array.isArray(posts.data) ? posts.data.find((p) => p._id === post.value) : undefined;

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


    
        try {
            
            const updatedPosts = selectedPosts.length > 0 
                ? selectedPosts.map(post => ({
                    postId: post.value,
                    includeInContainer: post.includeInContainer || false, 
                }))
                : []; // Ensures an empty array if no posts are selected

    
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
                // themes: selectedThemes.map(theme => theme.value),
                themes: selectedThemes.length > 0 ? selectedThemes.map(theme => theme.value) : [], // ✅ Allow empty array
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
                //await fetchAllPosts();
            } else {
                const response = await axios.post('/api/admin/contexts', formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                contextsDispatch({ type: 'ADD_CONTEXT', payload: response.data });
                handleFormSubmit('Context added successfully');
                toast.success("✅ Context added successfully!"); // ✅ Show success toast
                 await fetchPosts(); // ✅ Fetch latest posts after adding a new one
                //await fetchAllPosts();
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



// ✅ Process `postOptions` AFTER `posts` state updates
useEffect(() => {
    console.log("🔄 Updating Post Options after fetching posts...");
    if (Array.isArray(posts) && posts.length > 0) {
        setPostOptions(posts.map(post => ({
            value: post._id, 
            label: post.postTitle || "Untitled Post",
            key: post._id // ✅ Ensure each item has a unique key
        })));
        
    } else {
        setPostOptions([]); // ✅ Ensure an empty array if no posts
    }
    console.log("🔍 Processed Post Options:", postOptions);
}, [posts]); // ✅ Runs only when `posts` state updates

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

                <div className="form-group">
                        <label htmlFor="containerType"><b>Container Type</b></label>
                        <Select
                            id="containerType"
                            options={containerTypeOptions}
                            value={containerTypeOptions.find(option => option.value === containerType)}
                            onChange={(selectedOption) => setContainerType(selectedOption.value)}
                            className="context-select"
                            menuPlacement="auto"
                            menuPosition="fixed"
                            menuShouldScrollIntoView={false}
                        />
                    </div>

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
                        {/* Sectors Multi-Select Dropdown */}
                        <div className="column">
                            <label htmlFor="sectors"><b>Sectors</b></label>
                            <Select
                                id="sectors"
                                isMulti
                                options={sectorsData.data.map(sector => ({
                                    value: sector._id,
                                    label: sector.sectorName
                                }))}
                                value={selectedSectors.map(sectorId => ({
                                    value: sectorId,
                                    label: sectorsData.data.find(sector => sector._id === sectorId)?.sectorName || ''
                                }))}
                                onChange={(selectedOptions) => setSelectedSectors(selectedOptions.map(option => option.value))}
                                className="context-select"
                                menuPlacement="auto"
                                menuPosition="fixed"
                                menuShouldScrollIntoView={false}
                            />
                        </div>

                        {/* Sub-Sectors Multi-Select Dropdown (Filtered by Selected Sectors) */}
                        <div className="column">
                            <label htmlFor="subSectors"><b>Sub-Sectors</b></label>
                            <Select
                                id="subSectors"
                                isMulti
                                options={subSectorsData.data
                                    .filter(subSector => selectedSectors.includes(subSector.sectorId))
                                    .map(subSector => ({
                                        value: subSector._id,
                                        label: subSector.subSectorName
                                    }))}
                                value={selectedSubSectors.map(subSectorId => ({
                                    value: subSectorId,
                                    label: subSectorsData.data.find(subSector => subSector._id === subSectorId)?.subSectorName || ''
                                }))}
                                onChange={(selectedOptions) => setSelectedSubSectors(selectedOptions.map(option => option.value))}
                                className="context-select"
                                menuPlacement="auto"
                                menuPosition="fixed"
                                menuShouldScrollIntoView={false}
                            />
                        </div>
                    </div>
                {/* Signal Categories and Sub-Categories in another row */}
                {/* <div className="row">
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
                </div> */}
                
                    {/* Signal Categories and Sub-Categories in one row */}
                    <div className="row">
                        {/* Signal Categories Multi-Select Dropdown */}
                        <div className="column">
                            <label htmlFor="signalCategories"><b>Signal Categories</b></label>
                            <Select
                                id="signalCategories"
                                isMulti
                                options={signalsData.data.map(signal => ({
                                    value: signal._id,
                                    label: signal.signalName
                                }))}
                                value={selectedSignalCategories.map(signalId => ({
                                    value: signalId,
                                    label: signalsData.data.find(signal => signal._id === signalId)?.signalName || ''
                                }))}
                                onChange={(selectedOptions) => setSelectedSignalCategories(selectedOptions.map(option => option.value))}
                                className="context-select"
                                menuPlacement="auto"
                                menuPosition="fixed"
                                menuShouldScrollIntoView={false}
                            />
                        </div>

                        {/* Signal Sub-Categories Multi-Select Dropdown (Filtered by Selected Signal Categories) */}
                        <div className="column">
                            <label htmlFor="signalSubCategories"><b>Signal Sub-Categories</b></label>
                            <Select
                                id="signalSubCategories"
                                isMulti
                                options={subSignalsData.data
                                    .filter(subSignal => selectedSignalCategories.includes(subSignal.signalId))
                                    .map(subSignal => ({
                                        value: subSignal._id,
                                        label: subSignal.subSignalName
                                    }))}
                                value={selectedSignalSubCategories.map(subSignalId => ({
                                    value: subSignalId,
                                    label: subSignalsData.data.find(subSignal => subSignal._id === subSignalId)?.subSignalName || ''
                                }))}
                                onChange={(selectedOptions) => setSelectedSignalSubCategories(selectedOptions.map(option => option.value))}
                                className="context-select"
                                menuPlacement="auto"
                                menuPosition="fixed"
                                menuShouldScrollIntoView={false}
                            />
                        </div>
                    </div>
                    {/* Themes Multi-Select Dropdown */}
                        <div className="row">
                        <div className="column">
                            <label htmlFor="themes"><b>Themes</b></label>
                            <Select
                                id="themes"
                                isMulti
                                options={themeOptions}
                                value={selectedThemes}
                                onChange={setSelectedThemes}
                                className="theme-select"
                                menuPlacement="auto"
                                menuPosition="fixed"
                                menuShouldScrollIntoView={false} // ✅ Prevent auto-scroll issue
                            />
                        </div>
                    </div>

                    {/* Posts Multi-Select Dropdown */}
                    <div className="row">
                    <div className="column">
                        <label htmlFor="posts"><b>Posts</b></label>
                        <Select
                            id="posts"
                            isMulti
                            options={postOptions}
                            value={selectedPosts}
                            onChange={setSelectedPosts}
                            getOptionLabel={option => option.label}
                            getOptionValue={option => option.value}
                            isClearable
                            className="context-select"
                            menuPlacement="bottom"  // ✅ Ensures dropdown appears close to field
                            menuPosition="fixed"
                            styles={{
                                menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999, /* ✅ Prevents dropdown from being hidden */
                                }),
                            }}
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
