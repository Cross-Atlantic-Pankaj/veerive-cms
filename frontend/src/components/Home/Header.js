import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import logoFinal from '../../html/images/logoFinal.png';
import '../../html/css/Header.css'; // Ensure you have this CSS file

const Header = () => {
    const { isLoggedIn, handleLogout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleClose = () => {
        // Close menu logic if any
    };

    const handleMenuItemClick = (path) => {
        navigate(path);  // Navigate to the specified path
        handleClose();
    };

    const handleLogoutClick = () => {
        handleLogout(); // Call the logout function from AuthContext
    };

    return (
        <header className="header">
            <div className="container">
                <div className="logo">
                    <a href="/" className="logo-link">
                        <img src={logoFinal} alt="Logo" className="logo-image" />
                    </a>
                </div>
                <nav className="main-nav">
                    <ul className="nav-list">
                        <li className="nav-item" onClick={() => handleMenuItemClick('/home-feed')}>Pulse Today</li>
                        <li className="nav-item" onClick={() => handleMenuItemClick('/dashboard')}>My Dashboard</li>
                        <li className="nav-item">
                            <a href="#analyzer" className="nav-link">Analyzer</a>
                            <ul className="submenu">
                                <li className="submenu-item" onClick={() => handleMenuItemClick('/sector-home')}>Sector Analyzer</li>
                                <li className="submenu-item" onClick={() => handleMenuItemClick('/theme-home')}>Trend Analyzer</li>
                            </ul>
                        </li>
                    </ul>
                </nav>
                {/* Conditional rendering for Get Started / Logout */}
                {isLoggedIn ? (
                    <button className="cta-button" onClick={handleLogoutClick}>Logout</button>
                ) : (
                    <button className="cta-button" onClick={handleLogoutClick}>Logout</button>
                )}
            </div>
        </header>
    );
};

export default Header;
