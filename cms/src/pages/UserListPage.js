import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import AlertComponent from '../components/AlertComponent';
import ConfirmationModal from '../components/ConfirmationModal';
import styles from '../html/css/UserList.module.css';

const UserManagementPage = () => {
  const { state } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'User', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    itemToDelete: null
  });

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
    return (
      <div className={styles.contentContainer}>
        <div className={styles.accessDenied}>
          Access denied. Only SuperAdmin can manage users.
        </div>
      </div>
    );
  }

  // Handle user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newUser.email || !newUser.password || !newUser.role) {
      setError('Email, password, and role are required.');
      return;
    }

    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const response = await axios.post('/api/users/register', newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess('User created successfully!');
      setNewUser({ email: '', password: '', role: 'User', name: '' });
      fetchUsers();
      toast.success('User created successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create user.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingUser(false);
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
  const handleDeleteClick = (userId, userName, userEmail) => {
    if (userEmail === 'info@veerive.com') return; // Prevent deleting SuperAdmin
    setConfirmationModal({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete user "${userName || userEmail}"? This action cannot be undone.`,
      onConfirm: () => handleDeleteAccount(userId, userEmail),
      itemToDelete: userId
    });
  };

  const handleDeleteAccount = async (userId, userEmail) => {
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAlert({ open: true, message: 'User deleted successfully.', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setAlert({ open: true, message: 'Failed to delete user.', severity: 'error' });
    } finally {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleCloseModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return (
      <div className={styles.contentContainer}>
        <div className={styles.loadingContainer}>Loading users...</div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.contentContainer}>
      <div className={styles.pageHeader}>
        <h2>User Management</h2>
      </div>

      {/* Stats Card */}
      <div className={styles.statsCard}>
        <div className={styles.statsNumber}>{users.length}</div>
        <div className={styles.statsLabel}>Total Users</div>
      </div>

      {/* Create User Form */}
      <div className={styles.createUserCard}>
        <h3 className={styles.createUserTitle}>Create New User/Admin</h3>
        <form onSubmit={handleCreateUser} className={styles.createUserForm}>
          <input
            type="text"
            placeholder="Full Name (Optional)"
            value={newUser.name}
            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            className={styles.formInput}
            disabled={isCreatingUser}
          />
          <input
            type="email"
            placeholder="Email Address *"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            className={styles.formInput}
            required
            disabled={isCreatingUser}
          />
          <input
            type="password"
            placeholder="Password (min 6 chars) *"
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            className={styles.formInput}
            required
            minLength={6}
            disabled={isCreatingUser}
          />
          <select
            value={newUser.role}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            className={styles.formSelect}
            required
            disabled={isCreatingUser}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          <button 
            type="submit" 
            className={styles.createButton}
            disabled={isCreatingUser}
          >
            {isCreatingUser ? '⏳ Creating...' : '➕ Create User'}
          </button>
        </form>
        {error && <AlertComponent open={!!error} message={error} severity="error" onClose={() => setError('')} />}
        {success && <AlertComponent open={!!success} message={success} severity="success" onClose={() => setSuccess('')} />}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className={styles.emptyMessage}>
          {search ? `No users found matching "${search}"` : 'No users found'}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || 'Not provided'}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.email === 'info@veerive.com' ? (
                      <strong>SuperAdmin</strong>
                    ) : (
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user._id, e.target.value)}
                        disabled={user.email === 'info@veerive.com' || !(state.user.role === 'Admin' || state.user.role === 'SuperAdmin')}
                        className={styles.roleSelect}
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td>
                    {user.email !== 'info@veerive.com' && (state.user.role === 'Admin' || state.user.role === 'SuperAdmin') && (
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDeleteClick(user._id, user.name, user.email)}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertComponent 
        open={alert.open} 
        message={alert.message} 
        severity={alert.severity} 
        onClose={() => setAlert({ ...alert, open: false })} 
      />
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default UserManagementPage;
