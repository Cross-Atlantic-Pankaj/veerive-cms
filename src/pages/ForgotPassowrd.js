
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { toast } from 'react-toastify'; // Import toast for notifications
import axios from '../config/axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate(); // Initialize navigate for redirection

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/users/forgot-password', { email });
            toast.success(response.data.message || 'Reset link sent to your email!', { autoClose: 2000 });
            navigate('/login'); // Redirect to login page after success
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Something went wrong. Please try again.';
            toast.error(errorMessage, { autoClose: 3000 }); // Show error as toast
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send Reset Link</button>
            </form>
        </div>
    );
}
