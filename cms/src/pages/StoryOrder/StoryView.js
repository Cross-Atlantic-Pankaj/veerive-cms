// import React, { useState, useEffect } from 'react';
// import axios from '../../config/axios'; // Adjust the import path if necessary

// export default function StoryView() {
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     const [storyOrders, setStoryOrders] = useState([]);
//     const [contexts, setContexts] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [sortConfig, setSortConfig] = useState({ key: 'publishDate', direction: 'desc' });

//     const handleDateChange = (e) => {
//         const { name, value } = e.target;
//         if (name === 'startDate') {
//             setStartDate(value);
//         } else if (name === 'endDate') {
//             setEndDate(value);
//         }
//     };

//     const fetchStoryOrders = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get('/api/admin/story-orders', {
//                 params: { startDate, endDate },
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             setStoryOrders(response.data);
//         } catch (err) {
//             console.error('Error fetching story orders:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchContexts = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get('/api/contexts', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             setContexts(response.data);
//         } catch (err) {
//             console.error('Error fetching contexts:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (startDate && endDate) {
//             fetchStoryOrders();
//         }
//     }, [startDate, endDate]);

//     useEffect(() => {
//         fetchContexts();
//     }, []);

//     const handleSort = (key) => {
//         setSortConfig(prevConfig => ({
//             key,
//             direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
//         }));
//     };

//     const sortedStoryOrders = [...storyOrders].sort((a, b) => {
//         if (a[sortConfig.key] < b[sortConfig.key]) {
//             return sortConfig.direction === 'asc' ? -1 : 1;
//         }
//         if (a[sortConfig.key] > b[sortConfig.key]) {
//             return sortConfig.direction === 'asc' ? 1 : -1;
//         }
//         return 0;
//     });

//     const contextMap = contexts.reduce((acc, context) => {
//         acc[context._id] = context.contextTitle;
//         return acc;
//     }, {});

//     return (
//         <div>
//             <h1>Story View</h1>
//             <div>
//                 <label>
//                     Start Date:
//                     <input
//                         type="date"
//                         name="startDate"
//                         value={startDate}
//                         onChange={handleDateChange}
//                     />
//                 </label>
//                 <label>
//                     End Date:
//                     <input
//                         type="date"
//                         name="endDate"
//                         value={endDate}
//                         onChange={handleDateChange}
//                     />
//                 </label>
//                 <button onClick={fetchStoryOrders} disabled={loading}>
//                     {loading ? 'Loading...' : 'Fetch Records'}
//                 </button>
//             </div>

//             {storyOrders.length > 0 && (
//                 <table>
//                     <thead>
//                         <tr>
//                             <th onClick={() => handleSort('publishDate')}>Publish Date {sortConfig.key === 'publishDate' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}</th>
//                             <th onClick={() => handleSort('contextTitle')}>Context Title {sortConfig.key === 'contextTitle' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}</th>
//                             <th>Rank</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {sortedStoryOrders.map(order => (
//                             <tr key={order._id}>
//                                 <td>{new Date(order.publishDate).toLocaleDateString()}</td>
//                                 <td>{contextMap[order.contextId]}</td>
//                                 <td>{order.rank}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//             {storyOrders.length === 0 && <p>No records available for the selected date range.</p>}
//         </div>
//     );
// }
import React, { useState, useEffect } from 'react';
import axios from '../../config/axios'; // Ensure correct API path
import { toast } from 'react-toastify'; //  Import Toastify
import 'react-toastify/dist/ReactToastify.css'; //  Import Toastify styles

