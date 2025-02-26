import React, { useContext, useState, useMemo, useEffect } from 'react'; // Importing necessary hooks and components from React
import ContextContext from '../../context/ContextContext'; // Importing the context for managing global state
import axios from '../../config/axios'; // Importing axios instance for making HTTP requests
import '../../html/css/Context.css'; // Importing the CSS file for styling the component
import { format} from 'date-fns';
import { toast } from 'react-toastify'; // ✅ Import toast
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import toast styles


// Defining the ContextList functional component
export default function ContextList() {
    // Destructuring necessary state and functions from ContextContext
    const { contexts, contextsDispatch, handleAddClick, handleEditClick,searchQuery, setSearchQuery, sectors, subSectors, themes, signals, subSignals ,setIsLoading, fetchContexts} = useContext(ContextContext);
    const { page, setPage, totalPages } = useContext(ContextContext);  // ✅ Use global state
    const { allThemes } = useContext(ContextContext); // ✅ Use allThemes
    // Local state to manage the search query and sorting configuration
    // const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'contextTitle', direction: 'ascending' });
    // const [page, setPage] = useState(1);
    // const [totalPages, setTotalPages] = useState(1);  // ✅ Store totalPages in state
    const [contextsData, setContextsData] = useState([]); // ✅ New local state for rendering

useEffect(() => {
    // ✅ Update local state whenever contexts are updated
    setContextsData(contexts.data || []);
}, [contexts.data]);  // ✅ Ensures UI updates correctly

useEffect(() => {
    const savedPage = localStorage.getItem("contextPage");
    if (savedPage) {
        setPage(parseInt(savedPage)); // ✅ Restore last viewed page on reload
    }
}, []);

useEffect(() => {
    if (page) {
        localStorage.setItem("contextPage", page); // ✅ Store last visited page
    }
}, [page]);

    // // Fetch contexts from the API on component mount or when the context changes

    useEffect(() => {
        const fetchContexts = async () => {
            setIsLoading(true);
    
            try {
                const apiUrl = searchQuery.trim()
                    ? `/api/admin/contexts/all?search=${encodeURIComponent(searchQuery)}`
                    : `/api/admin/contexts?page=${page}&limit=10`;
    
                console.log(`🔍 Fetching contexts from: ${apiUrl}`);
    
                const response = await axios.get(apiUrl, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
    
                if (response.data.success) {
                    contextsDispatch({ 
                        
                        type: "SET_CONTEXTS", 
                        payload: { 
                            contexts: response.data.contexts, 
                            totalPages: searchQuery.trim() ? 1 : response.data.totalPages, 
                            page: searchQuery.trim() ? 1 : response.data.page
                        } 
                    });
                
                }
            } catch (err) {
                console.error("❌ Error fetching contexts:", err);
                toast.error("❌ Error fetching contexts.");
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchContexts();
    }, [page, searchQuery]); // ✅ Fetch when `page` or `searchQuery` changes
    
    
    // Helper function to get sector names from IDs
    const getSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if IDs are not an array
        const sectorNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the sector by ID
            return item ? item.sectorName : 'Unknown'; // Return the sector name or 'Unknown' if not found
        });
        return sectorNames.join(', '); // Join sector names with a comma
    };

    // Helper function to get sub-sector names from IDs
    const getSubSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if IDs are not an array
        const subSectorNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the sub-sector by ID
            return item ? item.subSectorName : 'Unknown'; // Return the sub-sector name or 'Unknown' if not found
        });
        return subSectorNames.join(', '); // Join sub-sector names with a comma
    };

    // Helper function to get signal names from IDs
    const getSignalNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if IDs are not an array
        const signalNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the signal by ID
            return item ? item.signalName : 'Unknown'; // Return the signal name or 'Unknown' if not found
        });
        return signalNames.join(', '); // Join signal names with a comma
    };

    // Helper function to get theme names from IDs
    // const getThemeNames = (ids, data) => {
    //     if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if IDs are not an array
    //     const themeNames = ids.map(id => {
    //         const item = data.find(ele => ele._id === id); // Find the theme by ID
    //         return item ? item.themeTitle : 'Unknown'; // Return the theme title or 'Unknown' if not found
    //     });
    //     return themeNames.join(', '); // Join theme titles with a comma
    // };
    const getThemeNames = (ids) => {
        if (!Array.isArray(ids)) return 'Unknown';
        
        return ids.map(id => {
            const matchedTheme = allThemes.find(theme => theme._id === id);
            return matchedTheme ? matchedTheme.themeTitle : 'Unknown Theme';
        }).join(', ');
    };

    // Memoized sortedContexts to avoid re-sorting on every render
    const sortedContexts = useMemo(() => {
        let sortableContexts = [...(contexts.data || [])]; // Clone the contexts data array

        if (sortConfig !== null) {
            sortableContexts.sort((a, b) => {
                let aValue, bValue;

                // Determine the value to be compared based on the sorting key
                switch (sortConfig.key) {
                    case 'contextTitle':
                        aValue = a.contextTitle;
                        bValue = b.contextTitle;
                        break;
                    case 'sectors':
                        aValue = getSectorNames(a.sectors, sectors.data);
                        bValue = getSectorNames(b.sectors, sectors.data);
                        break;
                    case 'subSectors':
                        aValue = getSubSectorNames(a.subSectors, subSectors.data);
                        bValue = getSubSectorNames(b.subSectors, subSectors.data);
                        break;
                    case 'signalCategories':
                        aValue = getSignalNames(a.signalCategories, signals.data);
                        bValue = getSignalNames(b.signalCategories, signals.data);
                        break;
                    case 'themes':
                        aValue = getThemeNames(a.themes, themes.data);
                        bValue = getThemeNames(b.themes, themes.data);
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                        break;
                }

                // Sort based on the direction (ascending/descending)
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableContexts; // Return the sorted array
    }, [contexts.data, sortConfig, sectors.data, subSectors.data, signals.data, themes.data]);

    // Filter contexts based on the search query
    const filteredContexts = useMemo(() => {
        if (!searchQuery) return contexts.data || []; // ✅ Use API data if no search query
        
        return contexts.data.filter(context => {
            const formattedDate = format(new Date(context.date), 'yyyy-MM-dd');
    
            return (
                (context.contextTitle && context.contextTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (formattedDate && formattedDate.startsWith(searchQuery))
            );
        });
    }, [contexts.data, searchQuery]);
    
    // Handle the removal of a context
    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this context?'); // Ask for confirmation
        if (userInput) {
            try {
                // Perform HTTP DELETE request to remove the context
                const response = await axios.delete(`/api/admin/contexts/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                // Dispatch action to remove context from global state
                contextsDispatch({ type: 'REMOVE_CONTEXT', payload: response.data._id });
                toast.success('context removed successfully')
            } catch (err) {
                alert(err.message); // Display error message if the request fails
                toast.error(err.message)
            }
        }
    };

    // Placeholder for additional logic if needed during search
    
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setPage(1);
            fetchContexts(); // ✅ Reset to full list when input is cleared
            return;
        }
    
        try {
            const response = await axios.get(`/api/admin/contexts/all?search=${encodeURIComponent(searchQuery)}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
    
            console.log("✅ Search Results:", response.data);
    
            if (response.data.success) {
                contextsDispatch({ 
                    type: "SET_CONTEXTS", 
                    payload: { 
                        contexts: response.data.contexts, 
                        totalPages: 1, // ✅ No pagination for search results
                        page: 1 
                    }
                });
            } else {
                contextsDispatch({ type: "SET_CONTEXTS", payload: { contexts: [], totalPages: 1, page: 1 } });
            }
        } catch (error) {
            console.error("❌ Search API Error:", error);
            toast.error("❌ Search API Error: Please try again.");
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            console.log("Navigating to Next Page:", page + 1);
            setPage(page + 1);
            localStorage.setItem('contextPage', page + 1);  // ✅ Store updated page in local storage
        }
    };
    
    const handlePrevPage = () => {
        if (page > 1) {
            console.log("Navigating to Previous Page:", page - 1);
            setPage(page - 1);
            localStorage.setItem('contextPage', page - 1);  // ✅ Store updated page in local storage
        }
    };
    
    // Request to sort contexts by a specific key
    const requestSort = (key) => {
        let direction = 'ascending'; // Default sorting direction
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'; // Toggle direction if the same key is clicked
        }
        setSortConfig({ key, direction }); // Update sort configuration
    };

    // Render the component
    return (
        <div className="context-list-container">
            {/* Button to add a new context */}
            <button className="add-context-btn" onClick={handleAddClick}>Add Context</button>
            <div className="search-container">
                        <input
                                type="text"
                                placeholder="Search by Title or Date..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}  // ✅ Correctly updating searchQuery
                                className="search-input"
                            />

                        {/* <button className="search-btn" onClick={() => setPage(1)}>Search</button> */}
                        <button className="search-btn" onClick={handleSearch}>Search</button>

                    </div>

                <table className="context-table">
                    <thead>
                    <tr>
                        {/* Table headers with sorting functionality */}
                        <th onClick={() => requestSort('date')}>
                            Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>

                        <th onClick={() => requestSort('contextTitle')}>
                            Context Title {sortConfig.key === 'contextTitle' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('displayOrder')}>
                            Context Display Order {sortConfig.key === 'displayOrder' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('containerType')}>
                            Context Container Type {sortConfig.key === 'containerType' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('sectors')}>
                            Sectors {sortConfig.key === 'sectors' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('subSectors')}>
                            Sub-Sectors {sortConfig.key === 'subSectors' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('signalCategories')}>
                            Signal Categories {sortConfig.key === 'signalCategories' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('themes')}>
                            Themes {sortConfig.key === 'themes' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th>Is Trending</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Table body with context data */}
                    {filteredContexts.map(ele => (
                        <tr key={ele._id}>
                            <td>{ele.date}</td>
                            <td>{ele.contextTitle}</td>
                            <td>{ele.displayOrder}</td>
                            <td>{ele.containerType}</td>
                            <td>{getSectorNames(ele.sectors, sectors.data)}</td>
                            <td>{getSubSectorNames(ele.subSectors, subSectors.data)}</td>
                            <td>{getSignalNames(ele.signalCategories, signals.data)}</td>
                            {/* <td>{getThemeNames(ele.themes, themes.data)}</td> */}
                            <td>{getThemeNames(ele.themes)}</td>

                            <td>{ele.isTrending ? 'Yes' : 'No'}</td>
                            <td>
                                {/* Buttons for editing and removing contexts */}
                                <button className="edit-btn" onClick={() => handleEditClick(ele._id)}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(ele._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                    <button 
                        onClick={handlePrevPage}  // ✅ Handle Previous Page
                        disabled={page === 1}     // ✅ Disable on First Page
                    >
                        Previous
                    </button>

                    <span> Page {page} of {totalPages} </span>  {/* ✅ Display Current Page & Total Pages */}

                    <button 
                        onClick={handleNextPage}  // ✅ Handle Next Page
                        disabled={page === totalPages}  // ✅ Disable on Last Page
                    >
                        Next
                    </button>
                </div>
                </div>
    );
}
