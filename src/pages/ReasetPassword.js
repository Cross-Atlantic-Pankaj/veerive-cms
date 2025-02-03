
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { toast } from 'react-toastify'; // Import toast for notifications
import axios from '../config/axios';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const query = new URLSearchParams(useLocation().search);
    const token = query.get('token'); // Extract token from URL
    const navigate = useNavigate(); // Initialize navigate

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/users/reset-password', { token, newPassword });
            toast.success(response.data.message || 'Password reset successfully!', { autoClose: 2000 });
            navigate('/login'); // Redirect to login page after successful reset
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Something went wrong. Please try again.';
            toast.error(errorMessage, { autoClose: 3000 }); // Show error message as toast
            setMessage(errorMessage); // Update message state for inline display
        }
    };

    return (
        <div className="reset-password-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleResetPassword}>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>} {/* Display inline error message if necessary */}
        </div>
    );
}
