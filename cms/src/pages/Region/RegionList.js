import React, { useContext } from 'react';
import RegionContext from '../../context/RegionContext';
import axios from '../../config/axios';
import AuthContext from '../../context/AuthContext';

export default function RegionList() {
    const { regions, regionsDispatch, handleEditClick } = useContext(RegionContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this region?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/regions/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                regionsDispatch({ type: 'REMOVE_REGION', payload: response.data._id });
            } catch (err) {
                alert(err.message);
            }
        }
    };
    if (!regions?.data) {
        return <p>Loading regions...</p>; // ✅ Show loading until regions are available
    }
    
    return (
        <div className="region-list-container">
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
                                <button className="edit-btn" onClick={() => handleEditClick(ele._id)} disabled={userRole === 'User'}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(ele._id)} disabled={userRole === 'User'}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
