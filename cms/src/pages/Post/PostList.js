import React, { useContext, useState, useEffect, useMemo } from "react";
import PostContext from "../../context/PostContext";
import ContextContext from "../../context/ContextContext";
import MasterDataContext from "../../context/MasterDataContext";
import axios from "../../config/axios";
import "../../html/css/Post.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import { saveAs } from 'file-saver';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PostList() {
    const { posts, postsDispatch, handleAddClick, handleEditClick } = useContext(PostContext);
    const { contexts, isLoading } = useContext(ContextContext);
    const masterData = useContext(MasterDataContext);

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "descending" });
    const [page, setPage] = useState(() => parseInt(localStorage.getItem("currentPage")) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [allPosts, setAllPosts] = useState([]);

    const fetchAllPosts = async () => {
        try {
            const response = await axios.get(`/api/admin/posts/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            
            if (response.data.success) {
                setAllPosts(response.data.posts);
            } else {
                toast.error("Failed to fetch all posts");
            }
        } catch (error) {
            toast.error("Failed to fetch all posts. Please try again.");
        }
    };

    const location = useLocation();
    const query = useQuery();
    const editIdFromQuery = query.get('editId');
    useEffect(() => {
        const fetchAndEdit = async () => {
            if (editIdFromQuery) {
                if (typeof fetchPosts === 'function') {
                    await fetchPosts('all');
                }
                handleEditClick(editIdFromQuery);
            }
        };
        fetchAndEdit();
    }, [editIdFromQuery]);

    useEffect(() => {
        const storedPage = parseInt(localStorage.getItem("currentPage"), 10);
        if (storedPage) {
            setPage(storedPage);
        }
    }, []);

    useEffect(() => {
        if (page) {
            localStorage.setItem("currentPage", page);
            fetchPosts(page);
        }
    }, [page]);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            setPage(1);
            localStorage.removeItem("currentPage");
        }
    }, []);

    useEffect(() => {
        if (searchQuery === "") {
            fetchPosts();
        }
    }, [searchQuery]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim() !== "") {
                handleSearch();
            } else {
                fetchPosts();
            }
        }, 100);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`/api/admin/posts?page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            if (response.data.success) {
                postsDispatch({ type: "SET_POSTS", payload: response.data.posts });
                setTotalPages(response.data.totalPages || 1);
            } else {
                toast.error("Failed to fetch posts");
            }
        } catch (error) {
            toast.error("Failed to fetch posts. Please try again.");
        }
    };
   
    

    const handleSearch = async () => {
        if (searchQuery.trim() === "") {
            fetchPosts();
            return;
        }
    
        try {
            const response = await axios.get(`/api/admin/posts/all?search=${encodeURIComponent(searchQuery)}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
    
            if (response.data.success) {
                postsDispatch({ type: "SET_POSTS", payload: response.data.posts });
                setTotalPages(1);
                setPage(1);
            } else {
                postsDispatch({ type: "SET_POSTS", payload: [] });
                setTotalPages(1);
                setPage(1);
            }
        } catch (error) {
            toast.error("❌ Search API Error: Please try again.");
        }
    };
    
    const getContextName = (contextsArray) => {
        if (!contextsArray || !Array.isArray(contextsArray) || contextsArray.length === 0) {
            return "No Contexts";
        }
    
        return contextsArray
            .map(ctx => {
                if (typeof ctx === "string") {
                    return getContextTitleFromStore(ctx);
                } else if (ctx?._id && ctx.contextTitle) {
                    return ctx.contextTitle;
                } else {
                    return "Unknown Context";
                }
            })
            .join(", ");
    };
    
    const getContextTitleFromStore = (contextId) => {
        if (!contexts?.data || contexts.data.length === 0) return "Unknown Context";
        const context = contexts.data.find(c => c._id === contextId);
        return context ? context.contextTitle : "Unknown Context";
    };
    
    const requestSort = (key) => {
        let direction = key === "date" ? "descending" : "ascending";
    
        if (sortConfig.key === key) {
            direction = sortConfig.direction === "ascending" ? "descending" : "ascending";
        }
    
        setSortConfig({ key, direction });
    };
    
   const sortedPosts = useMemo(() => {
        let sortablePosts = Array.isArray(posts?.data) ? [...new Set(posts.data)] : [];
    
        if (sortConfig !== null) {
            sortablePosts.sort((a, b) => {
                let aValue, bValue;
    
                switch (sortConfig.key) {
                    case "postTitle":
                    case "postType":
                        aValue = (a[sortConfig.key] || "").toLowerCase();
                        bValue = (b[sortConfig.key] || "").toLowerCase();
                        return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    
                    case "date":
                        aValue = new Date(a.date || 0);
                        bValue = new Date(b.date || 0);
                        return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue;
    
                    case "context":
                        aValue = getContextName(a.context).toLowerCase();
                        bValue = getContextName(b.context).toLowerCase();
                        return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    
                    default:
                        aValue = a[sortConfig.key] || "";
                        bValue = b[sortConfig.key] || "";
                        return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
            });
        }
    
        return sortablePosts;
    }, [posts?.data, sortConfig, contexts?.data]);
    
    

    const filteredPosts = useMemo(() => {
        let data = allPosts.length ? allPosts : (Array.isArray(posts?.data) ? posts.data : []);
        if (dateRange.start && dateRange.end) {
            data = data.filter(post => {
                const d = new Date(post.date);
                return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
            });
        }
        if (searchQuery.trim()) {
            data = data.filter(post => (post.postTitle || '').toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return data;
    }, [allPosts, posts?.data, dateRange, searchQuery]);

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    if (isLoading && (!contexts?.data || contexts.data.length === 0)) {
        return <h3>Loading Contexts... (But showing posts)</h3>;
    }
    
    const handleRemove = async (id) => {
        const userConfirmed = window.confirm("Are you sure you want to delete this post?");
        if (!userConfirmed) return;
    
        try {
            const response = await axios.delete(`/api/admin/posts/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
    
            if (response.status === 200) {
                postsDispatch({ type: "REMOVE_POST", payload: id });
                toast.success('posts removed successfully!')
                await fetchPosts(); 
            }
        } catch (error) {
            toast.error("Failed to delete post. Please try again.");
        }
    };

    const resolveField = (field, type) => {
        if (!field) return '';
        if (Array.isArray(field)) {
            return field.map(f => resolveField(f, type)).join(', ');
        }
        if (typeof field === 'object' && field._id) {
            switch (type) {
                case 'company':
                    return field.companyName || field;
                case 'source':
                    return field.sourceName || field;
                case 'context':
                    return field.contextTitle || field;
                default:
                    return field;
            }
        }
        // Lookup from context
        switch (type) {
            case 'context':
                if (contexts?.data) {
                    const ctx = contexts.data.find(c => String(c._id) === String(field));
                    return ctx ? ctx.contextTitle : field;
                }
                break;
            case 'company':
                if (masterData?.masterData?.companies) {
                    const company = masterData.masterData.companies.find(c => String(c._id) === String(field));
                    return company ? company.companyName : field;
                }
                break;
            case 'source':
                if (masterData?.masterData?.sources) {
                    const source = masterData.masterData.sources.find(s => String(s._id) === String(field));
                    return source ? source.sourceName : field;
                }
                break;
            default:
                return field;
        }
        return field;
    };

    const handleDownloadCSV = async () => {
        try {
            await fetchAllPosts();
            
            let filtered = allPosts;
            
            if (dateRange.start && dateRange.end) {
                filtered = filtered.filter(post => {
                    const d = new Date(post.date);
                    return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
                });
            }
            
            if (searchQuery.trim()) {
                filtered = filtered.filter(post => (post.postTitle || '').toLowerCase().includes(searchQuery.toLowerCase()));
            }

            if (filtered.length === 0) {
                toast.warning("No data available for the selected filters");
                return;
            }

            const headers = [
                'Date', 'Post Title', 'Context', 'Post Type', 'Is Trending', 'Summary', 'Complete Content', 
                'Primary Companies', 'Secondary Companies', 'Source', 'Source URLs', 'Sentiment', 
                'General Comment', 'Created At', 'Updated At'
            ];
            
            const rows = filtered.map(post => {
                const primaryCompanyNames = Array.isArray(post.primaryCompanies) 
                    ? post.primaryCompanies.map(company => resolveField(company, 'company')).join(', ')
                    : resolveField(post.primaryCompanies, 'company');

                const secondaryCompanyNames = Array.isArray(post.secondaryCompanies)
                    ? post.secondaryCompanies.map(company => resolveField(company, 'company')).join(', ')
                    : resolveField(post.secondaryCompanies, 'company');

                return [
                    post.date ? new Date(post.date).toISOString().split('T')[0] : '',
                    post.postTitle || '',
                    resolveField(post.contexts, 'context'),
                    post.postType || '',
                    post.isTrending ? 'Yes' : 'No',
                    post.summary || '',
                    post.completeContent || '',
                    primaryCompanyNames,
                    secondaryCompanyNames,
                    resolveField(post.source, 'source'),
                    (post.sourceUrls || []).join(', '),
                    post.sentiment || '',
                    post.generalComment || '',
                    post.createdAt ? new Date(post.createdAt).toLocaleString() : '',
                    post.updatedAt ? new Date(post.updatedAt).toLocaleString() : '',
                ];
            });

            const csvContent = [headers, ...rows].map(r => r.map(x => `"${(x || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            const filename = dateRange.start && dateRange.end 
                ? `posts_${dateRange.start}_${dateRange.end}.csv`
                : 'all_posts.csv';
                
            saveAs(blob, filename);
            toast.success(`Successfully downloaded ${rows.length} posts`);
        } catch (error) {
            toast.error("Failed to download CSV. Please try again.");
        }
    };

    // Handler to open the Context List page in a new window
    const handleShowAllContexts = () => {
        window.open('/contexts', '_blank');
    };

    return (
        <div className="post-list-container">
            <div className="post-list-controls">
                <button className="add-post-btn" onClick={handleAddClick}>Add Post</button>
                <div className="date-range-controls">
                    <label>From: <input type="date" value={dateRange.start} onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))} /></label>
                    <label>To: <input type="date" value={dateRange.end} onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))} /></label>
                    <button className="download-csv-btn" onClick={handleDownloadCSV}>Download CSV</button>
                </div>
            </div>
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="search-input"
                />
                <button className="search-btn" onClick={handleSearch}>Search</button>
            </div>
            <table className="post-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort("date")}>Date</th>
                        <th onClick={() => requestSort("postTitle")}>Post Title</th>
                        <th onClick={() => requestSort("context")}>Context</th>
                        <th onClick={() => requestSort("postType")}>Post Type</th>
                        <th onClick={() => requestSort("isTrending")}>Is Trending</th>
                        <th>Actions</th>
                        <th>Show All Contexts</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <tr key={post._id}>
                                <td>{post.date ? new Date(post.date).toLocaleDateString() : ''}</td>
                                <td>{post.postTitle}</td>
                                <td>{resolveField(post.contexts, 'context')}</td>
                                <td>{post.postType}</td>
                                <td>{post.isTrending ? 'Yes' : 'No'}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEditClick(post._id)}>Edit</button>
                                    <button className="remove-btn" onClick={() => handleRemove(post._id)}>Remove</button>
                                </td>
                                <td>
                                    <button className="show-contexts-btn" onClick={handleShowAllContexts}>
                                        Show All Contexts
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No posts found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={handlePrevPage} disabled={page === 1} style={{ padding: '0.5rem 1rem' }}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={page === totalPages} style={{ padding: '0.5rem 1rem' }}>Next</button>
            </div>
        </div>
    );
}

const styles = `
.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem;
}

.pagination-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background-color: #f0f0f0;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    font-size: 0.9rem;
    color: #666;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
