import React, { useContext } from 'react';
import SectorContext from '../../context/SectorContext';
import axios from '../../config/axios';
import AuthContext from '../../context/AuthContext';
import Papa from 'papaparse';

export default function SectorList() {
    const { sectors, sectorsDispatch, handleEditClick } = useContext(SectorContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this sector?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/sectors/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                sectorsDispatch({ type: 'REMOVE_SECTOR', payload: response.data._id });
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleDownloadCSV = () => {
        const csvData = sectors.data.map(sector => ({
            ...sector,
            // Add more mapping if needed
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sectors.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="sector-list-container">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={handleDownloadCSV} className="download-btn">Download CSV</button>
            </div>
            <table className="sector-table">
                <thead>
                    <tr>
                        <th>Sector Name</th>
                        <th>Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sectors.data.map((sector) => (
                        <tr key={sector._id}>
                            <td>{sector.sectorName}</td>
                            <td>{sector.generalComment}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(sector._id)} disabled={userRole === 'User'}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(sector._id)} disabled={userRole === 'User'}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
