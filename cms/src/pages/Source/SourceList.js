import React, { useContext, useState, useEffect, useMemo } from 'react';
import SourceContext from '../../context/SourceContext';
import AuthContext from '../../context/AuthContext';
import '../../html/css/Source.css'; // Ensure this CSS file is created
import axios from '../../config/axios';
import Papa from 'papaparse';

export default function SourceList() {
    const { sourcesDispatch, handleEditClick } = useContext(SourceContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;
    const [sortConfig, setSortConfig] = useState({ key: 'sourceName', direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');
    const [allSources, setAllSources] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch all sources on mount
    useEffect(() => {
        const fetchAllSources = async () => {
            try {
                const response = await axios.get('http://localhost:3050/api/admin/sources', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (Array.isArray(response.data)) {
                    setAllSources(response.data);
                } else if (response.data.sources && Array.isArray(response.data.sources)) {
                    setAllSources(response.data.sources);
                } else {
                    setAllSources([]);
                }
            } catch (err) {
                setAllSources([]);
            }
        };
        fetchAllSources();
    }, []);

    // Sorting and searching on all data
    const processedSources = useMemo(() => {
        let data = [...allSources];
        if (searchTerm.trim()) {
            data = data.filter(source =>
                (source.sourceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (source.sourceType || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    }, [allSources, searchTerm, sortConfig]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(processedSources.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const paginatedSources = processedSources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDelete = async (id) => {
        if (id === undefined || id === null) {
            console.error('Invalid ID:', id);
            return;
        }
        const userInput = window.confirm('Are you sure you want to remove this source?');
        if (userInput) {
            try {
                const response = await axios.delete(`http://localhost:3050/api/admin/sources/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                sourcesDispatch({ type: 'REMOVE_SOURCE', payload: response.data._id });
                setAllSources(prev => prev.filter(s => s._id !== id));
            } catch (err) {
                console.error('Error deleting source:', err);
                alert('An error occurred while deleting the source.');
            }
        }
    };

    const handleDownloadCSV = () => {
        const csvData = processedSources.map(source => {
            const out = { ...source };
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
        link.setAttribute('download', 'sources_raw.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Reset to page 1 if search/filter changes and current page is out of range
    useEffect(() => {
        if (currentPage > totalPages) {
            setPage(1);
        }
    }, [totalPages, currentPage]);

    return (
        <div className="source-list-container">
            <div className="search-container" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="Search by Name or Type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    style={{ maxWidth: 300 }}
                />
                <button onClick={handleDownloadCSV} className="download-btn">Download Raw CSV</button>
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
                    {paginatedSources.map(source => (
                        <tr key={source._id}>
                            <td>{source.sourceName}</td>
                            <td>{source.sourceType}</td>
                            <td>{source.generalComment}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(source._id)} disabled={userRole === 'User'}>Edit</button>
                                <button className="remove-btn" onClick={() => handleDelete(source._id)} disabled={userRole === 'User'}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button>
                </div>
            )}
        </div>
    );
}
