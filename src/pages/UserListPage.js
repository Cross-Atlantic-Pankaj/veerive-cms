

// export default UserListPage;
import React, { useState, useEffect } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-toastify";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for navigation

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user list:", err);
      toast.error("Failed to load user list.");
      setLoading(false);
    }
  };

  // Handle promoting/demoting user roles
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(
        `/api/users/change-role/${userId}`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Role updated successfully.");
      fetchUsers(); // Refresh the user list after role change
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error("Failed to update role.");
    }
  };

  // Handle deleting a user account
  const handleDeleteAccount = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("User account deleted successfully.");
      fetchUsers(); // Refresh the user list after deletion
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error("Failed to delete account.");
    }
  };

  // Handle going back to Admin Home
  const handleBackToAdminHome = () => {
    navigate("/admin-home");
  };

  // Fetch users when the component loads
  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>User List</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Registration Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {user.role === "User" ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRoleChange(user._id, "Moderator")}
                    style={{ marginRight: "10px" }}
                  >
                    Promote to Moderator
                  </Button>
                ) : user.role === "Moderator" ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleRoleChange(user._id, "User")}
                    style={{ marginRight: "10px" }}
                  >
                    Demote to User
                  </Button>
                ) : null}
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteAccount(user._id)}
                >
                  Delete Account
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

export default UserListPage;
