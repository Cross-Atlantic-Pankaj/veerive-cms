import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Fade } from '@mui/material';
import AuthContext from '../context/AuthContext';

const AdminHomePage = () => {
    const { state } = useContext(AuthContext);
    const user = state.user || {};
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(120deg, #e0e7ff 0%, #f0fdfa 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Subtle animated background circles */}
            <Fade in timeout={1500}>
                <Box
                    sx={{
                        position: 'absolute',
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.12)',
                        top: -100,
                        left: -100,
                        zIndex: 0,
                        animation: 'float1 8s ease-in-out infinite',
                        '@keyframes float1': {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(30px)' },
                        },
                    }}
                />
            </Fade>
            <Fade in timeout={2000}>
                <Box
                    sx={{
                        position: 'absolute',
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.10)',
                        bottom: -80,
                        right: -80,
                        zIndex: 0,
                        animation: 'float2 10s ease-in-out infinite',
                        '@keyframes float2': {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-30px)' },
                        },
                    }}
                />
            </Fade>
            <Card sx={{ minWidth: 350, maxWidth: 500, boxShadow: 6, borderRadius: 4, zIndex: 1, background: 'rgba(255,255,255,0.95)' }}>
                <CardContent>
                    <Typography variant="h3" align="center" gutterBottom fontWeight={700}>
                        Welcome, {user.name ? user.name : 'User'}!
                    </Typography>
                    <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
                        Role: <b>{user.role}</b>
                    </Typography>
                    <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                        {dateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br />
                        {dateTime.toLocaleTimeString()}
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary">
                        This is your Veerive CMS dashboard. Enjoy your session!
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AdminHomePage;
