import React, { useContext, useState } from 'react';
import RegionContext from '../../context/RegionContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import axios from '../../config/axios';
import AuthContext from '../../context/AuthContext';

export default function RegionList() {
    const { regions, regionsDispatch, handleEditClick } = useContext(RegionContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });

    const handleDeleteClick = (id, regionName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Region',
            message: `Are you sure you want to delete "${regionName}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: { id, name: regionName }
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/regions/${id}`, { 
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
            });
            regionsDispatch({ type: 'REMOVE_REGION', payload: response.data._id });
        } catch (err) {
            alert(err.message);
        } finally {
            handleCloseModal();
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal({
            isOpen: false,
            title: '',
            message: '',
            onConfirm: null,
            itemToDelete: null
        });
    };

    if (!regions?.data) {
        return <p>Loading regions...</p>; // ✅ Show loading until regions are available
    }
    
    return (
        <div className="region-list-container">
            {/* Stats Card */}
            <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                margin: '20px 0',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#4F46E5',
                    marginBottom: '8px'
                }}>{regions.data.length}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Regions</div>
            </div>

            <table className="region-table">
                <thead>
                    <tr>
                        <th>Region Name</th>
                        <th>Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {regions.data.map((ele) => (
                        <tr key={ele._id}>
                            <td>{ele.regionName}</td>
                            <td>{ele.generalComment}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(ele._id)} disabled={userRole === 'User'}>✏️ Edit</button>
                                <button className="remove-btn" onClick={() => handleDeleteClick(ele._id, ele.regionName)} disabled={userRole === 'User'}>🗑️ Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
}
