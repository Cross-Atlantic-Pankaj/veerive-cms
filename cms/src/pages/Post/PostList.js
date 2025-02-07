// import React, { useContext, useState, useMemo, useEffect } from 'react';
// import PostContext from '../../context/PostContext';
// import axios from '../../config/axios';
// import '../../html/css/Post.css';

// export default function PostList() {
//     const { posts, postsDispatch, handleAddClick, handleEditClick, contexts } = useContext(PostContext);
    
//     const [searchQuery, setSearchQuery] = useState('');
//     const [sortConfig, setSortConfig] = useState({ key: 'postTitle', direction: 'ascending' });
    
//     // ✅ Load the last page from localStorage (if exists), otherwise start from page 1
//     const [page, setPage] = useState(() => {
//         return parseInt(localStorage.getItem('currentPage')) || 1;
//     });

//     const [totalPages, setTotalPages] = useState(1);

    
//     // ✅ Update localStorage whenever `page` changes
//     useEffect(() => {
//         localStorage.setItem('currentPage', page);
//     }, [page]);

//     // ✅ Ensure the page resets to 1 when the user logs out
//     useEffect(() => {
//         const savedPage = localStorage.getItem('currentPage');
//         const token = localStorage.getItem('token');

//         if (!token) {
//             setPage(1); // ✅ Reset to page 1 if user is not logged in
//             localStorage.removeItem('currentPage'); // ✅ Clear stored page on logout
//         } else {
//             setPage(savedPage ? parseInt(savedPage) : 1); // ✅ Restore page if logged in
//         }
//     }, []);

//     // ✅ Fetch Posts with Pagination
   
//     useEffect(() => {
//         const fetchPosts = async () => {
//             try {
//                 const response = await axios.get(`/api/admin/posts?page=${page}&limit=10`, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//                 });
    
//                 console.log("✅ Fetched Posts Data:", response.data);
    
//                 if (response.data.success) {
//                     postsDispatch({ type: 'SET_POSTS', payload: response.data.posts });
//                     setTotalPages(response.data.totalPages); // ✅ Ensure correct total pages
//                 }
//             } catch (error) {
//                 console.error("❌ API Fetch Error:", error);
//             }
//         };
    
//         fetchPosts();
//     }, [page]);
    

//     // ✅ Delete Post Function
//     const handleRemove = async (id) => {
//         const userInput = window.confirm('Are you sure you want to remove this post?');
//         if (userInput) {
//             try {
//                 await axios.delete(`/api/admin/posts/${id}`, { 
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//                 });

//                 // ✅ Remove post from the state after successful deletion
//                 postsDispatch({ type: 'REMOVE_POST', payload: id });

//                 alert('Post deleted successfully!');
//             } catch (err) {
//                 alert('❌ Error deleting post: ' + err.message);
//             }
//         }
//     };

//     // ✅ Updated Search API Call
//     const handleSearch = async () => {
//     try {
//         const response = await axios.get(`/api/admin/posts?search=${searchQuery}`, {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });

//         console.log("✅ Search Results:", response.data);
//         postsDispatch({ type: 'SET_POSTS', payload: response.data.posts });

//         // ✅ Set pagination based on total posts found
//         if (response.data.totalPages) {
//             setTotalPages(response.data.totalPages);
//         }
//     } catch (error) {
//         console.error("❌ Search API Error:", error);
//     }
// };

//     // ✅ Helper Function for Context Name
    
//     const getContextName = (ids, data) => {
//         if (!Array.isArray(ids) || !data || data.length === 0) return 'Loading...'; // ✅ Show "Loading..." until fetched
//         const contextNames = ids.map(id => {
//             const item = data.find(ele => ele._id === id);
//             return item ? item.contextTitle : 'Unknown'; // ✅ Avoid "undefined"
//         });
//         return contextNames.join(', ');
//     };
    
    

