import React, { useContext, useState } from 'react';
import SourceContext from '../../context/SourceContext';
import '../../html/css/Source.css'; // Ensure this CSS file is created
import axios from '../../config/axios';

export default function SourceList() {
    const { sources, sourcesDispatch, handleEditClick } = useContext(SourceContext);
    const [sortConfig, setSortConfig] = useState({ key: 'sourceName', direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');

    // Function to handle sorting
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Sorting logic
    const sortedSources = [...sources.data].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    // Filtering logic
    const filteredSources = sortedSources.filter(source =>
        source.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.sourceType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (id === undefined || id === null) {
            console.error('Invalid ID:', id);
            return;
        }

        const userInput = window.confirm('Are you sure you want to remove this source?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/sources/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                sourcesDispatch({ type: 'REMOVE_SOURCE', payload: response.data._id });
            } catch (err) {
                console.error('Error deleting source:', err);
                alert('An error occurred while deleting the source.');
            }
        }
    };

    return (
        <div className="source-list-container">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by Name or Type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <table className="source-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('sourceName')}>
                            Name {sortConfig.key === 'sourceName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => handleSort('sourceType')}>
                            Type {sortConfig.key === 'sourceType' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th>Comments</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSources.map(source => (
                        <tr key={source._id}>
                            <td>{source.sourceName}</td>
                            <td>{source.sourceType}</td>
                            <td>{source.generalComment}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(source._id)}>Edit</button>
                                <button className="remove-btn" onClick={() => handleDelete(source._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
