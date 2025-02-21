// import React, { useReducer, useState, useEffect, useContext } from 'react';
// import axios from '../config/axios';
// import PostContext from '../context/PostContext';
// import ContextContext from '../context/ContextContext';
// import CountryContext from '../context/CountryContext';
// import SourceContext from '../context/SourceContext';
// import CompanyContext from '../context/CompanyContext';

// // Reducer function to manage post-related state updates
// const postReducer = (state, action) => {
//     switch (action.type) {
//         case 'SET_POSTS': // ✅ Set the list of posts
//             return { ...state, data: action.payload };
//         case 'ADD_POST': // ✅ Add new post
//             return { ...state, data: [...state.data, action.payload] };
//         case 'REMOVE_POST': // ✅ Remove a post
//             return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
//         case 'SET_EDIT_ID': // ✅ Set ID for editing
//             return { ...state, editId: action.payload };
//         case 'UPDATE_POST': // ✅ Update an existing post
//             return {
//                 ...state,
//                 editId: null,
//                 data: state.data.map((ele) =>
//                     ele._id === action.payload._id ? { ...action.payload } : ele
//                 ),
//             };
//         default:
//             return state;
//     }
// };

// // ✅ PostProvider Component
// export const PostProvider = ({ children }) => {
//     const [posts, postsDispatch] = useReducer(postReducer, { data: [], editId: null });
//     const [isFormVisible, setIsFormVisible] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');

//     const [page, setPage] = useState(1); // ✅ Fix: Define page state
//     const [totalPages, setTotalPages] = useState(1); // ✅ Fix: Define totalPages state

//     // Retrieve other necessary contexts
//     const { contexts } = useContext(ContextContext);
//     const { countries } = useContext(CountryContext);
//     const { companies } = useContext(CompanyContext);
//     const { sources } = useContext(SourceContext);

//     // // ✅ Fetch posts when component mounts
//     useEffect(() => {
//         fetchPosts();
//     }, []);

//     // const fetchPosts = async () => {
//     //     const token = localStorage.getItem('token');
//     //     if (!token) return;
    
//     //     let allPosts = [];
//     //     let currentPage = 1;
//     //     const limit = 100; // Fetch in batches of 100 for better performance
    
//     //     try {
//     //         while (true) {
//     //             const response = await axios.get(`/api/admin/posts?page=${currentPage}&limit=${limit}`, {
//     //                 headers: { Authorization: `Bearer ${token}` },
//     //             });
    
//     //             if (response.data.success && Array.isArray(response.data.posts)) {
//     //                 allPosts = [...allPosts, ...response.data.posts];
    
//     //                 if (response.data.posts.length < limit) break; // Exit loop if fewer results returned
//     //             } else {
//     //                 break; // Exit loop on unexpected response
//     //             }
    
//     //             currentPage++;
//     //         }
    
//     //         console.log("🔍 Fetched All Posts:", allPosts.length);
//     //         postsDispatch({ type: 'SET_POSTS', payload: allPosts });
    
//     //     } catch (err) {
//     //         console.error('❌ Error fetching posts:', err);
//     //         postsDispatch({ type: 'SET_POSTS', payload: [] });
//     //     }
//     // };
//     // const fetchPosts = async () => {
//     //     const token = localStorage.getItem('token');
//     //     if (!token) return;
    
//     //     let allPosts = [];
//     //     let currentPage = 1;
//     //     const limit = 10; // Adjust based on API limits
    
//     //     try {
//     //         do {
//     //             const response = await axios.get(`/api/admin/posts?page=${currentPage}&limit=${limit}`, {
//     //                 headers: { Authorization: `Bearer ${token}` },
//     //             });
    
//     //             if (response.data.success && Array.isArray(response.data.posts)) {
//     //                 allPosts = [...allPosts, ...response.data.posts];
//     //             }
    
//     //             if (response.data.posts.length < limit) break;
//     //             currentPage++;
//     //         } while (true);
    
//     //         console.log("✅ All Posts Fetched:", allPosts.length);
    
//     //         postsDispatch({ type: 'SET_POSTS', payload: allPosts });
    
//     //     } catch (err) {
//     //         console.error('❌ Error fetching posts:', err);
//     //         postsDispatch({ type: 'SET_POSTS', payload: [] });
//     //     }
//     // };
//     const fetchPosts = async (page = 1) => { // ✅ Fix: Use page argument
//         const token = localStorage.getItem('token');
//         if (!token) return;

//         try {
//             console.log(`🔄 Fetching posts for page ${page}...`);

