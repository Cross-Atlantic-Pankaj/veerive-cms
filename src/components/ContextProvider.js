import React, { useReducer, useState, useEffect, useContext } from 'react'; // Import React and hooks for state management and side effects
import axios from '../config/axios'; // Import axios instance for API calls
import ContextContext from '../context/ContextContext'; // Import ContextContext for managing context-related state
import SectorContext from '../context/SectorContext'; // Import SectorContext for managing sector-related state
import SubSectorContext from '../context/SubSectorContext'; // Import SubSectorContext for managing sub-sector-related state
import ThemeContext from '../context/ThemeContext'; // Import ThemeContext for managing theme-related state
import SignalContext from '../context/SignalContext'; // Import SignalContext for managing signal-related state
import SubSignalContext from '../context/SubSignalContext'; // Import SubSignalContext for managing sub-signal-related state
import PostContext from '../context/PostContext';

// Reducer function to handle context-related actions and state updates
const contextReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CONTEXTS': // Action type for setting the list of contexts
            return { ...state, data: action.payload }; // Update state with new list of contexts
        case 'ADD_CONTEXT': // Action type for adding a new context
            return { ...state, data: [...state.data, action.payload] }; // Add the new context to the list
        case 'REMOVE_CONTEXT': // Action type for removing a context
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) }; // Filter out the context to be removed
        case 'SET_EDIT_ID': // Action type for setting the ID of the context being edited
            return { ...state, editId: action.payload }; // Update editId in the state
        case 'UPDATE_CONTEXT': // Action type for updating a context
            return {
                ...state,
                editId: null, // Clear the editId after updating
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ), // Update the context in the list
            };
        default:
            return state; // Return the current state if action type does not match
    }
};

// ContextProvider component to manage context state and provide context
export const ContextProvider = ({ children }) => {
    // Initialize state and dispatch for managing context-related actions
    const [contexts, contextsDispatch] = useReducer(contextReducer, { data: [], editId: null });
    const [isFormVisible, setIsFormVisible] = useState(false); // State to control the visibility of the form
    const [successMessage, setSuccessMessage] = useState(''); // State to store success messages
    const [posts, setPosts] = useState([]);

    // Retrieve sector, sub-sector, theme, signal, and sub-signal data from their respective contexts
    const { sectors } = useContext(SectorContext);
    const { subSectors } = useContext(SubSectorContext);
    const { themes } = useContext(ThemeContext);
    const { signals } = useContext(SignalContext);
    const { subSignals } = useContext(SubSignalContext);
    
    // useEffect to fetch post data when the component mounts
    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get('/api/admin/posts', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setPosts(response.data); // Assuming you have a setPosts state function
            } catch (err) {
                console.log(err);
            }
        })();
    }, []);
    
    console.log('context provider post', posts)

    // useEffect to fetch context data when the component mounts
    useEffect(() => {
        (async () => {
            try {
                // Make API call to fetch contexts
                const response = await axios.get('/api/admin/contexts', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                // Dispatch action to update the state with the fetched contexts
                contextsDispatch({ type: 'SET_CONTEXTS', payload: response.data });
                console.log('context resp', response); // Log the response for debugging
            } catch (err) {
                // Log error if the API call fails
                console.log(err);
            }
        })();
    }, []); // Empty dependency array means this effect runs once on component mount

    // Function to handle the click event for adding a context
    const handleAddClick = () => {
        contextsDispatch({ type: 'SET_EDIT_ID', payload: null }); // Clear the edit ID
        setIsFormVisible(true); // Show the form for adding a new context
    };

    // Function to handle the click event for editing a context
    const handleEditClick = (id) => {
        contextsDispatch({ type: 'SET_EDIT_ID', payload: id }); // Set the edit ID for the context being edited
        setIsFormVisible(true); // Show the form for editing the context
    };

    // Function to handle form submission and display a success message
    const handleFormSubmit = (message) => {
        setIsFormVisible(false); // Hide the form after submission
        setSuccessMessage(message); // Set the success message
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Provide context-related state and functions to child components through ContextContext
    return (
        <ContextContext.Provider value={{ posts, contexts, contextsDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit, sectors, subSectors, themes, signals, subSignals }}>
            {children}
        </ContextContext.Provider>
    );
};
