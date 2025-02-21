import React, { useState, useEffect } from 'react';
import axios from '../../config/axios'; // Ensure correct API path
import '../../html/css/StoryComponent.css'; // Import CSS

export default function StoryOrder() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [posts, setPosts] = useState([]);
    const [contexts, setContexts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [publishDate, setPublishDate] = useState('');
    const [rank, setRank] = useState({});

    // Handle changes in rank input fields
    const handleRankChange = (contextTitle, value) => {
        setRank(prevRank => ({
            ...prevRank,
            [contextTitle]: value
        }));
    };

    // Handle date selection
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startDate') {
            setStartDate(value);
        } else if (name === 'endDate') {
            setEndDate(value);
        }
    };
    

    const handlePublishDateChange = (e) => {
        setPublishDate(e.target.value);
    };

    const fetchPosts = async () => {
        if (!startDate || !endDate) {
            alert("⚠️ Please select start and end dates before fetching.");
            return;
        }
    
        setLoading(true);
        setPublishDate(''); // ✅ Reset publishDate before fetching posts
    
        try {
            console.log("🔄 Fetching ALL posts within date range...");
            const response = await axios.get('/api/admin/posts/all', {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
    
            if (response.data.success) {
                console.log("✅ Successfully fetched ALL posts:", response.data.posts.length);
                setPosts(response.data.posts); // ✅ Store all posts
            }
        } catch (err) {
            console.error('❌ Error fetching all posts:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchContexts = async () => {
        if (posts.length === 0) return;
    
        setLoading(true);
        let allContexts = [];
        let currentPage = 1;
        const limit = 999; // ✅ Increase the limit to reduce API calls
        let totalPages = 1;
    
        const postIds = posts.map(post => post._id); // ✅ Get all post IDs
    
        try {
            do {
                console.log(`🔄 Fetching ALL contexts - Page ${currentPage}`);
                const response = await axios.get('/api/admin/contexts/all', { // ✅ Fetch ALL contexts
                    params: { postIds, page: currentPage, limit },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
    
                if (Array.isArray(response.data.contexts)) {
                    allContexts = [...allContexts, ...response.data.contexts];
                }
    
                totalPages = response.data.totalPages;
                currentPage++;
            } while (currentPage <= totalPages); // ✅ Fetch all pages
    
            console.log("✅ Final Contexts Fetched:", allContexts.length);
            setContexts(allContexts);
        } catch (err) {
            console.error('❌ Error fetching all contexts:', err);
            setContexts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStoryOrders = async () => {
        if (contexts.length === 0) return;
    
        setLoading(true);
        setPublishDate(''); // ✅ Reset publishDate before fetching new data
    
        try {
            const response = await axios.get('/api/admin/story-orders', {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
    
            const orders = response.data;
            console.log("📢 Story Orders Response:", orders);
    
            if (orders.length > 0) { 
                // ✅ Find the most recent publishDate
                const latestPublishDate = orders
                    .map(order => new Date(order.publishDate))
                    .sort((a, b) => b - a)[0]; // Get the most recent date
    
                if (latestPublishDate) {
                    setPublishDate(latestPublishDate.toISOString().split('T')[0]); // ✅ Update the UI
                } else {
                    console.log("❌ No valid publishDate found.");
                    setPublishDate(''); // ✅ Ensure it remains empty if no orders exist
                }
            } else {
                console.log("❌ No existing story orders found.");
                setPublishDate(''); // ✅ Ensure it remains empty if no orders exist
            }
    
            // ✅ Update Rank Data
            const newRank = {};
            orders.forEach(order => {
                const context = contexts.find(ctx => ctx._id === order.contextId);
                if (context) {
                    newRank[context.contextTitle] = order.rank;
                }
            });
    
            setRank(newRank);
        } catch (err) {
            console.error('❌ Error fetching story orders:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = async () => {
        if (!publishDate || !startDate || !endDate) {
            alert("⚠️ Please select a publish date, start date, and end date.");
            return;
        }
    
        try {
            console.log("📢 Saving Story Orders for:", publishDate, startDate, endDate);
    
            const existingOrdersResponse = await axios.get('/api/admin/story-orders', {
                params: { startDate, endDate, publishDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
    
            console.log("Existing Story Orders:", existingOrdersResponse.data);
            const existingOrders = existingOrdersResponse.data;
    
            const storyOrders = Object.entries(rank).map(([contextTitle, contextRank]) => {
                const context = contexts.find(context => context.contextTitle === contextTitle);
                if (!context) return null;
    
                const existingOrder = existingOrders.find(order =>
                    order.contextId.toString() === context._id.toString() &&
                    new Date(order.publishDate).toISOString() === new Date(publishDate).toISOString()
                );
    
                return {
                    publishDate: new Date(publishDate).toISOString(),
                    contextId: context._id,
                    rank: contextRank,
                    _id: existingOrder ? existingOrder._id : null
                };
            }).filter(Boolean);
    
            console.log("✅ Final Story Orders Payload:", storyOrders);
    
            await Promise.all(storyOrders.map(async order => {
                if (order._id) {
                    await axios.put(`/api/admin/story-orders/${order._id}`, {
                        publishDate: new Date(order.publishDate).toISOString(),
                        contextId: order.contextId,
                        rank: parseInt(order.rank)
                    }, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                } else {
                    await axios.post('/api/admin/story-orders', {
                        publishDate: order.publishDate,
                        contextId: order.contextId,
                        rank: order.rank
                    }, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                }
            }));
    
            console.log('✅ Story orders saved successfully');
    
            // ✅ Clear the publish date after saving
            setPublishDate('');
            alert("✅ Story Orders Saved Successfully!");
    
            fetchStoryOrders(); // ✅ Refresh Story Orders
    
        } catch (err) {
            console.error('❌ Error saving story orders:', err);
        }
    };
    
    // Fetch contexts only after posts are fetched
    useEffect(() => {
        if (posts.length > 0) {
            fetchContexts();
        } else {
            setContexts([]);
        }
    }, [posts]);

    // Fetch story orders after contexts are loaded
    useEffect(() => {
        if (contexts.length > 0) {
            fetchStoryOrders();
        }
    }, [contexts]);

        const contextMap = (Array.isArray(contexts) ? contexts : []).reduce((acc, context) => {
        if (context.posts && Array.isArray(context.posts)) {
            const postTitles = posts
                .filter(post => context.posts.some(p => p.postId === post._id))
                .map(post => post.postTitle);
    
            if (postTitles.length > 0) {
                acc[context.contextTitle] = {
                    postTitles,
                    isTrending: context.isTrending,
                    rank: rank[context.contextTitle] || ''
                };
            }
        }
        return acc;
    }, {})  // ✅ Prevents `.reduce()` from running if `contexts` is not an array
    
    return (
        <div className="story-order-container">
            <h1>Story Order</h1>

            <div className="form-controls">
                <label>Start Date: <input type="date" name="startDate" value={startDate} onChange={handleDateChange} /></label>
                <label>End Date: <input type="date" name="endDate" value={endDate} onChange={handleDateChange} /></label>
                <button onClick={fetchPosts} disabled={loading}>
                    {loading ? 'Loading...' : 'Fetch Posts'}
                </button>
            </div>

            {posts.length > 0 && contexts.length > 0 ? (
                <div className="table-container">
                    <h2>Context and Posts</h2>
                    <label>
                        Publish Date:
                        <input type="date" name="publishDate" value={publishDate} onChange={handlePublishDateChange} />
                        <button onClick={handleSave} className="save-btn">Save</button>
                    </label>

                    <table>
                        <thead>
                            <tr><th>Context Title</th><th>Post Titles</th><th>Trending?</th><th>Rank</th></tr>
                        </thead>
                        <tbody>
                            {Object.entries(contextMap).map(([contextTitle, { postTitles, isTrending, rank }]) => (
                                <tr key={contextTitle} className={isTrending ? 'trending-context' : ''}>
                                    <td>{contextTitle}</td>
                                    <td>{postTitles.join(', ')}</td>
                                    <td>{isTrending ? 'Yes' : 'No'}</td>
                                    <td><input type="number" value={rank || ''} onChange={(e) => handleRankChange(contextTitle, e.target.value)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="no-data">No posts available for the selected date range.</p>
            )}
        </div>
    );
}
