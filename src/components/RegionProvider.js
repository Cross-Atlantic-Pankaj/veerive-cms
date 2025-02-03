import React, { useReducer, useEffect, useState } from 'react'; // Import React and hooks for state management and side effects
import axios from '../config/axios'; // Import axios instance configured for API requests
import RegionContext from '../context/RegionContext'; // Import the context for managing region data

// Define the reducer function to handle state updates for regions
const regionsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_REGIONS':
            // Update the state with the list of regions provided in action.payload
            return { ...state, data: action.payload };
        case 'ADD_REGION':
            // Add a new region to the existing list of regions
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_REGION':
            // Remove a region based on the ID provided in action.payload
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            // Set the ID of the region being edited
            return { ...state, editId: action.payload };
        case 'UPDATE_REGION':
            // Update a specific region in the list with new data provided in action.payload
            return {
                ...state,
                editId: null,
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
        default:
            // Return the current state if no recognized action type is provided
            return state;
    }
};

// Define the provider component for managing region state
export const RegionProvider = ({ children }) => {
    // Initialize state and dispatch function using the regionsReducer
    const [regions, regionsDispatch] = useReducer(regionsReducer, { data: [], editId: null });
    // Local state to manage the visibility of the form
    const [isFormVisible, setIsFormVisible] = useState(false);
    // Local state to manage success messages
    const [successMessage, setSuccessMessage] = useState('');

    // useEffect hook to fetch regions data from the API when the component mounts
    useEffect(() => {
        (async () => {
            try {
                // Fetch regions data from the API with authorization token
                const response = await axios.get('/api/admin/regions', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                // Dispatch action to update regions state with fetched data
                regionsDispatch({ type: 'SET_REGIONS', payload: response.data });
            } catch (err) {
                // Log any errors that occur during the fetch operation
                console.log(err);
            }
        })();
    }, []); // Empty dependency array means this effect runs once on component mount

    // Handler function to show the form and prepare for adding a new region
    const handleAddClick = () => {
        regionsDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    // Handler function to show the form and prepare for editing an existing region
    const handleEditClick = (id) => {
        regionsDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
    };

    // Handler function to hide the form and show a success message after form submission
    const handleFormSubmit = (message) => {
        setIsFormVisible(false);
        setSuccessMessage(message);
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Provide context value to child components
    return (
        <RegionContext.Provider value={{ regions, regionsDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit }}>
            {children}
        </RegionContext.Provider>
    );
};
