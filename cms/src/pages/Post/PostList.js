import React, { useContext, useState, useEffect, useMemo } from "react";
import PostContext from "../../context/PostContext";
import ContextContext from "../../context/ContextContext"; // ✅ Import Context Provider
import axios from "../../config/axios";
import "../../html/css/Post.css";
import { toast } from 'react-toastify'; // ✅ Import toast
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import toast styles

export default function PostList() {
    const { posts, postsDispatch, handleAddClick, handleEditClick } = useContext(PostContext);
    const { contexts, isLoading } = useContext(ContextContext); // ✅ Get contexts & loading state

    const [searchQuery, setSearchQuery] = useState("");
    //const [sortConfig, setSortConfig] = useState({ key: "postTitle", direction: "ascending" });
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "descending" });
    const [page, setPage] = useState(() => parseInt(localStorage.getItem("currentPage")) || 1);
    const [totalPages, setTotalPages] = useState(1);

    // ✅ Store current page in localStorage
    
    useEffect(() => {
        const storedPage = parseInt(localStorage.getItem("currentPage"), 10);
        
        if (storedPage) {
            setPage(storedPage);
        }
    }, []);
    
    useEffect(() => {
        if (page) {
            localStorage.setItem("currentPage", page); // ✅ Store last visited page
            fetchPosts(page); // ✅ Fetch posts only after page is updated
        }
    }, [page]); // ✅ Fetch only when page changes
    
    
    // ✅ Reset pagination when user logs out
    useEffect(() => {
        if (!localStorage.getItem("token")) {
            setPage(1);
            localStorage.removeItem("currentPage");
        }
    }, []);

    
    // ✅ Fetch Posts with Pagination
    const fetchPosts = async () => {
        try {
            const response = await axios.get(`/api/admin/posts?page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            console.log("✅ Fetched Posts Data:", response.data);

            if (response.data.success) {
                postsDispatch({ type: "SET_POSTS", payload: response.data.posts });
                //setTotalPages(response.data.totalPages);
                setTotalPages(response.data.totalPages || 1);
                //toast.success('Fetched posts successfully!')
            }
        } catch (error) {
            console.error("❌ API Fetch Error:", error);
            toString.error("❌ API Fetch Error:", error);
        }
    };
   
    

    // ✅ Fetch full post list automatically when search query is cleared
    useEffect(() => {
        if (searchQuery === "") {
            fetchPosts(); // Automatically load full post list when input is cleared
        }
    }, [searchQuery]);

    // ✅ Search Function
    const handleSearch = async () => {
        if (searchQuery.trim() === "") {
            fetchPosts(); // ✅ Reset to full list when input is cleared
            return;
        }
    
        try {
            const response = await axios.get(`/api/admin/posts/all?search=${encodeURIComponent(searchQuery)}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
    
            console.log("✅ Search Results:", response.data);
    
            if (response.data.success) {
                postsDispatch({ type: "SET_POSTS", payload: response.data.posts });
                setTotalPages(1); // ✅ Search results are not paginated, set totalPages to 1
                setPage(1); // ✅ Reset page to 1 after search
            } else {
                postsDispatch({ type: "SET_POSTS", payload: [] });
                setTotalPages(1);
                setPage(1);
            }
        } catch (error) {
            console.error("❌ Search API Error:", error);
            toast.error("❌ Search API Error: Please try again.");
        }
    };
    
    // ✅ Run search automatically when user types
useEffect(() => {
    const delayDebounce = setTimeout(() => {
        if (searchQuery.trim() !== "") {
            handleSearch();
        } else {
            fetchPosts(); // ✅ Reset to full list when input is cleared
        }
    }, 100); // Delay search to avoid excessive API calls

    return () => clearTimeout(delayDebounce);
}, [searchQuery]); // ✅ Runs whenever searchQuery changes

    // ✅ Context Lookup Function
    const getContextName = (contextsArray) => {
        if (!contextsArray || !Array.isArray(contextsArray) || contextsArray.length === 0) {
            return "No Contexts"; // ✅ Default message
        }
    
        return contextsArray
            .map(ctx => {
                if (typeof ctx === "string") {
                    return getContextTitleFromStore(ctx); // ✅ Handle context IDs
                } else if (ctx?._id && ctx.contextTitle) {
                    return ctx.contextTitle; // ✅ Handle populated objects
                } else {
                    return "Unknown Context";
                }
            })
            .join(", ");
    };
    
    // ✅ Helper function to find context title from global context state
    const getContextTitleFromStore = (contextId) => {
        if (!contexts?.data || contexts.data.length === 0) return "Unknown Context";
        const context = contexts.data.find(c => c._id === contextId);
        return context ? context.contextTitle : "Unknown Context";
    };
    
    // ✅ Sorting Function

    const requestSort = (key) => {
        let direction = key === "date" ? "descending" : "ascending"; // ✅ Default to descending for date sorting
    
        if (sortConfig.key === key) {
            direction = sortConfig.direction === "ascending" ? "descending" : "ascending"; // ✅ Toggle sorting on repeated clicks
        }
    
        setSortConfig({ key, direction });
    };
    
    
    // ✅ Sorting and Filtering Posts
   const sortedPosts = useMemo(() => {
        let sortablePosts = Array.isArray(posts?.data) ? [...new Set(posts.data)] : []; // ✅ Remove duplicates
    
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
                        return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue; // ✅ Ensures latest post comes first
    
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
    
    

    // ✅ Filter Posts Based on Search Query
    const filteredPosts = useMemo(() => {
        return sortedPosts.filter((post) =>
            (post.postTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sortedPosts, searchQuery]);

    // ✅ Pagination Handlers
    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    // ✅ Show Loading State Until Contexts Load
    if (isLoading && (!contexts?.data || contexts.data.length === 0)) {
        console.log("🔍 Context Data in PostList:", contexts);
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
                console.log("✅ Post Deleted:", response.data);
                postsDispatch({ type: "REMOVE_POST", payload: id }); // ✅ Remove from UI
                toast.success('posts removed successfully!')
                await fetchPosts(); 
            }
        } catch (error) {
            console.error("❌ Error deleting post:", error);
            toast.error("Failed to delete post. Please try again.");
        }
    };
    

    return (
        <div className="post-list-container">
            <button className="add-post-btn" onClick={handleAddClick}>Add Post</button>

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
                        <th onClick={() => requestSort("postTitle")}>Post Title</th>
                        <th onClick={() => requestSort("date")}>Date</th>
                        <th onClick={() => requestSort("context")}>Context</th>
                        <th onClick={() => requestSort("postType")}>Post Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <tr key={post._id}>
                                <td>{post.postTitle}</td>
                                <td>{new Date(post.date).toLocaleDateString()}</td>
                                <td>{getContextName(post.contexts)}</td>
                                <td>{post.postType}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEditClick(post._id)}>Edit</button>
                                    <button className="remove-btn" onClick={() => handleRemove(post._id)}>Remove</button>

                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No posts found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* ✅ Pagination Controls */}
            <div className="pagination-controls">
                <button onClick={handlePrevPage} disabled={page === 1}>⬅️ Prev</button>
                 <span> Page {page} of {totalPages} </span>
                 <button onClick={handleNextPage} disabled={page === totalPages}>Next ➡️</button>
             </div>
         </div>
    );
}
