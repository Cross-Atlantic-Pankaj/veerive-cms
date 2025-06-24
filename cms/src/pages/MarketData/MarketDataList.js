import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import CSVUploader from '../../components/CSVUploader';
import Papa from 'papaparse';
import '../../html/css/Company.css';

const MarketDataList = () => {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchMarketData();
    }, []);

    const fetchMarketData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/market-data', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMarketData(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching market data:', error);
            toast.error('Failed to fetch market data');
            setMarketData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        fetchMarketData();
        toast.success('Data uploaded successfully!');
    };

    // Search and sort on all fields
    const processedData = useMemo(() => {
        let data = [...marketData];
        if (searchQuery.trim()) {
            data = data.filter(row =>
                Object.values(row).some(val =>
                    (typeof val === 'string' || typeof val === 'number') &&
                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
        if (sortConfig !== null) {
            data.sort((a, b) => {
                const aValue = (a[sortConfig.key] || '').toString().toLowerCase();
                const bValue = (b[sortConfig.key] || '').toString().toLowerCase();
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [marketData, searchQuery, sortConfig]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // CSV download (all filtered/sorted data)
    const handleDownloadCSV = () => {
        const csvData = processedData.map(row => {
            const out = { ...row };
            Object.keys(out).forEach(key => {
                if (Array.isArray(out[key])) {
                    out[key] = out[key].join(', ');
                }
                if (typeof out[key] === 'object' && out[key] !== null) {
                    // Try to use .name or .title if present
                    out[key] = out[key].name || out[key].title || JSON.stringify(out[key]);
                }
            });
            return out;
        });
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'market_data_raw.csv');
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

    useEffect(() => {
        if (currentPage > totalPages) {
            setPage(1);
        }
    }, [totalPages, currentPage]);

    // Get all unique keys for table headers
    const allKeys = useMemo(() => {
        const keys = new Set();
        marketData.forEach(row => Object.keys(row).forEach(k => keys.add(k)));
        return Array.from(keys);
    }, [marketData]);

    return (
        <div className="app-container">
            <div className="content-container">
                <div className="page-header">
                    <h2>Market Data List</h2>
                    <div className="header-actions">
                        <CSVUploader
                            endpoint="/api/admin/market-data/bulk"
                            onUploadSuccess={handleUploadSuccess}
                            requiredFields={['title','dataDescription','sector','subSector','sourceName']}
                            lookupFields={{}}
                            fieldMappings={{}}
                        />
                        <button 
                            className="primary-button"
                            onClick={() => navigate('/market-data/add')}
                        >
                            Add New
                        </button>
                        <button 
                            className="primary-button"
                            onClick={handleDownloadCSV}
                        >
                            Download Raw CSV
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', marginBottom: 16 }}>
                    <input
                        type="text"
                        placeholder="Search all fields..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input"
                        style={{ maxWidth: 300 }}
                    />
                </div>
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading market data...</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {allKeys.map(key => (
                                        <th key={key} onClick={() => requestSort(key)}>
                                            {key} {sortConfig.key === key && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                                        </th>
                                    ))}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={allKeys.length + 1} className="empty-message">
                                            No market data found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((data) => (
                                        <tr key={data._id}>
                                            {allKeys.map(key => (
                                                <td key={key}>
                                                    {Array.isArray(data[key]) ? data[key].join(', ') :
                                                        typeof data[key] === 'object' && data[key] !== null ? (data[key].name || data[key].title || JSON.stringify(data[key])) :
                                                        data[key]}
                                                </td>
                                            ))}
                                            <td>
                                                <button
                                                    className="action-button"
                                                    onClick={() => navigate(`/market-data/edit/${data._id}`)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
                )}
            </div>
        </div>
    );
};

export default MarketDataList; 