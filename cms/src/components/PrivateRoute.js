import { Navigate } from 'react-router-dom'; // Import Navigate component from react-router-dom for handling redirects

// Define a functional component named PrivateRoute
export default function PrivateRoute(props) {
    // Check if a token exists in sessionStorage (indicating the user is authenticated)
    const token = sessionStorage.getItem('token');
    console.log('🔒 PrivateRoute check - Token exists:', !!token);
    
    if (token) {
        // If a token exists, render the child components passed to PrivateRoute
        console.log('✅ PrivateRoute - Rendering protected content');
        return props.children;
    } else {
        // If no token exists, redirect the user to the login page
        console.log('❌ PrivateRoute - No token, redirecting to login');
        return <Navigate to="/login" />;
    }
}
