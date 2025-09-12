import React, { useReducer, useEffect, useState } from 'react'; // Import React and hooks for managing state and side effects
import axios from '../config/axios'; // Import axios instance configured for API requests
import SectorContext from '../context/SectorContext'; // Import the context for managing sector data

// Define the reducer function to handle state updates for sectors
const sectorReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SECTORS':
            // Update the state with the list of sectors provided in action.payload
            return { ...state, data: action.payload };
        case 'ADD_SECTOR':
            // Add a new sector to the existing list of sectors
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_SECTOR':
            // Remove a sector based on the ID provided in action.payload
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            // Set the ID of the sector being edited
            return { ...state, editId: action.payload };
        case 'UPDATE_SECTOR':
            // Update a specific sector in the list with new data provided in action.payload
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

// Define the provider component for managing sector state
export const SectorProvider = ({ children }) => {
    // Initialize state and dispatch function using the sectorReducer
    const [sectors, sectorsDispatch] = useReducer(sectorReducer, { data: [], editId: null });
    // Local state to manage the visibility of the form
    const [isFormVisible, setIsFormVisible] = useState(false);
    // Local state to manage success messages
    const [successMessage, setSuccessMessage] = useState('');

    // useEffect hook to fetch sectors data from the API when the component mounts
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             // Fetch sectors data from the API with authorization token
    //             const response = await axios.get('/api/admin/sectors', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    //             // Dispatch action to update sectors state with fetched data
    //             sectorsDispatch({ type: 'SET_SECTORS', payload: response.data });
    //             console.log('sector resp', response); // Log the response for debugging
    //         } catch (err) {
    //             // Log any errors that occur during the fetch operation
    //             console.log(err);
    //         }
    //     })();
    // }, []); // Empty dependency array means this effect runs once on component mount

    useEffect(() => {
        const fetchSectors = async () => {
            const token = localStorage.getItem('token');  // ✅ Get token from localStorage
            if (!token) {
                return;  // ✅ Skip API call if no token is available
            }
    
            try {
                const response = await axios.get('/api/admin/sectors', { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                sectorsDispatch({ type: 'SET_SECTORS', payload: response.data });
            } catch (err) {
                console.error("❌ Error Fetching Sectors:", err);
            }
        };
    
        fetchSectors(); // ✅ Only fetch when token exists
    }, []);
    
    // Handler function to show the form and prepare for adding a new sector
    const handleAddClick = () => {
        sectorsDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    // Handler function to show the form and prepare for editing an existing sector
    const handleEditClick = (id) => {
        sectorsDispatch({ type: 'SET_EDIT_ID', payload: id });
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
        <SectorContext.Provider value={{ sectors, sectorsDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit }}>
            {children}
        </SectorContext.Provider>
    );
};
