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
        if (!endDate) {
            toast.error('Please select an End Date before fetching records!');
            return;
        }
    
        // Convert date to proper format
        const formattedStartDate = new Date(startDate).toISOString().split("T")[0];
        const formattedEndDate = new Date(endDate).toISOString().split("T")[0];
    
        console.log("Fetching with:", formattedStartDate, formattedEndDate); // Debugging
    
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/story-orders', {
                params: { startDate: formattedStartDate, endDate: formattedEndDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
    
            console.log("API Response:", response.data); // Debugging
    
            setStoryOrders(response.data);
        } catch (err) {
            console.error('Error fetching story orders:', err);
            toast.error('Error fetching records! Please try again.');
        } finally {
            setLoading(false);
        }
    };
    

    const fetchContexts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/contexts', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setContexts(response.data);
        } catch (err) {
            console.error('Error fetching contexts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchRecords = () => {
        setShouldFetch(true);
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

    const contextMap = contexts.reduce((acc, context) => {
        acc[context._id] = context.contextTitle;
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