//     // ✅ Sorting Function
//     const requestSort = (key) => {
//         let direction = 'ascending';
//         if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//             direction = 'descending';
//         }
//         setSortConfig({ key, direction });
//     };

//     // ✅ Sorting and Filtering Posts
   
//     const sortedPosts = useMemo(() => {
//         let sortablePosts = Array.isArray(posts?.data) ? [...posts.data] : [];
    
//         if (sortConfig !== null) {
//             sortablePosts.sort((a, b) => {
//                 let aValue, bValue;
    
//                 switch (sortConfig.key) {
//                     case 'postTitle':
//                     case 'postType':
//                         aValue = (a[sortConfig.key] || '').toLowerCase();
//                         bValue = (b[sortConfig.key] || '').toLowerCase();
//                         break;
//                     case 'date':
//                         aValue = new Date(a.date || 0);
//                         bValue = new Date(b.date || 0);
//                         break;
//                     case 'context':
//                         aValue = getContextName(a.context, Array.isArray(contexts?.data) ? contexts.data : []).toLowerCase();
//                         bValue = getContextName(b.context, Array.isArray(contexts?.data) ? contexts.data : []).toLowerCase();
//                         break;
//                     default:
//                         aValue = a[sortConfig.key] || '';
//                         bValue = b[sortConfig.key] || '';
//                         break;
//                 }
    
//                 if (aValue < bValue) {
//                     return sortConfig.direction === 'ascending' ? -1 : 1;
//                 }
//                 if (aValue > bValue) {
//                     return sortConfig.direction === 'ascending' ? 1 : -1;
//                 }
//                 return 0;
//             });
//         }
//         return sortablePosts;
//     }, [posts?.data, sortConfig, contexts?.data]);

//     // ✅ Filtered Posts by Search
//     const filteredPosts = sortedPosts.filter(post =>
//         (post.postTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
//     );
    
//     // ✅ Pagination Handlers
//     const handleNextPage = () => {
//         if (page < totalPages) setPage(page + 1);
//     };
    
//     const handlePrevPage = () => {
//         if (page > 1) setPage(page - 1);
//     };
// //     return (
// //         <div className="post-list-container">
// //             <button className="add-post-btn" onClick={handleAddClick}>Add Post</button>
            
// //             <div className="search-container">
// //                 <input
// //                     type="text"
// //                     placeholder="Search..."
// //                     value={searchQuery}
// //                     onChange={(e) => setSearchQuery(e.target.value)}
// //                     className="search-input"
// //                 />
// //                 <button className="search-btn" onClick={handleSearch}>Search</button>
// //             </div>
// //             <table className="post-table">
// //                 <thead>
// //                     <tr>
// //                         <th onClick={() => requestSort('postTitle')}>
// //                             Post Title {sortConfig.key === 'postTitle' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
// //                         </th>
// //                         <th onClick={() => requestSort('date')}>
// //                             Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
// //                         </th>
// //                         <th onClick={() => requestSort('context')}>
// //                             Context {sortConfig.key === 'context' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
// //                         </th>
// //                         <th onClick={() => requestSort('postType')}>
// //                             Post Type {sortConfig.key === 'postType' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
// //                         </th>
// //                         <th>Actions</th>
// //                     </tr>
// //                 </thead>
// //                 <tbody>
// //                     {filteredPosts.map(post => (
// //                         <tr key={post._id}>
// //                             <td>{post.postTitle}</td>
// //                             <td>{new Date(post.date).toLocaleDateString()}</td>
// //                             <td>{getContextName(post.context, contexts?.data || [])}</td>
// //                             <td>{post.postType}</td>
// //                             <td>
// //                                 <button className="edit-btn" onClick={() => handleEditClick(post._id)}>Edit</button>
// //                                 <button className="remove-btn" onClick={() => handleRemove(post._id)}>Remove</button>
// //                             </td>
// //                         </tr>
// //                     ))}
// //                 </tbody>
// //             </table>

