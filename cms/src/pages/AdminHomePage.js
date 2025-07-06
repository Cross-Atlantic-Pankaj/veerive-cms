import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import styles from '../html/css/AdminHome.module.css';

const AdminHomePage = () => {
    const { state } = useContext(AuthContext);
    const user = state.user || {};
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        // Prevent scrolling on HomePage
        const originalOverflow = document.body.style.overflow;
        const originalHeight = document.body.style.height;
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.height = originalHeight;
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'SuperAdmin':
                return `${styles.roleBadge} ${styles.superAdminBadge}`;
            case 'Admin':
                return `${styles.roleBadge} ${styles.adminBadge}`;
            default:
                return styles.roleBadge;
        }
    };

    return (
        <div className={styles.adminHomeContainer}>
            {/* Animated background circles */}
            <div className={styles.backgroundCircle1}></div>
            <div className={styles.backgroundCircle2}></div>
            
            <div className={styles.welcomeCard}>
                <h1 className={styles.welcomeTitle}>
                    Welcome, {user.name || 'User'}!
                </h1>
                
                <div className={styles.roleInfo}>
                    Role: <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
                </div>
                
                <div className={styles.dateTimeContainer}>
                    <div className={styles.dateText}>
                        📅 {dateTime.toLocaleDateString(undefined, { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                    <div className={styles.timeText}>
                        🕐 {dateTime.toLocaleTimeString()}
                    </div>
                </div>
                
                <div className={styles.welcomeMessage}>
                    🎉 This is your Veerive CMS dashboard. Enjoy your session and manage your content with ease!
                </div>
            </div>
        </div>
    );
};

export default AdminHomePage;
