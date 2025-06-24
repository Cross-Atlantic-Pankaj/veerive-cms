import React, { useContext, useState, useMemo, useEffect } from 'react';
import SectorContext from '../../context/SectorContext';
import axios from '../../config/axios';
import AuthContext from '../../context/AuthContext';
import Papa from 'papaparse';

export default function SectorList() {
    const { sectors, sectorsDispatch, handleEditClick } = useContext(SectorContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    const [sortConfig, setSortConfig] = useState({ key: 'sectorName', direction: 'ascending' });
    const [searchQuery, setSearchQuery] = useState('');
    const [allSectors, setAllSectors] = useState([]);

    // Fetch all sectors on mount
    useEffect(() => {
        const fetchAllSectors = async () => {
            try {
                const response = await axios.get('http://localhost:3050/api/admin/sectors', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (Array.isArray(response.data)) {
                    setAllSectors(response.data);
                } else if (response.data.sectors && Array.isArray(response.data.sectors)) {
                    setAllSectors(response.data.sectors);
                } else {
                    setAllSectors([]);
                }
            } catch (err) {
                setAllSectors([]);
            }
        };
        fetchAllSectors();
    }, []);

    // Sorting and searching on all data
    const processedSectors = useMemo(() => {
        let data = [...allSectors];
        if (searchQuery.trim()) {
            data = data.filter(sector =>
                (sector.sectorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (sector.generalComment || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (sortConfig !== null) {
            data.sort((a, b) => {
                const aValue = (a[sortConfig.key] || '').toLowerCase();
                const bValue = (b[sortConfig.key] || '').toLowerCase();
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [allSectors, searchQuery, sortConfig]);

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this sector?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/sectors/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                sectorsDispatch({ type: 'REMOVE_SECTOR', payload: response.data._id });
                setAllSectors(prev => prev.filter(s => s._id !== id));
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleDownloadCSV = () => {
        // Prepare all fields, arrays as comma-separated
        const csvData = processedSectors.map(sector => {
            const out = { ...sector };
            Object.keys(out).forEach(key => {
                if (Array.isArray(out[key])) {
                    out[key] = out[key].join(', ');
                }
            });
            return out;
        });
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sectors_raw.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="sector-list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="search-input"
                    style={{ maxWidth: 300 }}
                />
                <button onClick={handleDownloadCSV} className="download-btn">Download Raw CSV</button>
            </div>
            <table className="sector-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('sectorName')}>Sector Name {sortConfig.key === 'sectorName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}</th>
                        <th onClick={() => requestSort('generalComment')}>Comment {sortConfig.key === 'generalComment' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {processedSectors.map((sector) => (
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