// //             {/* ✅ Pagination Controls */}
// //             <div className="pagination-controls">
// //                 <button onClick={handlePrevPage} disabled={page === 1}>⬅️ Prev</button>
// //                 <span> Page {page} of {totalPages} </span>
// //                 <button onClick={handleNextPage} disabled={page === totalPages}>Next ➡️</button>
// //             </div>
// //         </div>
// //     );
// // }
// return (
//     <div className="post-list-container">
//         <button className="add-post-btn" onClick={handleAddClick}>Add Post</button>
        
//         <div className="search-container">
//             <input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="search-input"
//             />
//             <button className="search-btn" onClick={handleSearch}>Search</button> {/* ✅ Use handleSearch */}
//         </div>

//         <table className="post-table">
//             <thead>
//                 <tr>
//                     <th onClick={() => requestSort('postTitle')}>
//                         Post Title {sortConfig.key === 'postTitle' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
//                     </th>
//                     <th onClick={() => requestSort('date')}>
//                         Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
//                     </th>
//                     <th onClick={() => requestSort('context')}>
//                         Context {sortConfig.key === 'context' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
//                     </th>
//                     <th onClick={() => requestSort('postType')}>
//                         Post Type {sortConfig.key === 'postType' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
//                     </th>
//                     <th>Actions</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {posts.data.length > 0 ? (
//                     filteredPosts.map(post => (
//                         <tr key={post._id}>
//                             <td>{post.postTitle}</td>
//                             <td>{new Date(post.date).toLocaleDateString()}</td>
//                             <td>{getContextName(post.context, contexts?.data || [])}</td>
//                             <td>{post.postType}</td>
//                             <td>
//                                 <button className="edit-btn" onClick={() => handleEditClick(post._id)}>Edit</button>
//                                 <button className="remove-btn" onClick={() => handleRemove(post._id)}>Remove</button>
//                             </td>
//                         </tr>
//                     ))
//                 ) : (
//                     <tr>
//                         <td colSpan="5">No posts found</td>
//                     </tr>
//                 )}
//             </tbody>
//         </table>

//         {/* ✅ Pagination Controls */}
//         <div className="pagination-controls">
//             <button onClick={handlePrevPage} disabled={page === 1}>⬅️ Prev</button>
//             <span> Page {page} of {totalPages} </span>
//             <button onClick={handleNextPage} disabled={page === totalPages}>Next ➡️</button>
//         </div>
//     </div>
// );
// }


// import React, { useContext, useState, useEffect, useMemo } from 'react';
// import PostContext from '../../context/PostContext';
// import ContextContext from '../../context/ContextContext';  // ✅ Import Context Provider
// import axios from '../../config/axios';
// import '../../html/css/Post.css';

// export default function PostList() {
//     const { posts, postsDispatch, handleAddClick, handleEditClick } = useContext(PostContext);
//     const { contexts, isLoading } = useContext(ContextContext);  // ✅ Get contexts and loading state

//     const [searchQuery, setSearchQuery] = useState('');
//     const [sortConfig, setSortConfig] = useState({ key: 'postTitle', direction: 'ascending' });
//     const [page, setPage] = useState(() => parseInt(localStorage.getItem('currentPage')) || 1);
//     const [totalPages, setTotalPages] = useState(1);

//     // ✅ Save current page to local storage
//     useEffect(() => {
//         localStorage.setItem('currentPage', page);
//     }, [page]);

//     // ✅ Reset page when user logs out
//     useEffect(() => {
//         if (!localStorage.getItem('token')) {
//             setPage(1);
//             localStorage.removeItem('currentPage');
//         }
//     }, []);

//     // ✅ Fetch Posts with Pagination
//     useEffect(() => {
//         const fetchPosts = async () => {
//             try {
//                 const response = await axios.get(`/api/admin/posts?page=${page}&limit=10`, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//                 });

//                 console.log("✅ Fetched Posts Data:", response.data);

