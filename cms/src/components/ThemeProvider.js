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
                totalPages: action.payload.totalPages || 1,
                currentPage: action.payload.currentPage || state.currentPage
            };
        case 'ADD_THEME':
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_THEME':
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            console.log("Setting edit ID:", action.payload);
            return { ...state, editId: action.payload };
        case 'UPDATE_THEME':
            return {
                ...state,
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
        case 'SET_PAGE':
            return { ...state, currentPage: action.payload };
        case 'SET_ALL_THEMES':
            return {
                ...state,
                allThemes: action.payload
            };
        default:
            return state;
    }
};

// ✅ ThemeProvider Component
export const ThemeProvider = ({ children }) => {
    const [themes, themesDispatch] = useReducer(themeReducer, { 
        data: [], 
        editId: null, 
        totalPages: 1, 
        currentPage: 1,
        allThemes: [] 
    });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const hasFetched = useRef(false);

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
            console.log("Fetching themes for page:", page);
            const response = await axios.get(`/api/admin/themes?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            console.log("✅ Themes Fetched:", response.data);
    
            let totalPages = response.data.totalPages || 1;
    
            themesDispatch({
                type: 'SET_THEMES',
                payload: { 
                    ...response.data, 
                    currentPage: page,
                    totalPages
                }
            });

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
            console.log("Initial data fetch");
            hasFetched.current = true;
            fetchThemes(currentPage);
            fetchAllThemes();
        }
    }, []);

    // ✅ Corrected `setCurrentPage` to update both local state and context
    const updateCurrentPage = (newPage) => {
        console.log("Updating page to:", newPage);
        setCurrentPage(newPage);
        themesDispatch({ type: 'SET_PAGE', payload: newPage });
        fetchThemes(newPage);
    };

    // ✅ Handle Add Theme Click
    const handleAddClick = () => {
        console.log("Add theme clicked");
        themesDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    // ✅ Handle Edit Theme Click
    const handleEditClick = async (id) => {
        console.log("Edit theme clicked:", id);
        try {
            // First fetch the specific theme to ensure we have the latest data
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`/api/admin/themes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Theme data fetched:", response.data);

            // Update the theme in the context
            themesDispatch({ 
                type: 'UPDATE_THEME', 
                payload: response.data 
            });

            // Set edit ID and show form
            themesDispatch({ type: 'SET_EDIT_ID', payload: id });
            setIsFormVisible(true);
        } catch (err) {
            console.error("❌ Error fetching theme for edit:", err);
        }
    };

    // ✅ Handle Form Submission
    const handleFormSubmit = (message) => {
        console.log("Form submitted:", message);
        setIsFormVisible(false);
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 2000);
    };

    console.log("ThemeProvider state:", { 
        isFormVisible, 
        editId: themes.editId, 
        themesCount: themes.data.length 
    });

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
