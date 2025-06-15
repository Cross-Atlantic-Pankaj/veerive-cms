// export default UserListPage;
import React, { useState, useEffect, useContext } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import AlertComponent from '../components/AlertComponent';

const UserManagementPage = () => {
  const { state } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'User', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Failed to load user list.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (error) alert(error);
    if (success) alert(success);
  }, [error, success]);

  // Only SuperAdmin can access
  if (!state.user || state.user.role !== 'SuperAdmin') {
    return <div style={{color: 'red', margin: '2rem'}}>Access denied. Only SuperAdmin can manage users.</div>;
  }

  // Handle user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newUser.email || !newUser.password || !newUser.role) {
      setError('All fields are required.');
      return;
    }
    try {
      const response = await axios.post('/api/users/register', newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess('User created successfully!');
      setNewUser({ email: '', password: '', role: 'User', name: '' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user.');
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    if (newRole === 'SuperAdmin') return; // Prevent assigning SuperAdmin
    try {
      await axios.put(`/api/users/change-role/${userId}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAlert({ open: true, message: 'Role updated successfully.', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setAlert({ open: true, message: 'Failed to update role.', severity: 'error' });
    }
  };

  // Handle user deletion
  const handleDeleteAccount = async (userId, userEmail) => {
    if (userEmail === 'info@veerive.com') return; // Prevent deleting SuperAdmin
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAlert({ open: true, message: 'User deleted successfully.', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setAlert({ open: true, message: 'Failed to delete user.', severity: 'error' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>User Management (SuperAdmin Only)</h2>
      <form onSubmit={handleCreateUser} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
        <h3>Create New User/Admin</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            style={{ flex: 1 }}
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            style={{ flex: 2 }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            style={{ flex: 2 }}
            required
          />
          <select
            value={newUser.role}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            style={{ flex: 1 }}
            required
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit" style={{ flex: 1 }}>Create</button>
        </div>
        {error && <AlertComponent open={!!error} message={error} severity="error" onClose={() => setError('')} />}
        {success && <AlertComponent open={!!success} message={success} severity="success" onClose={() => setSuccess('')} />}
      </form>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.filter(user =>
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())
          ).map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name || '-'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.email === 'info@veerive.com' ? (
                  <b>SuperAdmin</b>
                ) : (
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user._id, e.target.value)}
                    disabled={user.email === 'info@veerive.com' || !(state.user.role === 'Admin' || state.user.role === 'SuperAdmin')}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                )}
              </TableCell>
              <TableCell>
                {user.email !== 'info@veerive.com' && (state.user.role === 'Admin' || state.user.role === 'SuperAdmin') && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteAccount(user._id, user.email)}
                  >
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertComponent open={alert.open} message={alert.message} severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })} />
    </div>
  );
};

export default UserManagementPage;
