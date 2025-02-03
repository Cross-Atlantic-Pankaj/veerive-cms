import React, { useState, useEffect } from "react";
import { Button, TextField, Typography } from "@mui/material";
import axios from "../config/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
    const [adminDetails, setAdminDetails] = useState({});
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate(); // Use navigate hook for redirection

    // Fetch admin details
    const fetchAdminDetails = async () => {
        try {
            const response = await axios.get("/api/users/account", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAdminDetails(response.data);
            setEmail(response.data.email);
        } catch (err) {
            console.error("Error fetching admin details:", err);
            toast.error("Failed to load admin details.");
        }
    };

    // Update email
    const handleUpdateEmail = async () => {
        try {
            await axios.put(
                "/api/users/update-email",
                { email },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            toast.success("Email updated successfully.");
            fetchAdminDetails(); // Refresh admin details
        } catch (err) {
            console.error("Error updating email:", err);
            toast.error("Failed to update email.");
        }
    };

    // Update password
    const handleUpdatePassword = async () => {
        try {
            await axios.put(
                "/api/users/update-password",
                { currentPassword, newPassword },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            toast.success("Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            console.error("Error updating password:", err);
            toast.error("Failed to update password.");
        }
    };

    // Navigate back to Admin Home
    const handleBackToAdminHome = () => {
        navigate("/admin-home");
    };

    useEffect(() => {
        fetchAdminDetails();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <Typography variant="h4" gutterBottom>
                
            </Typography>

            <Typography variant="h6">Admin Details:</Typography>
            <Typography>Name: {adminDetails.name}</Typography>
            <Typography>Email: {adminDetails.email}</Typography>

            <div style={{ marginTop: "20px" }}>
                <Typography variant="h6">Update Email</Typography>
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleUpdateEmail}>
                    Update Email
                </Button>
            </div>

            <div style={{ marginTop: "20px" }}>
                <Typography variant="h6">Update Password</Typography>
                <TextField
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" color="secondary" onClick={handleUpdatePassword}>
                    Update Password
                </Button>
            </div>
            <div style={{ marginTop: "20px" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleBackToAdminHome}
                    >
                      Back to Admin Home
                    </Button>
                  </div>
        </div>
    );
};

export default SettingsPage;
