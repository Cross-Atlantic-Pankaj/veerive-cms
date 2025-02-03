import React, { useReducer, useState, useEffect, useContext } from 'react';
// Import React and hooks: useReducer for state management, useState for local state, useEffect for side effects, and useContext for consuming context
import axios from '../config/axios';
// Import the configured axios instance for making HTTP requests
import ThemeContext from '../context/ThemeContext';
// Import ThemeContext to provide and consume theme data
import SectorContext from '../context/SectorContext';
// Import SectorContext to access sector data
import SubSectorContext from '../context/SubSectorContext';
// Import SubSectorContext to access sub-sector data

// Reducer function to manage theme state updates
const themeReducer = (state, action) => {
    switch (action.type) {
        case 'SET_THEMES':
            // Set the entire list of themes in the state from action.payload
            return { ...state, data: action.payload };
        case 'ADD_THEME':
            // Add a new theme to the existing list in the state
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_THEME':
            // Remove a theme based on its ID provided in action.payload
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            // Set the ID of the theme being edited in the state
            return { ...state, editId: action.payload };
        case 'UPDATE_THEME':
            // Update a specific theme in the state with new data provided in action.payload
            return {
                ...state,
                editId: null, // Reset editId to null after updating
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
        default:
            // Return the current state if no matching action type is found
            return state;
    }
};

// Provider component for managing theme state and providing context
export const ThemeProvider = ({ children }) => {
    // Initialize state and dispatch function using the themeReducer
    const [themes, themesDispatch] = useReducer(themeReducer, { data: [], editId: null });
    // State for controlling the visibility of the form
    const [isFormVisible, setIsFormVisible] = useState(false);
    // State for storing and displaying success messages
    const [successMessage, setSuccessMessage] = useState('');

    // Consume sector and sub-sector contexts
    const { sectors } = useContext(SectorContext);
    const { subSectors } = useContext(SubSectorContext);

    // useEffect hook to fetch theme data from the API when the component mounts
    useEffect(() => {
        (async () => {
            try {
                // Make an API request to get theme data
                const response = await axios.get('/api/admin/themes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                // Dispatch action to set the fetched theme data in the state
                themesDispatch({ type: 'SET_THEMES', payload: response.data });
            } catch (err) {
                // Log any errors encountered during the fetch operation
                console.log(err);
            }
        })();
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // Handler function to show the form and prepare for adding a new theme
    const handleAddClick = () => {
        console.log(isFormVisible); // Log the current form visibility state (for debugging purposes)
        themesDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
        console.log(isFormVisible); // Log the form visibility state after setting it to true (for debugging purposes)
    };

    // Handler function to show the form and prepare for editing an existing theme
    const handleEditClick = (id) => {
        themesDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
    };

    // Handler function to hide the form and display a success message
    const handleFormSubmit = (message) => {
        setIsFormVisible(false);
        setSuccessMessage(message);
        // Clear the success message after 2 seconds
        setTimeout(() => setSuccessMessage(''), 2000);
    };

    // Provide context to child components
    return (
        <ThemeContext.Provider value={{ themes, isFormVisible, setIsFormVisible, themesDispatch, handleAddClick, handleEditClick, handleFormSubmit, sectors, subSectors }}>
            {children} 
        </ThemeContext.Provider>
    );
};