//                 if (response.data.success) {
//                     postsDispatch({ type: 'SET_POSTS', payload: response.data.posts });
//                     setTotalPages(response.data.totalPages);
//                 }
//             } catch (error) {
//                 console.error("❌ API Fetch Error:", error);
//             }
//         };

//         fetchPosts();
//     }, [page]);

//     // ✅ Fetch contexts when posts are updated
//     useEffect(() => {
//         if (!isLoading && contexts?.data?.length === 0) {
//             console.warn('⚠️ Warning: Contexts are empty, consider refetching.');
//         }
//     }, [contexts, isLoading]);

//     // ✅ Retrieve context names safely
//     const getContextName = (ids, data) => {
//         if (isLoading) return 'Loading...';  // ✅ Show loading state
//         if (!Array.isArray(ids) || !data || data.length === 0) return 'Unknown';

//         const contextNames = ids.map(id => {
//             const item = data.find(ele => ele._id === id);
//             return item ? item.contextTitle : 'Unknown';
//         });

//         return contextNames.join(', ');
//     };

//     // ✅ Delete Post Function
//     const handleRemove = async (id) => {
//         const userInput = window.confirm('Are you sure you want to remove this post?');
//         if (userInput) {
//             try {
//                 await axios.delete(`/api/admin/posts/${id}`, { 
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//                 });

//                 postsDispatch({ type: 'REMOVE_POST', payload: id });

//                 alert('Post deleted successfully!');
//             } catch (err) {
//                 alert('❌ Error deleting post: ' + err.message);
//             }
//         }
//     };

//     // ✅ Search Function
//     const handleSearch = async () => {
//         try {
//             const response = await axios.get(`/api/admin/posts?search=${searchQuery}`, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });

//             console.log("✅ Search Results:", response.data);
//             postsDispatch({ type: 'SET_POSTS', payload: response.data.posts });

//             if (response.data.totalPages) {
//                 setTotalPages(response.data.totalPages);
//             }
//         } catch (error) {
//             console.error("❌ Search API Error:", error);
//         }
//     };

//     // ✅ Sorting Function
//     const requestSort = (key) => {
//         let direction = 'ascending';
//         if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//             direction = 'descending';
//         }
//         setSortConfig({ key, direction });
//     };

//     // ✅ Sorting and Filtering Posts
//     const sortedPosts = useMemo(() => {
//         let sortablePosts = Array.isArray(posts?.data) ? [...posts.data] : [];

//         if (sortConfig !== null) {
//             sortablePosts.sort((a, b) => {
//                 let aValue, bValue;

//                 switch (sortConfig.key) {
//                     case 'postTitle':
//                     case 'postType':
//                         aValue = (a[sortConfig.key] || '').toLowerCase();
//                         bValue = (b[sortConfig.key] || '').toLowerCase();
//                         break;
//                     case 'date':
//                         aValue = new Date(a.date || 0);
//                         bValue = new Date(b.date || 0);
//                         break;
//                     case 'context':
//                         aValue = getContextName(a.context, contexts?.data || []).toLowerCase();
//                         bValue = getContextName(b.context, contexts?.data || []).toLowerCase();
//                         break;
//                     default:
//                         aValue = a[sortConfig.key] || '';
//                         bValue = b[sortConfig.key] || '';
//                         break;
//                 }

//                 if (aValue < bValue) {
//                     return sortConfig.direction === 'ascending' ? -1 : 1;
//                 }
//                 if (aValue > bValue) {
//                     return sortConfig.direction === 'ascending' ? 1 : -1;
//                 }
//                 return 0;
//             });
//         }
//         return sortablePosts;
//     }, [posts?.data, sortConfig, contexts?.data]);

//     // ✅ Pagination Handlers
//     const handleNextPage = () => {
//         if (page < totalPages) setPage(page + 1);
//     };
    
//     const handlePrevPage = () => {
//         if (page > 1) setPage(page - 1);
//     };