//             const response = await axios.get(`/api/admin/posts?page=${page}&limit=10`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (response.data.success) {
//                 postsDispatch({ type: "SET_POSTS", payload: response.data.posts });
//                 setTotalPages(response.data.totalPages || 1); // ✅ Fix: Set totalPages correctly
//                 setPage(page); // ✅ Fix: Ensure page state updates correctly
//             }
//         } catch (err) {
//             console.error("❌ Error fetching posts:", err);
//             postsDispatch({ type: "SET_POSTS", payload: [] });
//         }
//     };

    
//     // // ✅ Handle Add Click
//     const handleAddClick = () => {
//         postsDispatch({ type: 'SET_EDIT_ID', payload: null });
//         setIsFormVisible(true);
//     };
    

//     // ✅ Handle Edit Click
//     // const handleEditClick = (id) => {
//     //     postsDispatch({ type: 'SET_EDIT_ID', payload: id });
//     //     setIsFormVisible(true);
//     // };
//     const handleEditClick = (id) => {
//         postsDispatch({ type: 'SET_EDIT_ID', payload: id });
//         setIsFormVisible(true);
//         localStorage.setItem("editId", id);  // ✅ Store editId
//         localStorage.setItem("isFormVisible", "true");  // ✅ Persist form state
//     };
    
//     // ✅ Handle Form Submission
// //   const handleFormSubmit = async (message, editedPostId = null) => {
// //         setIsFormVisible(false);
// //         setSuccessMessage(message);

// //         if (!editedPostId) {
// //             // ✅ Only reset pagination for new posts
// //             localStorage.setItem("currentPage", 1);
// //             setPage(1);
// //         }

// //         await fetchPosts(page); // ✅ Fetch paginated posts for the current page
// //         setTimeout(() => setSuccessMessage(''), 3000);
// //     };
// const handleFormSubmit = async (message, editedPostId = null) => {
//     setSuccessMessage(message);

//     if (editedPostId) {
//         localStorage.setItem("editId", editedPostId);  // ✅ Keep editId stored
//         localStorage.setItem("isFormVisible", "true");  // ✅ Keep form open after editing
//     } else {
//         localStorage.removeItem("editId");  // ✅ Remove editId for new posts
//         localStorage.removeItem("isFormVisible");  // ✅ Hide form for new posts
//         setIsFormVisible(false);
//     }

//     await fetchPosts(page);
//     setTimeout(() => setSuccessMessage(''), 3000);
// };
// useEffect(() => {
//     const savedEditId = localStorage.getItem("editId");
//     const savedFormVisible = localStorage.getItem("isFormVisible");

//     if (savedEditId) {
//         postsDispatch({ type: 'SET_EDIT_ID', payload: savedEditId });
//     }

//     if (savedFormVisible === "true") {
//         setIsFormVisible(true);
//     }
// }, []);

    
//     return (
//         <PostContext.Provider value={{ 
//             posts, 
//             postsDispatch, 
//             fetchPosts, // ✅ Now available globally
//             isFormVisible, 
//             setIsFormVisible, 
//             handleAddClick, 
//             handleEditClick, 
//             handleFormSubmit, 
//             contexts, 
//             countries, 
//             companies, 
//             sources ,
//             page, 
//             setPage, 
//             totalPages, 
//             setTotalPages,
//         }}>
//             {successMessage && <div className="success-message">{successMessage}</div>}
//             {children}
//         </PostContext.Provider>
//     );
// };
// import React, { useReducer, useState, useEffect, useContext } from 'react';
// import axios from '../config/axios';
// import PostContext from '../context/PostContext';
// import ContextContext from '../context/ContextContext';
// import CountryContext from '../context/CountryContext';
// import SourceContext from '../context/SourceContext';
// import CompanyContext from '../context/CompanyContext';

// // Reducer function to manage post-related state updates
// const postReducer = (state, action) => {
//     switch (action.type) {
//         case 'SET_POSTS': 
//             return { ...state, data: action.payload };
//         case 'ADD_POST': 
//             return { ...state, data: [...state.data, action.payload] };
//         case 'REMOVE_POST': 
//             return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
//         case 'SET_EDIT_ID': 
//             return { ...state, editId: action.payload };
//         case 'UPDATE_POST': 
//              return {

//             ...state,
//             editId: null,
//             data: state.data.map((ele) =>
//                 ele._id === action.payload._id
//                     ? { ...action.payload, contexts: action.payload.contexts || [] } // ✅ Ensure contexts exist
//                     : ele
//             ),
//         };
//         default:
//             return state;
//     }
// };

// // ✅ PostProvider Component
// export const PostProvider = ({ children }) => {
//     const [posts, postsDispatch] = useReducer(postReducer, { data: [], editId: null });
//     const [isFormVisible, setIsFormVisible] = useState(
//         localStorage.getItem("isFormVisible") === "true" // ✅ Restore form visibility on reload
//     );
//     const [successMessage, setSuccessMessage] = useState('');

//     const [page, setPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);

