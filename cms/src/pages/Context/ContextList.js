import React, { useContext, useState, useMemo, useEffect, useCallback } from 'react'; // Importing necessary hooks and components from React
import ContextContext from '../../context/ContextContext'; // Importing the context for managing global state
import axios from '../../config/axios'; // Importing axios instance for making HTTP requests
import '../../html/css/Context.css'; // Importing the CSS file for styling the component
import { format } from 'date-fns';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import { toast } from 'react-toastify'; // ✅ Import toast
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import toast styles
import Papa from 'papaparse'; // For CSV generation
import LoadingSpinner from '../../components/LoadingSpinner';
import AuthContext from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

// Defining the ContextList functional component
export default function ContextList() {
    // Destructuring necessary state and functions from ContextContext
    const { contexts, contextsDispatch, handleAddClick, handleEditClick, searchQuery, setSearchQuery, sectors, subSectors, themes, signals, subSignals, setIsLoading, fetchContexts, isLoading } = useContext(ContextContext);
    const { page, setPage, totalPages } = useContext(ContextContext);  // ✅ Use global state
    const { allThemes } = useContext(ContextContext); // ✅ Use allThemes
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    
    // Local state to manage the search query and sorting configuration
    const [sortConfig, setSortConfig] = useState({ key: 'contextTitle', direction: 'ascending' });
    const [localSearchQuery, setLocalSearchQuery] = useState(''); // Local search state
    const [contextsData, setContextsData] = useState([]); // ✅ New local state for rendering
    const [downloadStartDate, setDownloadStartDate] = useState('');
    const [downloadEndDate, setDownloadEndDate] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [postsMap, setPostsMap] = useState({}); // Store post ID to title mapping
    const [allContexts, setAllContexts] = useState([]); // Store all contexts
    const location = useLocation();
    const query = useQuery();
    const navigate = useNavigate();

    // Get the filter parameter from URL
    const filterContextIds = query.get('filterContexts')?.split(',').filter(Boolean) || [];

    // Fetch all contexts when component mounts
    useEffect(() => {
        const fetchAllContexts = async () => {
            try {
                const response = await axios.get('/api/admin/contexts/all', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    setAllContexts(response.data.contexts || []);
                }
            } catch (err) {
                console.error('Error fetching all contexts:', err);
                toast.error('Failed to fetch contexts data');
            }
        };
        fetchAllContexts();
    }, []);

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

    // Fetch contexts from the API on component mount or when the context changes
    useEffect(() => {
        const fetchContexts = async () => {
            setIsLoading(true);
    
            try {
                // Always fetch paginated data, search will be handled client-side
                const apiUrl = `/api/admin/contexts?page=${page}&limit=10`;
    
                console.log(`🔍 Fetching contexts from: ${apiUrl}`);
    
                const response = await axios.get(apiUrl, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
    
                if (response.data.success) {
                    console.log('📊 API Response:', {
                        contextsCount: response.data.contexts?.length || 0,
                        totalPages: response.data.totalPages,
                        page: response.data.page,
                        total: response.data.total
                    });
                    
                    contextsDispatch({ 
                        type: "SET_CONTEXTS", 
                        payload: { 
                            contexts: response.data.contexts, 
                            totalPages: response.data.totalPages || 1, 
                            page: response.data.page || 1
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
    }, [page]); // ✅ Only fetch when page changes, NOT when searchQuery changes
    
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
    const getThemeNames = (ids) => {
        if (!Array.isArray(ids)) return 'Unknown';
        
        return ids.map(id => {
            const matchedTheme = allThemes.find(theme => theme._id === id);
            return matchedTheme ? matchedTheme.themeTitle : 'Unknown Theme';
        }).join(', ');
    };

    // Consolidated sorting and filtering logic - NOW uses localSearchQuery instead of searchQuery
    const processedContexts = useMemo(() => {
        // Use allContexts for search functionality, contexts.data for normal pagination
        let data = localSearchQuery.trim() ? allContexts : (contexts.data || []);
        
        // Apply context ID filter if present
        if (filterContextIds.length > 0) {
            data = data.filter(context => filterContextIds.includes(context._id));
        }

        // Apply search filter using localSearchQuery
        if (localSearchQuery.trim()) {
            data = data.filter(context => {
                const formattedDate = format(new Date(context.date), 'yyyy-MM-dd');
                return (
                    (context.contextTitle && context.contextTitle.toLowerCase().includes(localSearchQuery.toLowerCase())) ||
                    (formattedDate && formattedDate.startsWith(localSearchQuery))
                );
            });
        }

        // Apply sorting
        if (sortConfig !== null) {
            data.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'date':
                        aValue = new Date(a.date);
                        bValue = new Date(b.date);
                        break;
                    case 'contextTitle':
                        aValue = a.contextTitle || '';
                        bValue = b.contextTitle || '';
                        break;
                    case 'displayOrder':
                        aValue = a.displayOrder || 0;
                        bValue = b.displayOrder || 0;
                        break;
                    case 'containerType':
                        aValue = a.containerType || '';
                        bValue = b.containerType || '';
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
                        aValue = getThemeNames(a.themes);
                        bValue = getThemeNames(b.themes);
                        break;
                    default:
                        aValue = a[sortConfig.key] || '';
                        bValue = b[sortConfig.key] || '';
                        break;
                }

                // Handle null/undefined values
                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                // Convert to strings for comparison if they're not dates
                if (sortConfig.key !== 'date' && sortConfig.key !== 'displayOrder') {
                    aValue = String(aValue).toLowerCase();
                    bValue = String(bValue).toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return data;
    }, [allContexts, contexts.data, localSearchQuery, sortConfig, filterContextIds, sectors.data, subSectors.data, signals.data, allThemes]);

    // Determine if we're in search mode
    const isSearchMode = localSearchQuery.trim().length > 0;

    // Calculate pagination for processed data
    const itemsPerPage = 10;
    const totalFilteredItems = processedContexts.length;
    const totalFilteredPages = Math.ceil(totalFilteredItems / itemsPerPage);
    
    // In search mode, show all results. In normal mode, use server pagination
    const currentPageData = isSearchMode 
        ? processedContexts // Show all filtered results when searching
        : processedContexts; // Use backend paginated data as-is in normal mode

    // Use appropriate total pages with fallback
    const displayTotalPages = isSearchMode ? totalFilteredPages : (totalPages || 1);

    // Debug logging
    console.log('🔍 Pagination Debug:', {
        isSearchMode,
        localSearchQuery,
        totalFilteredItems,
        totalFilteredPages,
        totalPages,
        displayTotalPages,
        currentPageDataLength: currentPageData.length,
        page
    });

    // Update pagination when filtered results change
    useEffect(() => {
        if (isSearchMode && page > totalFilteredPages && totalFilteredPages > 0) {
            setPage(1);
        }
    }, [totalFilteredPages, page, setPage, isSearchMode]);

    // Handle the removal of a context
    const handleRemove = async (id) => {
        if (!window.confirm('Are you sure you want to delete this context?')) return;

        try {
            const response = await axios.delete(`/api/admin/contexts/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 200) {
                contextsDispatch({ type: 'REMOVE_CONTEXT', payload: id });
                toast.success('Context removed successfully!');
            }
        } catch (error) {
            toast.error('Failed to delete context. Please try again.');
        }
    };

    // Handle search input change
    const handleSearch = (e) => {
        setLocalSearchQuery(e.target.value);
    };

    const handleNextPage = () => {
        if (page < displayTotalPages) {
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

    // Fetch all posts to create ID to title mapping
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('/api/admin/posts/all', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    const posts = response.data.posts || [];
                    const mapping = {};
                    posts.forEach(post => {
                        mapping[post._id] = post.postTitle;
                    });
                    setPostsMap(mapping);
                }
            } catch (err) {
                console.error('Error fetching posts:', err);
                toast.error('Failed to fetch posts data');
            }
        };
        fetchPosts();
    }, []);

    // Helper to get context data with labels for CSV
    const getContextRowForCSV = (context) => {
        // Get post titles from the postsMap
        const postTitles = (context.posts || [])
            .map(p => postsMap[p.postId] || 'Unknown Post')
            .join(', ');

        return {
            Date: context.date,
            'Context Title': context.contextTitle,
            'Display Order': context.displayOrder,
            'Container Type': context.containerType,
            Sectors: getSectorNames(context.sectors, sectors.data),
            'Sub-Sectors': getSubSectorNames(context.subSectors, subSectors.data),
            'Signal Categories': getSignalNames(context.signalCategories, signals.data),
            Themes: getThemeNames(context.themes),
            'Is Trending': context.isTrending ? 'Yes' : 'No',
            'General Comment': context.generalComment || '',
            'Posts': postTitles,
        };
    };

    // Download handler
    const handleDownloadCSV = async () => {
        if (Object.keys(postsMap).length === 0) {
            toast.error('Please wait while posts data is being loaded');
            return;
        }

        setIsDownloading(true);
        try {
            let apiUrl = '/api/admin/contexts/all';
            const params = [];
            if (downloadStartDate) params.push(`startDate=${downloadStartDate}`);
            if (downloadEndDate) params.push(`endDate=${downloadEndDate}`);
            if (params.length > 0) apiUrl += '?' + params.join('&');

            const response = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const allContexts = response.data.contexts || response.data || [];

            let filtered = allContexts;
            if (downloadStartDate || downloadEndDate) {
                filtered = allContexts.filter(ctx => {
                    const ctxDate = new Date(ctx.date);
                    const start = downloadStartDate ? new Date(downloadStartDate) : null;
                    const end = downloadEndDate ? new Date(downloadEndDate) : null;
                    return (!start || ctxDate >= start) && (!end || ctxDate <= end);
                });
            }

            const csvRows = filtered.map(getContextRowForCSV);
            const csv = Papa.unparse(csvRows);

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'contexts.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('Failed to download CSV');
            console.error(err);
        } finally {
            setIsDownloading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    if (isLoading) return <LoadingSpinner />;

    // Render the component
    return (
        <div className="context-list-container">
            <div className="heading-beautiful">Contexts Master</div>
            <div className="top-bar">
                <div className="left-controls">
                    <button className="add-context-btn" onClick={handleAddClick} disabled={userRole === 'User'}>Add Context</button>
                </div>
                <div className="center-controls">
                    <label>
                        Start Date:
                        <input type="date" value={downloadStartDate} onChange={e => setDownloadStartDate(e.target.value)} placeholder="dd-mm-yyyy" max={today} />
                    </label>
                    <label>
                        End Date:
                        <input type="date" value={downloadEndDate} onChange={e => setDownloadEndDate(e.target.value)} placeholder="dd-mm-yyyy" max={today} />
                    </label>
                    <button onClick={handleDownloadCSV} disabled={isDownloading} style={{ minWidth: '120px' }}>
                        {isDownloading ? 'Downloading...' : 'Download CSV'}
                    </button>
                </div>
                <div className="right-controls">
                    <input
                        type="text"
                        placeholder="Search by Title or Date..."
                        value={localSearchQuery}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
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
                {currentPageData.length > 0 ? (
                    currentPageData.map((ele) => (
                        <tr key={ele._id}>
                            <td className="date-cell">{
                                ele.date && (
                                    <>
                                        <span className="date-main">{formatTz(toZonedTime(ele.date, 'Asia/Kolkata'), 'yyyy-MM-dd')}</span><br />
                                        <span className="date-time">{formatTz(toZonedTime(ele.date, 'Asia/Kolkata'), 'HH:mm:ss')} IST</span>
                                    </>
                                )
                            }</td>
                            <td>{ele.contextTitle}</td>
                            <td>{ele.displayOrder}</td>
                            <td>{ele.containerType}</td>
                            <td>{getSectorNames(ele.sectors, sectors.data)}</td>
                            <td>{getSubSectorNames(ele.subSectors, subSectors.data)}</td>
                            <td>{getSignalNames(ele.signalCategories, signals.data)}</td>
                            <td>{getThemeNames(ele.themes)}</td>
                            <td>{ele.isTrending ? 'Yes' : 'No'}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="edit-btn" onClick={() => handleEditClick(ele._id)} disabled={userRole === 'User'}>Edit</button>
                                    <button className="remove-btn" onClick={() => handleRemove(ele._id)} disabled={userRole === 'User'}>Remove</button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="10" style={{ textAlign: 'center' }}>
                            {filterContextIds.length > 0 
                                ? 'No matching contexts found for this filter'
                                : localSearchQuery.trim()
                                ? 'No contexts found matching your search'
                                : 'No contexts found'}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
        {isSearchMode ? (
            <div className="pagination">
                <span>Showing all {currentPageData.length} results for "{localSearchQuery}"</span>
            </div>
        ) : (
            <div className="pagination">
                <button 
                    onClick={handlePrevPage}  // ✅ Handle Previous Page
                    disabled={page === 1}     // ✅ Disable on First Page
                >
                    Previous
                </button>

                <span> Page {page} of {displayTotalPages} </span>  {/* ✅ Display Current Page & Total Pages */}

                <button 
                    onClick={handleNextPage}  // ✅ Handle Next Page
                    disabled={page === displayTotalPages || displayTotalPages === 0}  // ✅ Disable on Last Page or when no pages
                >
                    Next
                </button>
            </div>
        )}
        </div>
    );
}
