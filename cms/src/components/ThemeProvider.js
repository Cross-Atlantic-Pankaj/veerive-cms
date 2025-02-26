// import React, { useReducer, useState, useEffect, useContext } from 'react';
// // Import React and hooks: useReducer for state management, useState for local state, useEffect for side effects, and useContext for consuming context
// import axios from '../config/axios';
// // Import the configured axios instance for making HTTP requests
// import ThemeContext from '../context/ThemeContext';
// // Import ThemeContext to provide and consume theme data
// import SectorContext from '../context/SectorContext';
// // Import SectorContext to access sector data
// import SubSectorContext from '../context/SubSectorContext';
// // Import SubSectorContext to access sub-sector data

// // Reducer function to manage theme state updates
// const themeReducer = (state, action) => {
//     switch (action.type) {
//         case 'SET_THEMES':
//             // Set the entire list of themes in the state from action.payload
//             return { ...state, data: action.payload };
//         case 'ADD_THEME':
//             // Add a new theme to the existing list in the state
//             return { ...state, data: [...state.data, action.payload] };
//         case 'REMOVE_THEME':
//             // Remove a theme based on its ID provided in action.payload
//             return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
//         case 'SET_EDIT_ID':
//             // Set the ID of the theme being edited in the state
//             return { ...state, editId: action.payload };
//         case 'UPDATE_THEME':
//             // Update a specific theme in the state with new data provided in action.payload
//             return {
//                 ...state,
//                 editId: null, // Reset editId to null after updating
//                 data: state.data.map((ele) =>
//                     ele._id === action.payload._id ? { ...action.payload } : ele
//                 ),
//             };
//         default:
//             // Return the current state if no matching action type is found
//             return state;
//     }
// };

// // Provider component for managing theme state and providing context
// export const ThemeProvider = ({ children }) => {
//     // Initialize state and dispatch function using the themeReducer
//     const [themes, themesDispatch] = useReducer(themeReducer, { data: [], editId: null });
//     // State for controlling the visibility of the form
//     const [isFormVisible, setIsFormVisible] = useState(false);
//     // State for storing and displaying success messages
//     const [successMessage, setSuccessMessage] = useState('');

//     // Consume sector and sub-sector contexts
//     const { sectors } = useContext(SectorContext);
//     const { subSectors } = useContext(SubSectorContext);


//     useEffect(() => {
//         const fetchThemes = async () => {
//             const token = localStorage.getItem('token');  // ✅ Get token from localStorage
//             if (!token) {
//                 console.log("⏳ No token found. Skipping theme fetch.");
//                 return;  // ✅ Skip API call if no token is available
//             }
    
//             try {
//                 const response = await axios.get('/api/admin/themes', { 
//                     headers: { Authorization: `Bearer ${token}` } 
//                 });
//                 console.log("✅ Themes Fetched:", response.data);
//                 themesDispatch({ type: 'SET_THEMES', payload: response.data });
//             } catch (err) {
//                 console.error("❌ Error Fetching Themes:", err);
//             }
//         };
    
//         fetchThemes(); // ✅ Only fetch when token exists
//     }, []);
    

//     // Handler function to show the form and prepare for adding a new theme
//     const handleAddClick = () => {
//         console.log(isFormVisible); // Log the current form visibility state (for debugging purposes)
//         themesDispatch({ type: 'SET_EDIT_ID', payload: null });
//         setIsFormVisible(true);
//         console.log(isFormVisible); // Log the form visibility state after setting it to true (for debugging purposes)
//     };

//     // Handler function to show the form and prepare for editing an existing theme
//     const handleEditClick = (id) => {
//         themesDispatch({ type: 'SET_EDIT_ID', payload: id });
//         setIsFormVisible(true);
//     };

//     // Handler function to hide the form and display a success message
//     const handleFormSubmit = (message) => {
//         setIsFormVisible(false);
//         setSuccessMessage(message);
//         // Clear the success message after 2 seconds
//         setTimeout(() => setSuccessMessage(''), 2000);
//     };

//     // Provide context to child components
//     return (
//         <ThemeContext.Provider value={{ themes, isFormVisible, setIsFormVisible, themesDispatch, handleAddClick, handleEditClick, handleFormSubmit, sectors, subSectors }}>
//             {children} 
//         </ThemeContext.Provider>
//     );
// };


// import React, { useReducer, useState, useEffect, useContext } from 'react';
// import axios from '../config/axios';
// import ThemeContext from '../context/ThemeContext';
// import SectorContext from '../context/SectorContext';
// import SubSectorContext from '../context/SubSectorContext';

// // Reducer function to manage theme state updates
// const themeReducer = (state, action) => {
//     switch (action.type) {
//         case 'SET_THEMES':
//             return { ...state, data: action.payload.themes, totalPages: action.payload.totalPages, currentPage: action.payload.currentPage };
//         case 'ADD_THEME':
//             return { ...state, data: [...state.data, action.payload] };
//         case 'REMOVE_THEME':
//             return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
//         case 'SET_EDIT_ID':
//             return { ...state, editId: action.payload };
//         case 'UPDATE_THEME':
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

// // Provider component for managing theme state and providing context
// export const ThemeProvider = ({ children }) => {
//     const [themes, themesDispatch] = useReducer(themeReducer, { data: [], editId: null, totalPages: 1, currentPage: 1 });
//     const [isFormVisible, setIsFormVisible] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');

//     const { sectors } = useContext(SectorContext);
//     const { subSectors } = useContext(SubSectorContext);