//     return (
//         <div className="post-list-container">
//             <button className="add-post-btn" onClick={handleAddClick}>Add Post</button>

//             <div className="search-container">
//                 <input
//                     type="text"
//                     placeholder="Search..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="search-input"
//                 />
//                 <button className="search-btn" onClick={handleSearch}>Search</button> 
//             </div>

//             {isLoading ? (
//                 <p>Loading contexts...</p>  
//             ) : (
//                 <table className="post-table">
//                     <thead>
//                         <tr>
//                             <th onClick={() => requestSort('postTitle')}>Post Title</th>
//                             <th onClick={() => requestSort('date')}>Date</th>
//                             <th onClick={() => requestSort('context')}>Context</th>
//                             <th onClick={() => requestSort('postType')}>Post Type</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {sortedPosts.length > 0 ? (
//                             sortedPosts.map(post => (
//                                 <tr key={post._id}>
//                                     <td>{post.postTitle}</td>
//                                     <td>{new Date(post.date).toLocaleDateString()}</td>
//                                     <td>{getContextName(post.context, contexts?.data || [])}</td>
//                                     <td>{post.postType}</td>
//                                     <td>
//                                         <button className="edit-btn" onClick={() => handleEditClick(post._id)}>Edit</button>
//                                         <button className="remove-btn" onClick={() => handleRemove(post._id)}>Remove</button>
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td colSpan="5">No posts found</td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             )}

//             {/* ✅ Pagination Controls */}
//             <div className="pagination-controls">
//                 <button onClick={handlePrevPage} disabled={page === 1}>⬅️ Prev</button>
//                 <span> Page {page} of {totalPages} </span>
//                 <button onClick={handleNextPage} disabled={page === totalPages}>Next ➡️</button>
//             </div>
//         </div>
//     );
// }
// import React, { useContext, useState, useEffect, useMemo } from "react";
// import PostContext from "../../context/PostContext";
// import ContextContext from "../../context/ContextContext"; // Import Context Provider
// import axios from "../../config/axios";
// import "../../html/css/Post.css";

// export default function PostList() {
//     const { posts, postsDispatch, handleAddClick, handleEditClick } = useContext(PostContext);
//     const { contexts } = useContext(ContextContext);

//     const [searchQuery, setSearchQuery] = useState("");
//     const [sortConfig, setSortConfig] = useState({ key: "postTitle", direction: "ascending" });
//     const [page, setPage] = useState(() => parseInt(localStorage.getItem("currentPage")) || 1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [isLoadingContexts, setIsLoadingContexts] = useState(true); // Ensure contexts are loaded

//     // ✅ Store current page in localStorage
//     useEffect(() => {
//         localStorage.setItem("currentPage", page);
//     }, [page]);

//     // ✅ Reset pagination when user logs out
//     useEffect(() => {
//         if (!localStorage.getItem("token")) {
//             setPage(1);
//             localStorage.removeItem("currentPage");
//         }
//     }, []);

//     // ✅ Fetch Posts with Pagination
//     useEffect(() => {
//         const fetchPosts = async () => {
//             try {
//                 const response = await axios.get(`/api/admin/posts?page=${page}&limit=10`, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//                 });

//                 console.log("✅ Fetched Posts Data:", response.data);

//                 if (response.data.success) {
//                     postsDispatch({ type: "SET_POSTS", payload: response.data.posts });
//                     setTotalPages(response.data.totalPages);
//                 }
//             } catch (error) {
//                 console.error("❌ API Fetch Error:", error);
//             }
//         };

//         fetchPosts();
//     }, [page]);

//     // ✅ Detect when Contexts are loaded
//     useEffect(() => {
//         if (contexts?.data.length > 0) {
//             setIsLoadingContexts(false);
//         }
//     }, [contexts]);

