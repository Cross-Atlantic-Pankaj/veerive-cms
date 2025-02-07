import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import '../html/css/UserLogin.css'; // Import the CSS file for styling

export default function UserLogin() {
    const { handleLogin } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            email,
            password,
        };
        handleLogin(formData);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Veerive User Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter email"
                        className="login-input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="login-input"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
}