//     // Function to fetch paginated themes
//     const fetchThemes = async (page = 1, limit = 10) => {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             console.log("⏳ No token found. Skipping theme fetch.");
//             return;
//         }

//         try {
//             const response = await axios.get(`/api/admin/themes?page=${page}&limit=${limit}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             console.log("✅ Themes Fetched:", response.data);
//             themesDispatch({ type: 'SET_THEMES', payload: response.data });
//         } catch (err) {
//             console.error("❌ Error Fetching Themes:", err);
//         }
//     };

//     useEffect(() => {
//         fetchThemes();
//     }, []);

//     const handleAddClick = () => {
//         themesDispatch({ type: 'SET_EDIT_ID', payload: null });
//         setIsFormVisible(true);
//     };

//     const handleEditClick = (id) => {
//         themesDispatch({ type: 'SET_EDIT_ID', payload: id });
//         setIsFormVisible(true);
//     };

//     const handleFormSubmit = (message) => {
//         setIsFormVisible(false);
//         setSuccessMessage(message);
//         setTimeout(() => setSuccessMessage(''), 2000);
//     };

//     return (
//         <ThemeContext.Provider value={{ themes, fetchThemes, isFormVisible, setIsFormVisible, themesDispatch, handleAddClick, handleEditClick, handleFormSubmit, sectors, subSectors }}>
//             {children} 
//         </ThemeContext.Provider>
//     );
// };
                

import React, { useReducer, useState, useEffect, useContext, useRef } from 'react';
import axios from '../config/axios';
import ThemeContext from '../context/ThemeContext';
import SectorContext from '../context/SectorContext';
import SubSectorContext from '../context/SubSectorContext';

// Reducer function to manage theme state updates
const themeReducer = (state, action) => {
    switch (action.type) {
        case 'SET_THEMES':
            return { 
                ...state, 
                data: action.payload.themes, 
                totalPages: action.payload.totalPages || 1, // Ensure at least 1
                
                currentPage: action.payload.currentPage || state.currentPage // ✅ Update currentPage correctly
            };
        case 'ADD_THEME':
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_THEME':
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            return { ...state, editId: action.payload };
        case 'UPDATE_THEME':
            return {
                ...state,
                editId: null,
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
            case 'SET_PAGE':
            return { 
                ...state, 
                currentPage: action.payload 
            };
            case 'SET_ALL_THEMES': // ✅ Store all themes separately
            return {
                ...state,
                allThemes: action.payload // Save all themes for global search
            };
        default:
            return state;
    }
};

// ✅ ThemeProvider Component
export const ThemeProvider = ({ children }) => {
    const [themes, themesDispatch] = useReducer(themeReducer, { data: [], editId: null, totalPages: 1, currentPage: 1,allThemes: [], });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');


const hasFetched = useRef(false); // ✅ Prevent multiple API calls

    const [currentPage, setCurrentPage] = useState(() => {
        return parseInt(localStorage.getItem("currentPage")) || 1;
    });
    const { sectors } = useContext(SectorContext);
    const { subSectors } = useContext(SubSectorContext);

    // ✅ Fetch ALL themes (for search) only once
    const fetchAllThemes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`/api/admin/themes/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            themesDispatch({ type: 'SET_ALL_THEMES', payload: response.data.themes });
        } catch (err) {
            console.error("❌ Error Fetching All Themes:", err);
        }
    };

    // ✅ Fetch Themes only if token is present
    const fetchThemes = async (page, limit = 10) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("⏳ No token found. Skipping theme fetch.");
            return;
        }
    
        try {
            const response = await axios.get(`/api/admin/themes?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            console.log("✅ Themes Fetched:", response.data);
    
            let totalPages = response.data.totalPages || 1;
    
            themesDispatch({
                type: 'SET_THEMES',
                payload: { 
                    ...response.data, 
                    currentPage: page, // ✅ Correctly update currentPage inside the context
                    totalPages
                }
            });

            // ✅ Store last visited page only if different
            if (localStorage.getItem("currentPage") !== String(page)) {
                localStorage.setItem("currentPage", page);
            }
        } catch (err) {
            console.error("❌ Error Fetching Themes:", err);
        }
    };

    // ✅ Ensure correct `currentPage` is used before fetching themes
    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true; // ✅ Prevent multiple API calls
            fetchThemes(currentPage);
            fetchAllThemes(); // ✅ Fetch all themes once
        }
    }, [currentPage]);

    // ✅ Corrected `setCurrentPage` to update both local state and context
    const updateCurrentPage = (newPage) => {
        setCurrentPage(newPage); // Update local state
        themesDispatch({ type: 'SET_PAGE', payload: newPage }); // Update context state
        fetchThemes(newPage); // Fetch themes for new page
    };


    // ✅ Handle Add Theme Click
    const handleAddClick = () => {
        themesDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    // ✅ Handle Edit Theme Click
    const handleEditClick = (id) => {
        themesDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
    };

    // ✅ Handle Form Submission
    const handleFormSubmit = (message) => {
        setIsFormVisible(false);
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 2000);
    };

    return (
        <ThemeContext.Provider 
            value={{ 
                themes, 
                fetchThemes,
                fetchAllThemes, 
                isFormVisible, 
                setIsFormVisible, 
                themesDispatch, 
                handleAddClick, 
                handleEditClick, 
                handleFormSubmit, 
                sectors, 
                subSectors, 
                currentPage, 
                setCurrentPage: updateCurrentPage
            }}>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {children} 
        </ThemeContext.Provider>
    );
};
