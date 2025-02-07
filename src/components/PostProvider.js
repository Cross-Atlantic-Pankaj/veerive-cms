import React, { useReducer, useState, useEffect, useContext } from 'react'; // Import necessary React hooks
import axios from '../config/axios'; // Import axios instance for API requests
import PostContext from '../context/PostContext'; // Import PostContext for managing post-related state
import ContextContext from '../context/ContextContext'; // Import ContextContext for managing context-related state
import CountryContext from '../context/CountryContext'; // Import CountryContext for managing country-related state
import SourceContext from '../context/SourceContext'; // Import SourceContext for managing source-related state
import CompanyContext from '../context/CompanyContext'; // Import CompanyContext for managing company-related state

// Reducer function to manage post-related state updates
const postReducer = (state, action) => {
    switch (action.type) {
        case 'SET_POSTS': // Action type for setting the list of posts
            return { ...state, data: action.payload }; // Update state with the list of posts
        case 'ADD_POST': // Action type for adding a new post
            return { ...state, data: [...state.data, action.payload] }; // Add new post to the list
        case 'REMOVE_POST': // Action type for removing a post
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) }; // Remove post from the list
        case 'SET_EDIT_ID': // Action type for setting the ID of the post being edited
            return { ...state, editId: action.payload }; // Set edit ID in state
        case 'UPDATE_POST': // Action type for updating an existing post
            return {
                ...state,
                editId: null, // Clear the edit ID after update
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele // Update post in the list
                ),
            };
        default:
            return state; // Return the current state if no matching action type is found
    }
};

// ContextProvider component for managing and providing post-related state to child components
export const PostProvider = ({ children }) => {
    // Initialize state and dispatch for managing posts using useReducer
    //const [posts, postsDispatch] = useReducer(postReducer, { data: [], editId: null });
    const [posts, postsDispatch] = useReducer(postReducer, { data: [], editId: null });

    const [isFormVisible, setIsFormVisible] = useState(false); // State for controlling the visibility of the form
    const [successMessage, setSuccessMessage] = useState(''); // State for storing success messages

    // Access various contexts needed for the component
    const { contexts } = useContext(ContextContext); // Retrieve context data from ContextContext
    const { countries } = useContext(CountryContext); // Retrieve country data from CountryContext
    const { companies } = useContext(CompanyContext); // Retrieve company data from CompanyContext
    const { sources } = useContext(SourceContext); // Retrieve source data from SourceContext

    // useEffect hook to fetch post data when the component mounts
    
    // useEffect(() => {
    //     const fetchPosts = async () => {
    //         try {
    //             const response = await axios.get('/api/admin/posts', {
    //                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    //             });
    
    //             console.log('✅ API Response:', response.data);
    
    //             // ✅ Ensure posts are extracted correctly and store them
    //             if (response.data.success && Array.isArray(response.data.posts)) {
    //                 postsDispatch({
    //                     type: 'SET_POSTS',
    //                     payload: response.data.posts
    //                 });
    //             } else {
    //                 postsDispatch({ type: 'SET_POSTS', payload: [] });
    //             }
    //         } catch (err) {
    //             console.error('❌ Error fetching posts:', err);
    //             postsDispatch({ type: 'SET_POSTS', payload: [] }); // Prevent state issues
    //         }
    //     };
    
    //     fetchPosts();
    // }, []);
    
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    postsDispatch({ type: 'SET_POSTS', payload: [] }); // ✅ Reset posts if no token
                    return;
                }
    
                const response = await axios.get('/api/admin/posts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
    
                console.log('✅ API Response:', response.data);
    
                if (response.data.success && Array.isArray(response.data.posts)) {
                    postsDispatch({
                        type: 'SET_POSTS',
                        payload: response.data.posts
                    });
                } else {
                    postsDispatch({ type: 'SET_POSTS', payload: [] });
                }
            } catch (err) {
                console.error('❌ Error fetching posts:', err);
                postsDispatch({ type: 'SET_POSTS', payload: [] }); // ✅ Ensures state is cleared on error
            }
        };
    
        fetchPosts();
    }, []);
    
    // Handler function for clicking the "Add" button
    const handleAddClick = () => {
        // Dispatch action to clear the edit ID
        postsDispatch({ type: 'SET_EDIT_ID', payload: null });
        // Show the form for adding a new post
        setIsFormVisible(true);
    };

    // Handler function for clicking the "Edit" button
    const handleEditClick = (id) => {
        // Dispatch action to set the edit ID for the post being edited
        postsDispatch({ type: 'SET_EDIT_ID', payload: id });
        // Show the form for editing the selected post
        setIsFormVisible(true);
    };

    // Handler function for form submission
    const handleFormSubmit = (message) => {
        // Hide the form after submission
        setIsFormVisible(false);
        // Set the success message to be displayed
        setSuccessMessage(message);
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Provide post-related state and functions to child components through PostContext
    return (
        <PostContext.Provider value={{ posts, postsDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit, contexts, countries, companies, sources }}>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {children} 
        </PostContext.Provider>
    );
};
