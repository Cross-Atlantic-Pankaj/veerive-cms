// import { useState, useContext } from 'react';
// import AuthContext from '../context/AuthContext';
// import '../html/css/Login.css'; // Import the CSS file for styling

// export default function Login() {
//     const { handleLogin } = useContext(AuthContext);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         const formData = {
//             email,
//             password,
//         };
//         handleLogin(formData);
//     };

//     return (
//         <div className="login-container">
//             <div className="login-card">
//                 <h2 className="login-title">Veerive CMS Login</h2>
//                 <form onSubmit={handleSubmit}>
//                     <input
//                         type="text"
//                         placeholder="Enter email"
//                         className="login-input"
//                         value={email}
//                         onChange={e => setEmail(e.target.value)}
//                     />
//                     <input
//                         type="password"
//                         placeholder="Enter password"
//                         className="login-input"
//                         value={password}
//                         onChange={e => setPassword(e.target.value)}
//                     />
//                     <button type="submit" className="login-button">Login</button>
//                 </form>
//             </div>
//         </div>
//     );
// }
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../html/css/Login.css'; // Import the CSS file for styling

export default function Login() {
    const { handleLogin } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State to store error messages

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            email,
            password,
        };

        try {
            // Call the login function from AuthContext
            await handleLogin(formData);
        } catch (err) {
            // Handle error and set error message
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error); // Show specific error message
            } else {
                setError('Something went wrong. Please try again.'); // Generic error message
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Veerive CMS Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="login-error">{error}</p>} {/* Display error message */}
                    <button type="submit" className="login-button">Login</button>
                </form>
                <div className="login-links">
                    <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                    
                </div>
            </div>
        </div>
    );
}