//     // ✅ Search Function
//     const handleSearch = async () => {
//         try {
//             const response = await axios.get(`/api/admin/posts?search=${searchQuery}`, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//             });

//             console.log("✅ Search Results:", response.data);
//             postsDispatch({ type: "SET_POSTS", payload: response.data.posts });

//             if (response.data.totalPages) {
//                 setTotalPages(response.data.totalPages);
//             }
//         } catch (error) {
//             console.error("❌ Search API Error:", error);
//         }
//     };

//     // ✅ Context Lookup Function
//     const getContextName = (ids) => {
//         if (!Array.isArray(ids) || contexts?.data.length === 0) return "Loading...";
//         const contextNames = ids.map((id) => {
//             const item = contexts.data.find((ele) => ele._id === id);
//             return item ? item.contextTitle : "Unknown";
//         });
//         return contextNames.join(", ");
//     };

//     // ✅ Sorting Function
//     const requestSort = (key) => {
//         let direction = "ascending";
//         if (sortConfig.key === key && sortConfig.direction === "ascending") {
//             direction = "descending";
//         }
//         setSortConfig({ key, direction });
//     };

//     // ✅ Sorting and Filtering Posts
//     const sortedPosts = useMemo(() => {
//         let sortablePosts = Array.isArray(posts?.data) ? [...posts.data] : [];

//         if (sortConfig !== null) {
//             sortablePosts.sort((a, b) => {
//                 let aValue, bValue;

//                 switch (sortConfig.key) {
//                     case "postTitle":
//                     case "postType":
//                         aValue = (a[sortConfig.key] || "").toLowerCase();
//                         bValue = (b[sortConfig.key] || "").toLowerCase();
//                         break;
//                     case "date":
//                         aValue = new Date(a.date || 0);
//                         bValue = new Date(b.date || 0);
//                         break;
//                     case "context":
//                         aValue = getContextName(a.context).toLowerCase();
//                         bValue = getContextName(b.context).toLowerCase();
//                         break;
//                     default:
//                         aValue = a[sortConfig.key] || "";
//                         bValue = b[sortConfig.key] || "";
//                         break;
//                 }

//                 return sortConfig.direction === "ascending"
//                     ? aValue < bValue
//                         ? -1
//                         : 1
//                     : aValue > bValue
//                     ? -1
//                     : 1;
//             });
//         }
//         return sortablePosts;
//     }, [posts?.data, sortConfig, contexts?.data]);

//     // ✅ Pagination Handlers
//     const handleNextPage = () => {
//         if (page < totalPages) setPage(page + 1);
//     };

//     const handlePrevPage = () => {
//         if (page > 1) setPage(page - 1);
//     };

//     // ✅ Show Loading State Until Contexts Load
//     if (isLoadingContexts) {
//         return <h3>Loading Contexts...</h3>;
//     }

//     return (
//         <div className="post-list-container">
//             <button className="add-post-btn" onClick={handleAddClick}>Add Post</button>

//             <div className="search-container">
//                 <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input"/>
//                 <button className="search-btn" onClick={handleSearch}>Search</button>
//             </div>

//             <table className="post-table">
//                 <thead>
//                     <tr>
//                         <th onClick={() => requestSort("postTitle")}>Post Title</th>
//                         <th onClick={() => requestSort("date")}>Date</th>
//                         <th onClick={() => requestSort("context")}>Context</th>
//                         <th onClick={() => requestSort("postType")}>Post Type</th>
//                         <th>Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {sortedPosts.map((post) => (
//                         <tr key={post._id}>
//                             <td>{post.postTitle}</td>
//                             <td>{new Date(post.date).toLocaleDateString()}</td>
//                             <td>{getContextName(post.context)}</td>
//                             <td>{post.postType}</td>
//                             <td>
//                                 <button className="edit-btn" onClick={() => handleEditClick(post._id)}>Edit</button>
//                                 <button className="remove-btn">Remove</button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {/* ✅ Pagination Controls */}
//             <div className="pagination-controls">
//                 <button onClick={handlePrevPage} disabled={page === 1}>⬅️ Prev</button>
//                  <span> Page {page} of {totalPages} </span>
//                  <button onClick={handleNextPage} disabled={page === totalPages}>Next ➡️</button>
//              </div>
//          </div>
    
