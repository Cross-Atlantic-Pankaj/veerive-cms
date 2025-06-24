import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import ThemeContext from '../../context/ThemeContext';
import axios from '../../config/axios';
import '../../html/css/Theme.css';
import ThemeForm from './ThemeForm';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function normalizeString(str) {
    return (str || '')
        .trim()
        .replace(/^[^a-zA-Z0-9]+/, '')
        .toLowerCase();
}

export default function ThemeList() {
    const { 
        themes, 
        themesDispatch, 
        fetchThemes,
        fetchAllThemes, 
        handleAddClick, 
        handleEditClick, 
        sectors, 
        subSectors,
        currentPage, 
        setCurrentPage,
        isFormVisible,
        setIsFormVisible,
        handleFormSubmit
    } = useContext(ThemeContext);

    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;

    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'themeTitle', direction: 'ascending' });
    const location = useLocation();
    const query = useQuery();
    const editIdFromQuery = query.get('editId');
    const prevEditId = useRef();
    const [isRefreshingThemes, setIsRefreshingThemes] = useState(false);

    useEffect(() => {
        fetchAllThemes();
    }, []);

    useEffect(() => {
        if (themes.editId) {
            setIsFormVisible(true);
        }
    }, [themes.editId, setIsFormVisible]);

    useEffect(() => {
        if (editIdFromQuery) {
            handleEditClick(editIdFromQuery);
        }
    }, [editIdFromQuery, handleEditClick]);

    useEffect(() => {
        if (location.state && location.state.editId && location.state.editId !== prevEditId.current) {
            handleEditClick(location.state.editId);
            prevEditId.current = location.state.editId;
        }
    }, [location.state && location.state.editId, handleEditClick]);

    const getSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown';
        return ids.map(id => {
            const item = data.find(ele => ele._id === id);
            return item ? item.sectorName : 'Unknown';
        }).join(', '); 
    };

    const getSubSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown';
        return ids.map(id => {
            const item = data.find(ele => ele._id === id);
            return item ? item.subSectorName : 'Unknown';
        }).join(', '); 
    };

    // Always use allThemes for sorting/searching/pagination
    const sortedThemes = useMemo(() => {
        let sortableThemes = [...(themes.allThemes || [])];
        if (sortConfig !== null) {
            sortableThemes.sort((a, b) => {
                if (sortConfig.key === 'themeTitle') {
                    const aValue = normalizeString(a.themeTitle);
                    const bValue = normalizeString(b.themeTitle);
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if ((a[sortConfig.key] || '') < (b[sortConfig.key] || '')) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if ((a[sortConfig.key] || '') > (b[sortConfig.key] || '')) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableThemes;
    }, [themes.allThemes, sortConfig]);
    
    // Search on allThemes
    const filteredThemes = useMemo(() => {
        return sortedThemes.filter(theme =>
            (theme.themeTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            getSectorNames(theme.sectors, sectors.data).toLowerCase().includes(searchQuery.toLowerCase()) ||
            getSubSectorNames(theme.subSectors, subSectors.data).toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sortedThemes, searchQuery, sectors.data, subSectors.data]);

    // Pagination on filteredThemes
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(filteredThemes.length / itemsPerPage));
    const currentPageSafe = Math.min(currentPage, totalPages);
    const paginatedThemes = filteredThemes.slice((currentPageSafe - 1) * itemsPerPage, currentPageSafe * itemsPerPage);

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this theme?');
        if (userInput) {
            try {
                await axios.delete(`/api/admin/themes/${id}`, { 
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
                });
                fetchAllThemes();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const downloadCSV = () => {
        try {
            // Prepare headers
            const headers = [
                'Theme Title',
                'Is Trending',
                'Sectors',
                'Sub-Sectors',
                'General Comment',
                'Theme Description',
                'Trending Score',
                'Impact Score',
                'Predictive Momentum Score',
                'Overall Score',
                'Trending Score Image',
                'Impact Score Image',
                'Predictive Momentum Score Image'
            ];

            // Prepare data rows (all filtered themes, not just current page)
            const csvData = filteredThemes.map(theme => [
                theme.themeTitle || '',
                theme.isTrending ? 'Yes' : 'No',
                getSectorNames(theme.sectors, sectors.data),
                getSubSectorNames(theme.subSectors, subSectors.data),
                theme.generalComment || '',
                theme.themeDescription || '',
                theme.trendingScore || '0',
                theme.impactScore || '0',
                theme.predictiveMomentumScore || '0',
                theme.overallScore || '0',
                theme.trendingScoreImage || '',
                theme.impactScoreImage || '',
                theme.predictiveMomentumScoreImage || ''
            ]);

            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.map(cell => {
                    // Escape commas and quotes in cell values
                    const escapedCell = String(cell).replace(/"/g, '""');
                    return `"${escapedCell}"`;
                }).join(','))
            ].join('\n');

            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `themes_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('✅ CSV file downloaded successfully!');
        } catch (error) {
            console.error('Error generating CSV:', error);
            toast.error('❌ Failed to generate CSV file');
        }
    };

    if (isFormVisible) {
        return (
            <div className="theme-list-container">
                <ThemeForm handleFormSubmit={handleFormSubmit} />
            </div>
        );
    }

    return (
        <div className="theme-list-container">
            <div className="theme-list-top-bar" style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <button className="add-theme-btn" onClick={handleAddClick}>Add Theme</button>
                <button
                    className="download-csv-btn"
                    style={{
                        marginLeft: 8,
                        padding: '4px 10px',
                        borderRadius: 16,
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    onClick={downloadCSV}
                    title="Download themes as CSV"
                >
                    📥 Download CSV
                </button>
            </div>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button className="search-btn" onClick={handleSearch}>Search</button>
            </div>
            <table className="theme-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('themeTitle')}>
                            Theme Title {sortConfig.key === 'themeTitle' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('sectors')}>
                            Sectors {sortConfig.key === 'sectors' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('subSectors')}>
                            Sub-Sectors {sortConfig.key === 'subSectors' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th>General Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedThemes.map(ele => (
                        <tr key={ele._id}>
                            <td>{ele.themeTitle}</td>
                            <td>{getSectorNames(ele.sectors, sectors.data)}</td>
                            <td>{getSubSectorNames(ele.subSectors, subSectors.data)}</td>
                            <td>{ele.generalComment || 'N/A'}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(ele._id)} disabled={userRole === 'User'}>
                                    Edit
                                </button>
                                <button className="remove-btn" onClick={() => handleRemove(ele._id)} disabled={userRole === 'User'}>
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {totalPages > 0 && (
                <div className="pagination">
                    <button
                        disabled={currentPageSafe === 1}
                        onClick={() => {
                            const newPage = Math.max(currentPageSafe - 1, 1);
                            setCurrentPage(newPage);
                            localStorage.setItem('currentPage', newPage);
                        }}
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPageSafe} of {totalPages}
                    </span>
                    <button
                        disabled={currentPageSafe >= totalPages}
                        onClick={() => {
                            const newPage = Math.min(currentPageSafe + 1, totalPages);
                            setCurrentPage(newPage);
                            localStorage.setItem('currentPage', newPage);
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

// Add these styles to your CSS file
const styles = `
.download-csv-btn:hover {
    background: #45a049 !important;
}

.download-csv-btn:active {
    background: #3d8b40 !important;
}
`;
