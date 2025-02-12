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
    const [sortConfig, setSortConfig] = useState({ key: "postTitle", direction: "ascending" });
    const [page, setPage] = useState(() => parseInt(localStorage.getItem("currentPage")) || 1);
    const [totalPages, setTotalPages] = useState(1);

    // ✅ Store current page in localStorage
    useEffect(() => {
        localStorage.setItem("currentPage", page);
    }, [page]);

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
                toast.success('Fetched posts successfully!')
            }
        } catch (error) {
            console.error("❌ API Fetch Error:", error);
            toString.error("❌ API Fetch Error:", error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page]);

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
            const response = await axios.get(`/api/admin/posts?search=${searchQuery}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
    
            console.log("✅ Search Results:", response.data);
    
            postsDispatch({ type: "SET_POSTS", payload: response.data.posts });
    
            // ✅ Update total pages to 1 since search results are not paginated
            setTotalPages(1);
            setPage(1);
        } catch (error) {
            console.error("❌ Search API Error:", error);
            toast.error("❌ Search API Error:", error);
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
    const getContextName = (ids) => {
        if (!Array.isArray(ids) || isLoading || !contexts?.data?.length) return "Loading...";
        const contextNames = ids.map((id) => {
            const item = contexts.data.find((ele) => ele._id === id);
            return item ? item.contextTitle : "Unknown";
        });
        return contextNames.join(", ");
    };

    // ✅ Sorting Function
    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    // ✅ Sorting and Filtering Posts
    const sortedPosts = useMemo(() => {
        let sortablePosts = Array.isArray(posts?.data) ? [...posts.data] : [];

        if (sortConfig !== null) {
            sortablePosts.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case "postTitle":
                    case "postType":
                        aValue = (a[sortConfig.key] || "").toLowerCase();
                        bValue = (b[sortConfig.key] || "").toLowerCase();
                        break;
                    case "date":
                        aValue = new Date(a.date || 0);
                        bValue = new Date(b.date || 0);
                        break;
                    case "context":
                        aValue = getContextName(a.context).toLowerCase();
                        bValue = getContextName(b.context).toLowerCase();
                        break;
                    default:
                        aValue = a[sortConfig.key] || "";
                        bValue = b[sortConfig.key] || "";
                        break;
                }

                return sortConfig.direction === "ascending"
                    ? aValue < bValue
                        ? -1
                        : 1
                    : aValue > bValue
                    ? -1
                    : 1;
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
    if (isLoading) {
        return <h3>Loading Contexts...</h3>;
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
                                <td>{getContextName(post.context)}</td>
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
