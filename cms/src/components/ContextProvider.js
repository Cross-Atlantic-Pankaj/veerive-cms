import React, { useReducer, useEffect, useContext, useState } from 'react';
import axios from '../config/axios';
import ContextContext from '../context/ContextContext';
import SectorContext from '../context/SectorContext';
import SubSectorContext from '../context/SubSectorContext';
import ThemeContext from '../context/ThemeContext';
import SignalContext from '../context/SignalContext';
import SubSignalContext from '../context/SubSignalContext';
import AuthContext from '../context/AuthContext';
import PostContext from '../context/PostContext'; // ✅ Import PostContext

const contextReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CONTEXTS':
            console.log("🔹 Updating Context State with New Data:", action.payload);
            
            return { 
                ...state, 
                data: Array.isArray(action.payload.contexts) ? action.payload.contexts : [], // ✅ Ensure `data` is always an array
                totalPages: action.payload.totalPages || 1, 
                currentPage: action.payload.page || 1, 
                loading: false 
            };
            case 'CLEAR_CONTEXTS': // ✅ New case to clear contexts before updating
            return { 
                ...state, 
                data: [], 
                totalPages: 1, 
                currentPage: 1, 
                loading: true 
            };
        case 'ADD_CONTEXT':
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_CONTEXT':
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            return { ...state, editId: action.payload };
        case 'UPDATE_CONTEXT':
            return {
                ...state,
                editId: null,
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
        default:
            return state;
    }
};

// ✅ ContextProvider Component
export const ContextProvider = ({ children }) => {
    //const [contexts, contextsDispatch] = useReducer(contextReducer, { data: [], editId: null, loading: true });
    const [contexts, contextsDispatch] = useReducer(contextReducer, { data: [], totalPages: 1, currentPage: 1, editId: null, loading: true });
    const [searchQuery, setSearchQuery] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [allThemes, setAllThemes] = useState([]); // ✅ Store all themes (without pagination)
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [page, setPage] = useState(1);
    const { sectors } = useContext(SectorContext);
    const { subSectors } = useContext(SubSectorContext);
    const { themes } = useContext(ThemeContext);
    const { signals } = useContext(SignalContext);
    const { subSignals } = useContext(SubSignalContext);
    const { state } = useContext(AuthContext); // ✅ Get login state from AuthContext
    
    const [totalPages, setTotalPages] = useState(1);  // ✅ Ensure totalPages is updated
    
    // ✅ Check if PostContext exists before using it
    const postContext = useContext(PostContext); 
    const posts = postContext?.posts || [];  // ✅ If PostContext is undefined, use empty array
    const fetchPosts = postContext?.fetchPosts || (() => {}); // ✅ Prevent error if `fetchPosts` is missing

    useEffect(() => {
        const saved = localStorage.getItem('ctxFormOpen');
        setIsFormVisible(saved === 'true'); 
    }, []);

    useEffect(() => {
        localStorage.setItem('ctxFormOpen', isFormVisible);
    }, [isFormVisible]);

    // ✅ Define fetchContexts BEFORE using it in useEffect
    const fetchContexts = async () => {
        setIsLoading(true); // ✅ Show loading while fetching
    
        try {
            console.log(`🔍 Fetching contexts for page: ${page}, search: "${searchQuery}"`);
            
            const response = await axios.get(`/api/admin/contexts?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
    
            if (response.data.success) {
                console.log("✅ Fetched Contexts:", response.data.contexts.length);
                contextsDispatch({ 
                    type: 'SET_CONTEXTS', 
                    payload: { 
                        contexts: response.data.contexts, 
                        totalPages: response.data.totalPages || 1, // ✅ Ensure totalPages updates
                        page: response.data.page || 1 
                    } 
                });
    
                setTotalPages(response.data.totalPages || 1); // ✅ Ensure pagination updates
            }
    
            setIsLoading(false); // ✅ Stop loading
            fetchPosts();
        } catch (err) {
            console.error('❌ Error fetching contexts:', err);
            setIsLoading(false); // ✅ Stop loading on error
        }
    };
    
    const fetchAllThemes = async () => {
        try {
            console.log("🔄 Fetching ALL Themes...");
            const response = await axios.get('/api/admin/themes/all', {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
    
            if (response.data.success) {
                console.log("✅ Successfully fetched All Themes:", response.data.themes.length);
                setAllThemes(response.data.themes); // ✅ Store all themes separately
            }
        } catch (err) {
            console.error("❌ Error fetching all themes:", err);
        }
    };
    

// ✅ Now `fetchContexts` is defined before it's used in useEffect
useEffect(() => {
    if (state.isLoggedIn) {
        fetchContexts();
        fetchPosts();
        fetchAllThemes();
    }
}, [state.isLoggedIn, page, searchQuery]); // ✅ Fetch only when `page` or `searchQuery` changes


// Call fetchAllThemes once when the component mounts
// useEffect(() => {
//     fetchAllThemes();
// }, []);

    
    const handleAddClick = () => {
        contextsDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    const handleEditClick = (id) => {
        console.log('Edit button clicked for context ID:', id);
        console.log('Current contexts data:', contexts.data);
        localStorage.setItem('editContextId', id);
        contextsDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
        // Fetch the specific context to ensure we have the latest data
        const fetchContext = async () => {
            try {
                const response = await axios.get(`/api/admin/contexts/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                if (response.data.success) {
                    contextsDispatch({ 
                        type: 'SET_CONTEXTS', 
                        payload: { 
                            contexts: [response.data.context], 
                            totalPages: 1,
                            page: 1
                        } 
                    });
                }
            } catch (err) {
                console.error('Error fetching context:', err);
            }
        };
        fetchContext();
    };
    
    const handleFormSubmit = (message) => {
        setIsFormVisible(false);
        setSuccessMessage(message);
        fetchPosts(); // ✅ Fetch latest posts after adding a new post
        setTimeout(() => setSuccessMessage(''), 3000);
    };
    useEffect(() => {
        const savedPage = localStorage.getItem('currentPage');
        if (savedPage) {
            setPage(parseInt(savedPage)); // ✅ Restore last viewed page on reload
        }
    }, []);
    useEffect(() => {
        localStorage.setItem('currentPage', page); // ✅ Save last viewed page
    }, [page]);

    useEffect(() => {
        const savedEditId = localStorage.getItem('editContextId');
        if (savedEditId) {
            contextsDispatch({ type: 'SET_EDIT_ID', payload: savedEditId });
        }
    }, []);
    
    return (
        <ContextContext.Provider value={{
            contexts,
            isLoading,
            setIsLoading,
            fetchContexts,
            page,
            totalPages,
            posts, // ✅ Now using latest posts from PostContext
            contextsDispatch,
            isFormVisible,
            setIsFormVisible,
            handleAddClick,
            handleEditClick,
            handleFormSubmit,
            sectors,
            subSectors,
            themes,
            allThemes, // ✅ Pass all themes separately
            signals,
            subSignals,
            searchQuery,
            setSearchQuery,
            page,
            setPage,
        }}>
            {children}
        </ContextContext.Provider>
    );
};
