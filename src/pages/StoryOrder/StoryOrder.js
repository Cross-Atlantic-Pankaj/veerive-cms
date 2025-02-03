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
        if (name === 'startDate') setStartDate(value);
        else if (name === 'endDate') setEndDate(value);
    };

    const handlePublishDateChange = (e) => {
        setPublishDate(e.target.value);
    };

    // Fetch posts based on selected date range
    const fetchPosts = async () => {
        if (!startDate || !endDate) {
            alert("Please select start and end dates before fetching.");
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/posts/date', {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPosts(response.data);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch contexts related to posts
    const fetchContexts = async () => {
        if (posts.length === 0) return;
        
        setLoading(true);
        try {
            const postIds = posts.map(post => post._id);
            const response = await axios.get('/api/contexts', {
                params: { postIds },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setContexts(response.data);
        } catch (err) {
            console.error('Error fetching contexts:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch existing story orders
    const fetchStoryOrders = async () => {
        if (contexts.length === 0) return;

        setLoading(true);
        try {
            const response = await axios.get('/api/admin/story-orders', {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const orders = response.data;

            if (orders.length > 0) {
                setPublishDate(new Date(orders[0].publishDate).toISOString().split('T')[0]);
            }

            const newRank = {};
            orders.forEach(order => {
                const context = contexts.find(ctx => ctx._id === order.contextId);
                if (context) {
                    newRank[context.contextTitle] = order.rank;
                }
            });

            setRank(newRank);
        } catch (err) {
            console.error('Error fetching story orders:', err);
        } finally {
            setLoading(false);
        }
    };

    // Save or update story orders
    // const handleSave = async () => {
    //     if (!publishDate) {
    //         alert("Please select a publish date.");
    //         return;
    //     }
    
    //     try {
    //         const existingOrdersResponse = await axios.get('/api/admin/story-orders', {
    //             params: { publishDate },
    //             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    //         });
    
    //         const existingOrders = existingOrdersResponse.data;
    
    //         const storyOrders = Object.entries(rank).map(([contextTitle, contextRank]) => {
    //             const contextId = contexts.find(context => context.contextTitle === contextTitle)._id;
    
    //             const existingOrder = existingOrders.find(order =>
    //                 order.contextId.toString() === contextId.toString() &&
    //                 new Date(order.publishDate).toISOString() === new Date(publishDate).toISOString()
    //             );
    
    //             return {
    //                 publishDate,
    //                 contextId,
    //                 rank: contextRank,
    //                 _id: existingOrder ? existingOrder._id : null
    //             };
    //         });
    
    //         await Promise.all(storyOrders.map(async order => {
    //             if (order._id) {
    //                 await axios.put(`/api/admin/story-orders/${order._id}`, {
    //                     rank: order.rank
    //                 }, {
    //                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    //                 });
    //             } else {
    //                 await axios.post('/api/admin/story-orders', {
    //                     publishDate: order.publishDate,
    //                     contextId: order.contextId,
    //                     rank: order.rank
    //                 }, {
    //                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    //                 });
    //             }
    //         }));
    
    //         console.log('Story orders saved successfully');
    
    //         // **Fetch latest data after saving**
    //         fetchStoryOrders();
    
    //     } catch (err) {
    //         console.error('Error saving story orders:', err);
    //     }
    // };
    const handleSave = async () => {
        if (!publishDate || !startDate || !endDate) {
            alert("Please select a publish date, start date, and end date.");
            return;
        }
    
        try {
            console.log("Saving Story Orders for:", publishDate, startDate, endDate);
    
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
                    publishDate: new Date(publishDate).toISOString(), // Convert to ISO format
                    contextId: context._id,
                    rank: contextRank,
                    _id: existingOrder ? existingOrder._id : null
                };
            }).filter(Boolean);
    
            console.log("Final Story Orders Payload:", storyOrders);
    
            await Promise.all(storyOrders.map(async order => {
                if (order._id) {
                    // await axios.put(`/api/admin/story-orders/${order._id}`, {
                    //     rank: order.rank
                    // }, {
                    //     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    // });
                    await axios.put(`/api/admin/story-orders/${order._id}`, {
                        publishDate: new Date(order.publishDate).toISOString(), // Ensure correct date format
                        contextId: order.contextId,
                        rank: parseInt(order.rank) // Ensure rank is a number
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
    
            console.log('Story orders saved successfully');
            fetchStoryOrders();
    
        } catch (err) {
            console.error('Error saving story orders:', err);
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

    const contextMap = contexts.reduce((acc, context) => {
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
    }, {});

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
