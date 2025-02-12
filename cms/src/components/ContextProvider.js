
// import React, { useReducer, useEffect, useContext, useState } from 'react';
// import axios from '../config/axios';
// import ContextContext from '../context/ContextContext';
// import SectorContext from '../context/SectorContext';
// import SubSectorContext from '../context/SubSectorContext';
// import ThemeContext from '../context/ThemeContext';
// import SignalContext from '../context/SignalContext';
// import SubSignalContext from '../context/SubSignalContext';
// import AuthContext from '../context/AuthContext';
// import PostContext from '../context/PostContext';

// // ✅ Reducer to manage context state
// const contextReducer = (state, action) => {
//     switch (action.type) {
//         case 'SET_CONTEXTS':
//             return { ...state, data: action.payload, loading: false };
//         case 'ADD_CONTEXT':
//             return { ...state, data: [...state.data, action.payload] };
//         case 'REMOVE_CONTEXT':
//             return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
//         case 'SET_EDIT_ID':
//             return { ...state, editId: action.payload };
//         case 'UPDATE_CONTEXT':
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

// // ✅ ContextProvider Component
// export const ContextProvider = ({ children }) => {
//     const [contexts, contextsDispatch] = useReducer(contextReducer, { data: [], editId: null, loading: true });
//     //const [isFormVisible, setIsFormVisible] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');
//     const [isLoading, setIsLoading] = useState(true);
//     // Retrieve sector, sub-sector, theme, signal, and sub-signal data from their respective contexts
//     const { sectors } = useContext(SectorContext);
//     const { subSectors } = useContext(SubSectorContext);
//     const { themes } = useContext(ThemeContext);
//     const { signals } = useContext(SignalContext);
//     const { subSignals } = useContext(SubSignalContext);
//     const { state } = useContext(AuthContext); // ✅ Get login state from AuthContext
    
    
//     // ✅ NEW: local state for posts
//     const [posts, setPosts] = useState([]);

//     // 1) On mount, read from localStorage
//     const [isFormVisible, setIsFormVisible] = useState(() => {
//     const saved = localStorage.getItem('ctxFormOpen');
//     return saved === 'true'; // default to false if not found
//   });
  
//   // 2) Whenever it changes, write to localStorage
//   useEffect(() => {
//     localStorage.setItem('ctxFormOpen', isFormVisible);
//   }, [isFormVisible]);
  
//     useEffect(() => {
//         const fetchContexts = async () => {
//             try {
//                 const token = localStorage.getItem("token");
//                 if (!token) return; // ✅ Ensure token exists before making a request

//                 const response = await axios.get("/api/admin/contexts", {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 contextsDispatch({ type: "SET_CONTEXTS", payload: response.data });
//                 setIsLoading(false);
//                 console.log("✅ Contexts fetched:", response.data);
//             } catch (error) {
//                 console.error("❌ Error fetching contexts:", error);
//                 setIsLoading(false);
//             }
//         };

//         if (state.isLoggedIn) {
//             fetchContexts(); // ✅ Fetch only when user is logged in
//         }
//     }, [state.isLoggedIn]); // ✅ Refetch when user logs in

//     // ✅ NEW: Fetch posts
    
// useEffect(() => {
//     const fetchPosts = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) return;
  
//     try {
//       // Add `?limit=999` (or some large number)
//       const res = await axios.get('/api/admin/posts?page=1&limit=999', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setPosts(res.data.posts); // This now includes up to 999 posts
//     } catch (err) {
//       console.error('Error fetching posts:', err);
//     }
//   };
  
//     if (state?.isLoggedIn) {
//         fetchPosts();
//     }
// }, [state?.isLoggedIn]);


//     // ✅ Handle Add Click
//     const handleAddClick = () => {
//         contextsDispatch({ type: 'SET_EDIT_ID', payload: null });
//         setIsFormVisible(true);
//     };

//     // ✅ Handle Edit Click
//     const handleEditClick = (id) => {
//         contextsDispatch({ type: 'SET_EDIT_ID', payload: id });
//         setIsFormVisible(true);
//     };

//     // ✅ Handle Form Submission
//     const handleFormSubmit = (message) => {
//         setIsFormVisible(false);
//         setSuccessMessage(message);
//         setTimeout(() => setSuccessMessage(''), 3000);
//     };

    

//     return (
//         <ContextContext.Provider value={{ contexts,isLoading , posts, contextsDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit, sectors, subSectors, themes, signals, subSignals }}>
//             {children}
//         </ContextContext.Provider>
//     );
// };

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
            return { ...state, data: action.payload, loading: false };
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
    const [contexts, contextsDispatch] = useReducer(contextReducer, { data: [], editId: null, loading: true });
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const { sectors } = useContext(SectorContext);
    const { subSectors } = useContext(SubSectorContext);
    const { themes } = useContext(ThemeContext);
    const { signals } = useContext(SignalContext);
    const { subSignals } = useContext(SubSignalContext);
    const { state } = useContext(AuthContext); // ✅ Get login state from AuthContext

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

    useEffect(() => {
        const fetchContexts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get("/api/admin/contexts", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                contextsDispatch({ type: "SET_CONTEXTS", payload: response.data });
                setIsLoading(false);
            } catch (error) {
                console.error("❌ Error fetching contexts:", error);
                setIsLoading(false);
            }
        };

        if (state.isLoggedIn) {
            fetchContexts();
            fetchPosts(); // ✅ Ensure posts update when user logs in
        }
    }, [state.isLoggedIn]);

    const handleAddClick = () => {
        contextsDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    const handleEditClick = (id) => {
        contextsDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
    };

    const handleFormSubmit = (message) => {
        setIsFormVisible(false);
        setSuccessMessage(message);
        fetchPosts(); // ✅ Fetch latest posts after adding a new post
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <ContextContext.Provider value={{
            contexts,
            isLoading,
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
            signals,
            subSignals,
        }}>
            {children}
        </ContextContext.Provider>
    );
};
