import {useReducer, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AuthContext from '../context/AuthContext'
import axios from '../config/axios'
const initialState = {
    user: null, 
    isLoggedIn: false 
}

const reducer = (state, action) => {
    switch(action.type) {
        case 'LOGIN_USER' : {
            return {...state, isLoggedIn: true, user: action.payload }
        } 
        case 'LOGOUT_USER' : {
            return {...state, isLoggedIn: false, user: null }
        }
        default:
            return state;
    }
}

// function AuthProvider(props){
//     const navigate = useNavigate()
//     const [state,dispatch] = useReducer(reducer, initialState)

//     useEffect(() => { // handle page reload 
//         (async () => {
//             if(localStorage.getItem('token')) {
//                 try {
//                     const userResponse = await axios.get('/api/users/account', { headers: { 'Authorization': localStorage.getItem('token')}})
//                     dispatch({ type: 'LOGIN_USER', payload: userResponse.data })
//                 } catch(err) {
                    
//                 }
//             }
//         })();
//     }, [])

//     const handleRegister = async (formData) => {
//         try { 
//             const response = await axios.post('/api/users/register', formData)
//             toast('Successfully Registered', { autoClose: 2000 })
//             navigate('/login')
//         } catch(err) {
//             console.log(err)
//         }

//     }

//     const handleLogin = async (formData) => {
//         try {
//             const response = await axios.post('/api/users/login', formData)
//             localStorage.setItem('token', response.data.token)
//             toast('successfully logged in')
//             console.log('response', response)
//             console.log('local entire', localStorage)
//             const userResponse = await axios.get('/api/users/account', { headers: { 'Authorization': response.data.token}})
//             dispatch({ type: 'LOGIN_USER', payload: userResponse.data })
//             console.log('userResponse', userResponse)
//             console.log('state', state)
//             navigate('/home')
//         } catch(err) {
//             console.error('Login failed:', err);
//             toast('Login failed', { autoClose: 5000 })
//         }
//     }

//     const handleLogout = () => {
//         localStorage.removeItem('token')
//         dispatch({ type: 'LOGOUT_USER' })
//         toast("successfully logged out")
//         navigate('/')
//     }

//     return (
//         <AuthContext.Provider value={{ state, handleRegister, handleLogin, handleLogout }}>
//             { props.children }
//         </AuthContext.Provider>
//     )
// }
function AuthProvider(props) {
    const navigate = useNavigate(); // Initialize navigate for redirecting users
    const [state, dispatch] = useReducer(reducer, initialState); // Initialize state and dispatch for handling state changes

    useEffect(() => {
        (async () => {
            // Check if token exists in localStorage
            if (localStorage.getItem('token')) {
                try {
                    // Fetch user data using the token with 'Bearer' prefix
                    const userResponse = await axios.get('/api/users/account', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    // Dispatch action to update state with user data
                    dispatch({ type: 'LOGIN_USER', payload: userResponse.data });
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    // Handle error if fetching user data fails (e.g., invalid or expired token)
                    localStorage.removeItem('token'); // Remove invalid token
                }
            }
        })();
    }, []); // Empty dependency array means this effect runs once on component mount
    

    // Function to handle user registration
        const handleRegister = async (formData) => {
        try {
            const response = await axios.post('/api/users/register', formData);
            toast(response.data.message || 'Successfully Registered', { autoClose: 2000 }); // Use response message if available
            navigate('/');
        } catch (err) {
            console.log(err);
        }
    };
// Function to handle user login
const handleLogin = async (formData) => {
    try {
        const response = await axios.post('/api/users/login', formData, { withCredentials: true });
        localStorage.setItem('token', response.data.token); // Save the token
        toast('Successfully logged in', { autoClose: 2000 });
        const userResponse = await axios.get('/api/users/account', {
            headers: { Authorization: `Bearer ${response.data.token}` },
        });
        dispatch({ type: 'LOGIN_USER', payload: userResponse.data });
        navigate('/home'); // Redirect user to appropriate page
    } catch (err) {
        console.error('Login failed:', err.response?.data || err.message);

        // Display the error message from the backend
        const errorMessage = err.response?.data?.error || 'Login failed. Please check your credentials.';
        toast(errorMessage, { autoClose: 5000 });
    }
};
// Function to handle user logout
    const handleLogout = () => {
        // Remove token from localStorage
        localStorage.removeItem('token');
        // Dispatch action to clear user data and update login status
        dispatch({ type: 'LOGOUT_USER' });
        // Notify user of successful logout
        toast("Successfully logged out");
        // Redirect user to login page
        navigate('/');
    };

    // Provide authentication state and functions to child components
    return (
        <AuthContext.Provider value={{ state, handleRegister, handleLogin, handleLogout }}>
            {props.children} 
        </AuthContext.Provider>
    );
}
export default AuthProvider


/*
1. Create Login Component - with form input - email & password
2. write client side validation
3. if the validation pass
    then call the handleLogin(formData)
4. inside handleLogin -> make api call to '/api/users/login' 
5. once the password credential match, write the token to the localStorage 
6. notify via toast user has logged in successfully

*/ 