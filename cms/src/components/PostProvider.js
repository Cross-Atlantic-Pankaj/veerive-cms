import React, { useReducer, useState, useEffect, useContext } from 'react';
import axios from '../config/axios';
import PostContext from '../context/PostContext';
import ContextContext from '../context/ContextContext';
import CountryContext from '../context/CountryContext';
import SourceContext from '../context/SourceContext';
import CompanyContext from '../context/CompanyContext';


const postReducer = (state, action) => {
    switch (action.type) {
        case 'SET_POSTS': 
            return { ...state, data: action.payload.sort((a, b) => new Date(b.date) - new Date(a.date)) }; // ✅ Ensure sorting in reducer
        case 'ADD_POST': 
            return { ...state, data: [action.payload, ...state.data].sort((a, b) => new Date(b.date) - new Date(a.date)) }; // ✅ Always add new post at the top
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
                        ? { ...action.payload, contexts: action.payload.contexts || [] }
                        : ele
                ).sort((a, b) => new Date(b.date) - new Date(a.date)), // ✅ Ensure sorting after update
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
    const handleFormSubmit = async (formData, editId = null) => {
        try {
            let response;
            if (editId) {
                // Update existing post
                response = await axios.put(`/api/admin/posts/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    postsDispatch({ type: 'UPDATE_POST', payload: response.data.updatedPost });
                    setSuccessMessage('Post updated successfully!');
                }
            } else {
                // Create new post
                response = await axios.post('/api/admin/posts', formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    postsDispatch({ type: 'ADD_POST', payload: response.data.post });
                    setSuccessMessage('Post added successfully!');
                }
            }
            
            setIsFormVisible(false);
            localStorage.removeItem("isFormVisible");
            localStorage.removeItem("editId");

            await fetchPosts(page); // Refresh the list
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (err) {
            console.error("❌ Error submitting form:", err.response?.data || err);
            const errorMsg = err.response?.data?.message || "An unknown error occurred.";
            setSuccessMessage(`Error: ${errorMsg}`); // Show specific error
            setTimeout(() => setSuccessMessage(''), 5000); // Let error stay longer
        }
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