export default function StoryView() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [storyOrders, setStoryOrders] = useState([]);
    const [contexts, setContexts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'publishDate', direction: 'desc' });
    const [shouldFetch, setShouldFetch] = useState(false);

    useEffect(() => {
        fetchContexts();
    }, []);

    useEffect(() => {
        if (shouldFetch) {
            fetchStoryOrders();
            setShouldFetch(false);
        }
    }, [shouldFetch]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startDate') {
            setStartDate(value);
        } else if (name === 'endDate') {
            setEndDate(value);
        }
    };

    const fetchStoryOrders = async () => {
        if (!contexts || contexts.length === 0) {
            console.log("⏳ Waiting for contexts before fetching story orders...");
            return; // ✅ Ensure `contexts` is loaded first
        }
    
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/story-orders', {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
    
            let orders = response.data;
            console.log("📢 Story Orders Response:", orders);
    
            // ✅ Remove story orders where `contextId` is not found in `contexts`
            const validContextIds = new Set(contexts.map(ctx => ctx._id));
            orders = orders.filter(order => validContextIds.has(order.contextId));
    
            // ✅ Map story orders to include the `contextTitle`
            const updatedOrders = orders.map(order => ({
                ...order,
                contextTitle: contextMap[order.contextId] || "🚨 No Title Found!"
            }));
            console.log("🗂 All Context IDs in contexts:", Array.from(validContextIds));
            const validOrders = orders.filter(order => contextMap[order.contextId]);
            console.log("📌 Final Story Orders Sent to UI:", validOrders.length);

                setStoryOrders(validOrders); // ✅ Ensure it only updates once

            if (updatedOrders.length > 0) {
                setStoryOrders(updatedOrders);
            } else {
                console.log("⚠️ No valid story orders found.");
                setStoryOrders([]); // ✅ Ensure empty array if no records
            }
        } catch (err) {
            console.error('❌ Error fetching story orders:', err);
        } finally {
            setLoading(false);
        }
    };
    
    
    const fetchContexts = async () => {
        setLoading(true);
        let allContexts = [];
        let currentPage = 1;
        let totalPages = 1;
    
        try {
            do {
                const response = await axios.get('/api/contexts', {
                    params: { page: currentPage, limit: 999 }, // ✅ Increase limit to fetch more at once
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
    
                if (response.data.success && Array.isArray(response.data.contexts)) {
                    allContexts = [...allContexts, ...response.data.contexts];
                    totalPages = response.data.totalPages;
                    currentPage++;
                } else {
                    console.error("⚠️ Invalid API response for contexts:", response.data);
                    break;
                }
            } while (currentPage <= totalPages);
    
            console.log("✅ Fetched ALL Contexts:", allContexts.length);
            console.log("✅ Contexts Fetched:", contexts.length);
            console.log("📌 All Context IDs:", contexts.map(ctx => ctx._id)); 

            setContexts(allContexts);
        } catch (err) {
            console.error('❌ Error fetching contexts:', err);
            setContexts([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleFetchRecords = async () => {
        setShouldFetch(false);
        await fetchContexts(); // ✅ Fetch contexts first
        fetchStoryOrders(); // ✅ Then fetch story orders
    };
    
    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedStoryOrders = [...storyOrders].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const contextMap = (Array.isArray(contexts) ? contexts : []).reduce((acc, context) => {
        if (context && context._id) {
            acc[context._id] = context.contextTitle?.trim() || "🚨 No Title Found!";
        }
        return acc;
    }, {});
    
    return (
        <div>
            <h1>Story View</h1>
            <div>
                <label>
                    Start Date:
                    <input
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={handleDateChange}
                    />
                </label>
                <label>
                    End Date:
                    <input
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={handleDateChange}
                    />
                </label>
                <button onClick={handleFetchRecords} disabled={loading}>
                    {loading ? 'Loading...' : 'Fetch Records'}
                </button>
            </div>

            {storyOrders.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('publishDate')}>
                                Publish Date {sortConfig.key === 'publishDate' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
                            </th>
                            <th onClick={() => handleSort('contextTitle')}>
                                Context Title {sortConfig.key === 'contextTitle' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
                            </th>
                            <th>Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStoryOrders.map(order => (
                            <tr key={order._id}>
                                <td>{new Date(order.publishDate).toLocaleDateString()}</td>
                                <td>{contextMap[order.contextId]}</td>
                                <td>{order.rank}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No records available for the selected date range.</p>
            )}
        </div>
    );
}