//     );
// }
// import React, { useContext, useState, useEffect, useMemo } from "react";
// import PostContext from "../../context/PostContext";
// import ContextContext from "../../context/ContextContext"; // ✅ Import Context Provider
// import axios from "../../config/axios";
// import "../../html/css/Post.css";

// export default function PostList() {
//     const { posts, postsDispatch, handleAddClick, handleEditClick } = useContext(PostContext);
//     const { contexts, isLoading } = useContext(ContextContext); // ✅ Get contexts & loading state

//     const [searchQuery, setSearchQuery] = useState("");
//     const [sortConfig, setSortConfig] = useState({ key: "postTitle", direction: "ascending" });
//     const [page, setPage] = useState(() => parseInt(localStorage.getItem("currentPage")) || 1);
//     const [totalPages, setTotalPages] = useState(1);

//     // ✅ Store current page in localStorage
//     useEffect(() => {
//         localStorage.setItem("currentPage", page);
//     }, [page]);

//     // ✅ Reset pagination when user logs out
//     useEffect(() => {
//         if (!localStorage.getItem("token")) {
//             setPage(1);
//             localStorage.removeItem("currentPage");
//         }
//     }, []);

//     // ✅ Fetch Posts with Pagination
//     useEffect(() => {
//         const fetchPosts = async () => {
//             try {
//                 const response = await axios.get(`/api/admin/posts?page=${page}&limit=10`, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//                 });

//                 console.log("✅ Fetched Posts Data:", response.data);

//                 if (response.data.success) {
//                     postsDispatch({ type: "SET_POSTS", payload: response.data.posts });
//                     setTotalPages(response.data.totalPages);
//                 }
//             } catch (error) {
//                 console.error("❌ API Fetch Error:", error);
//             }
//         };

//         fetchPosts();
//     }, [page]);

//     // ✅ Search Function
//     const handleSearch = async () => {
//         try {
//             const response = await axios.get(`/api/admin/posts?search=${searchQuery}`, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//             });

//             console.log("✅ Search Results:", response.data);
//             postsDispatch({ type: "SET_POSTS", payload: response.data.posts });

//             if (response.data.totalPages) {
//                 setTotalPages(response.data.totalPages);
//             }
//         } catch (error) {
//             console.error("❌ Search API Error:", error);
//         }
//     };

//     // ✅ Context Lookup Function
//     const getContextName = (ids) => {
//         if (!Array.isArray(ids) || isLoading || !contexts?.data?.length) return "Loading...";
//         const contextNames = ids.map((id) => {
//             const item = contexts.data.find((ele) => ele._id === id);
//             return item ? item.contextTitle : "Unknown";
//         });
//         return contextNames.join(", ");
//     };

//     // ✅ Sorting Function
//     const requestSort = (key) => {
//         let direction = "ascending";
//         if (sortConfig.key === key && sortConfig.direction === "ascending") {
//             direction = "descending";
//         }
//         setSortConfig({ key, direction });
//     };

//     // ✅ Sorting and Filtering Posts
//     const sortedPosts = useMemo(() => {
//         let sortablePosts = Array.isArray(posts?.data) ? [...posts.data] : [];

//         if (sortConfig !== null) {
//             sortablePosts.sort((a, b) => {
//                 let aValue, bValue;