//     // Retrieve other necessary contexts
//     const { contexts } = useContext(ContextContext);
//     const { countries } = useContext(CountryContext);
//     const { companies } = useContext(CompanyContext);
//     const { sources } = useContext(SourceContext);

//     useEffect(() => {
//         fetchPosts();
//     }, []);

// const fetchPosts = async () => {
//     const token = localStorage.getItem("token"); // ✅ Get the token

//     if (!token) {
//         console.error("❌ No token found, user might be logged out.");
//         return; // Stop API call if no token
//     }
//     try {
//         let allPosts = [];
//         let currentPage = 1;
//         let totalPages = 1;

//         do {
//             const response = await axios.get(`/api/admin/posts?page=${currentPage}&limit=10`, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//             });

//             if (response.data.success) {
//                 allPosts = [...allPosts, ...response.data.posts];
//                 totalPages = response.data.totalPages;
//                 currentPage++;
//             } else {
//                 break;
//             }
//         } while (currentPage <= totalPages);

//         console.log("✅ Fetched All Posts:", allPosts.length);
//         postsDispatch({ type: 'SET_POSTS', payload: allPosts });

//     } catch (err) {
//         console.error("❌ Error fetching posts:", err);
//     }
// };


//     // ✅ Handle Add Click (New Post)
    
//     const handleAddClick = () => {
//         postsDispatch({ type: 'SET_EDIT_ID', payload: null }); // ✅ Remove edit mode
//         setIsFormVisible(true);
//         localStorage.removeItem("postFormData"); // ✅ Remove saved form data
//         localStorage.setItem("isFormVisible", "true"); // ✅ Ensure form stays open
//     };
    

//     // ✅ Handle Edit Click
//     const handleEditClick = (id) => {
//         postsDispatch({ type: 'SET_EDIT_ID', payload: id });
//         setIsFormVisible(true);
//         localStorage.setItem("editId", id);  
//         localStorage.setItem("isFormVisible", "true"); 
//     };

//     // ✅ Handle Form Submission
//     const handleFormSubmit = async (message, editedPostId = null) => {
//         setSuccessMessage(message);

//         if (editedPostId) {
//             localStorage.setItem("editId", editedPostId);
//             localStorage.setItem("isFormVisible", "true");
//         } else {
//             localStorage.removeItem("editId");
//             localStorage.removeItem("isFormVisible");
//             setIsFormVisible(false);
//         }

//         await fetchPosts(page);
//         setTimeout(() => setSuccessMessage(''), 3000);
//     };

//     // ✅ Restore Form State on Reload
    
//     useEffect(() => {
//         const savedEditId = localStorage.getItem("editId");
//         const savedFormVisible = localStorage.getItem("isFormVisible");
    
//         if (savedEditId) {
//             postsDispatch({ type: 'SET_EDIT_ID', payload: savedEditId });
//         }
    
//         if (savedFormVisible === "true") {
//             setIsFormVisible(true);
//         }
    
//         // ✅ Wait for posts to load before setting form data
//         fetchPosts().then(() => {
//             const savedData = JSON.parse(localStorage.getItem("postFormData"));
//             if (savedData) {
//                 postsDispatch({ type: "SET_POSTS", payload: [savedData] });
//             }
//         });
//     }, []);
    
//     const handleGoToPostList = () => {
//         setIsFormVisible(false);
//         localStorage.removeItem("isFormVisible"); // ✅ Ensure it resets
//     };
    
//     return (
//         <PostContext.Provider value={{ 
//             posts, 
//             postsDispatch, 
//             fetchPosts,
//             isFormVisible, 
//             setIsFormVisible, 
//             handleAddClick, 
//             handleEditClick, 
//             handleFormSubmit, 
//             contexts, 
//             countries, 
//             companies, 
//             sources,
//             page, 
//             setPage, 
//             totalPages, 
//             setTotalPages,
//             handleGoToPostList
//         }}>
//             {successMessage && <div className="success-message">{successMessage}</div>}
//             {children}
//         </PostContext.Provider>
//     );
// };
import React, { useReducer, useState, useEffect, useContext } from 'react';
import axios from '../config/axios';
import PostContext from '../context/PostContext';
import ContextContext from '../context/ContextContext';
import CountryContext from '../context/CountryContext';
import SourceContext from '../context/SourceContext';
import CompanyContext from '../context/CompanyContext';

// Reducer function to manage post-related state updates
const postReducer = (state, action) => {
    switch (action.type) {
        case 'SET_POSTS': 
            return { ...state, data: action.payload };
        case 'ADD_POST': 
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_POST': 
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID': 
            return { ...state, editId: action.payload };
        case 'UPDATE_POST': 
            return {
                ...state,
                editId: null,
                data: state.data.map((ele) =>
                    ele._id === action.payload._id
                        ? { ...action.payload, contexts: action.payload.contexts || [] } // ✅ Ensure contexts exist
                        : ele
                ),
            };
        default:
            return state;
    }
};