//                 switch (sortConfig.key) {
//                     case "postTitle":
//                     case "postType":
//                         aValue = (a[sortConfig.key] || "").toLowerCase();
//                         bValue = (b[sortConfig.key] || "").toLowerCase();
//                         break;
//                     case "date":
//                         aValue = new Date(a.date || 0);
//                         bValue = new Date(b.date || 0);
//                         break;
//                     case "context":
//                         aValue = getContextName(a.context).toLowerCase();
//                         bValue = getContextName(b.context).toLowerCase();
//                         break;
//                     default:
//                         aValue = a[sortConfig.key] || "";
//                         bValue = b[sortConfig.key] || "";
//                         break;
//                 }

//                 return sortConfig.direction === "ascending"
//                     ? aValue < bValue
//                         ? -1
//                         : 1
//                     : aValue > bValue
//                     ? -1
//                     : 1;
//             });
//         }
//         return sortablePosts;
//     }, [posts?.data, sortConfig, contexts?.data]);

//     // ✅ Filter Posts Based on Search Query
//     const filteredPosts = useMemo(() => {
//         return sortedPosts.filter((post) =>
//             (post.postTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
//         );
//     }, [sortedPosts, searchQuery]);

//     // ✅ Pagination Handlers
//     const handleNextPage = () => {
//         if (page < totalPages) setPage(page + 1);
//     };

//     const handlePrevPage = () => {
//         if (page > 1) setPage(page - 1);
//     };

//     // ✅ Show Loading State Until Contexts Load
//     if (isLoading) {
//         return <h3>Loading Contexts...</h3>;
//     }

//     return (
//         <div className="post-list-container">
//             <button className="add-post-btn" onClick={handleAddClick}>Add Post</button>

//             <div className="search-container">
//                 <input 
//                     type="text" 
//                     placeholder="Search..." 
//                     value={searchQuery} 
//                     onChange={(e) => setSearchQuery(e.target.value)} 
//                     className="search-input"
//                 />
//                 <button className="search-btn" onClick={handleSearch}>Search</button>
//             </div>

//             <table className="post-table">
//                 <thead>
//                     <tr>
//                         <th onClick={() => requestSort("postTitle")}>Post Title</th>
//                         <th onClick={() => requestSort("date")}>Date</th>
//                         <th onClick={() => requestSort("context")}>Context</th>
//                         <th onClick={() => requestSort("postType")}>Post Type</th>
//                         <th>Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredPosts.length > 0 ? (
//                         filteredPosts.map((post) => (
//                             <tr key={post._id}>
//                                 <td>{post.postTitle}</td>
//                                 <td>{new Date(post.date).toLocaleDateString()}</td>
//                                 <td>{getContextName(post.context)}</td>
//                                 <td>{post.postType}</td>
//                                 <td>
//                                     <button className="edit-btn" onClick={() => handleEditClick(post._id)}>Edit</button>
//                                     <button className="remove-btn">Remove</button>
//                                 </td>
//                             </tr>
//                         ))
//                     ) : (
//                         <tr>
//                             <td colSpan="5">No posts found</td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>

//             {/* ✅ Pagination Controls */}
//             <div className="pagination-controls">
//                 <button onClick={handlePrevPage} disabled={page === 1}>⬅️ Prev</button>
//                  <span> Page {page} of {totalPages} </span>
//                  <button onClick={handleNextPage} disabled={page === totalPages}>Next ➡️</button>
//              </div>
//          </div>
//     );
// }
import React, { useContext, useState, useEffect, useMemo } from "react";
import PostContext from "../../context/PostContext";
import ContextContext from "../../context/ContextContext"; // ✅ Import Context Provider
import axios from "../../config/axios";
import "../../html/css/Post.css";

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
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error("❌ API Fetch Error:", error);
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
            fetchPosts(); // ✅ Reset to full list when empty
            return;
        }

        try {
            const response = await axios.get(`/api/admin/posts?search=${searchQuery}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            console.log("✅ Search Results:", response.data);
            postsDispatch({ type: "SET_POSTS", payload: response.data.posts });

            if (response.data.totalPages) {
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error("❌ Search API Error:", error);
        }
    };

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
                                    <button className="remove-btn">Remove</button>
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