// ✅ PostProvider Component
export const PostProvider = ({ children }) => {
    const [posts, postsDispatch] = useReducer(postReducer, { data: [], editId: null });
    const [isFormVisible, setIsFormVisible] = useState(
        localStorage.getItem("isFormVisible") === "true" // ✅ Restore form visibility on reload
    );
    const [successMessage, setSuccessMessage] = useState('');
    
    // ✅ Restore the last visited page from localStorage
    const [page, setPage] = useState(() => parseInt(localStorage.getItem("currentPage")) || 1);
    const [totalPages, setTotalPages] = useState(1);

    // Retrieve other necessary contexts
    //const { contexts } = useContext(ContextContext);
    const contextData = useContext(ContextContext) || {}; // ✅ Ensure it doesn't crash
    const { contexts = [] } = contextData; // ✅ Default to an empty array if undefined

    const { countries } = useContext(CountryContext);
    const { companies } = useContext(CompanyContext);
    const { sources } = useContext(SourceContext);

    useEffect(() => {
        fetchPosts(page); // ✅ Fetch posts only for the correct page
    }, [page]); // ✅ Only fetch when `page` changes

    useEffect(() => {
        localStorage.setItem("currentPage", page); // ✅ Store last visited page in localStorage
    }, [page]);

    const fetchPosts = async (currentPage) => {
        const token = localStorage.getItem("token"); // ✅ Get token

        if (!token) {
            //console.error("❌ No token found, user might be logged out.");
            return; // Stop API call if no token
        }

        try {
            console.log("🔄 Fetching posts for page:", currentPage);
            const response = await axios.get(`/api/admin/posts?page=${currentPage}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }, // ✅ Use token here
            });

            if (response.data.success) {
                console.log("✅ Successfully fetched posts:", response.data.posts.length);
                postsDispatch({ type: 'SET_POSTS', payload: response.data.posts });
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (err) {
            console.error("❌ Error fetching posts:", err);
        }
    };

    const fetchAllPosts = async () => {
        const token = localStorage.getItem("token");
    
        if (!token) {
            console.error("❌ No token found, user might be logged out.");
            return;
        }
    
        try {
            const response = await axios.get(`/api/admin/posts/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("🔍 Debug: API Response for fetchAllPosts()", response.data); // ✅ Log full response
            if (response.data.success) {
                console.log("✅ Fetched All Posts:", response.data.posts.length);
                postsDispatch({ type: 'SET_POSTS', payload: response.data.posts });
            }
        } catch (err) {
            console.error("❌ Error fetching all posts:", err);
        }
    };
    
    // ✅ Handle Add Click (New Post)
    const handleAddClick = () => {
        postsDispatch({ type: 'SET_EDIT_ID', payload: null }); // ✅ Remove edit mode
        setIsFormVisible(true);
        localStorage.removeItem("postFormData"); // ✅ Remove saved form data
        localStorage.setItem("isFormVisible", "true"); // ✅ Ensure form stays open
    };

    // ✅ Handle Edit Click
    const handleEditClick = (id) => {
        postsDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
        localStorage.setItem("editId", id);  
        localStorage.setItem("isFormVisible", "true"); 
    };

    // ✅ Handle Form Submission
    const handleFormSubmit = async (message, editedPostId = null) => {
        setSuccessMessage(message);

        if (editedPostId) {
            localStorage.setItem("editId", editedPostId);
            localStorage.setItem("isFormVisible", "true");
        } else {
            localStorage.removeItem("editId");
            localStorage.removeItem("isFormVisible");
            setIsFormVisible(false);
        }

        await fetchPosts(page);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // ✅ Restore Form State on Reload
    useEffect(() => {
        const savedEditId = localStorage.getItem("editId");
        const savedFormVisible = localStorage.getItem("isFormVisible");

        if (savedEditId) {
            postsDispatch({ type: 'SET_EDIT_ID', payload: savedEditId });
        }

        if (savedFormVisible === "true") {
            setIsFormVisible(true);
        }
    }, []);

    const handleGoToPostList = () => {
        setIsFormVisible(false);
        localStorage.removeItem("isFormVisible"); // ✅ Ensure it resets
    };

    return (
        <PostContext.Provider value={{ 
            posts, postsDispatch, fetchPosts,
            isFormVisible, setIsFormVisible,
            handleAddClick, handleEditClick, handleFormSubmit, 
            contexts, countries, companies, sources,
            page, setPage, totalPages, setTotalPages,
            handleGoToPostList, fetchAllPosts
        }}>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {children}
        </PostContext.Provider>
    );
};
