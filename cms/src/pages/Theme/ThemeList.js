import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import ThemeContext from '../../context/ThemeContext';
import axios from '../../config/axios';
import '../../html/css/Theme.css';
import ThemeForm from './ThemeForm';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function useQuery() {
  return new URLSearchParams(useLocation().search);
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

    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'themeTitle', direction: 'ascending' });
    const location = useLocation();
    const query = useQuery();
    const editIdFromQuery = query.get('editId');
    const prevEditId = useRef();
    const [isRefreshingThemes, setIsRefreshingThemes] = useState(false);

    useEffect(() => {
        console.log("ThemeList mounted, fetching themes...");
        fetchThemes(currentPage);
        fetchAllThemes();
    }, []);

    useEffect(() => {
        console.log("Edit ID changed:", themes.editId);
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
        // Only trigger if editId changes
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

    const sortedThemes = useMemo(() => {
        let sortableThemes = searchQuery ? [...themes.allThemes] : [...themes.data];
        if (sortConfig !== null) {
            sortableThemes.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableThemes;
    }, [themes.data, themes.allThemes, searchQuery, sortConfig]);
    
    const filteredThemes = sortedThemes.filter(theme =>
        (theme.themeTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        getSectorNames(theme.sectors, sectors.data).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getSubSectorNames(theme.subSectors, subSectors.data).toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this theme?');
        if (userInput) {
            try {
                await axios.delete(`/api/admin/themes/${id}`, { 
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
                });
                fetchThemes(currentPage);
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleSearch = () => {
        fetchThemes(1);
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

            // Prepare data rows
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

    console.log("Current state:", { isFormVisible, editId: themes.editId, themesCount: themes.data.length });

    if (isFormVisible) {
        console.log("Showing ThemeForm");
        return (
            <div className="theme-list-container">
                <ThemeForm handleFormSubmit={handleFormSubmit} />
            </div>
        );
    }

    console.log("Showing ThemeList");
    return (
        <div className="theme-list-container">
            <div className="theme-list-top-bar" style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <button className="add-theme-btn" onClick={handleAddClick}>Add Theme</button>
                <button
                    className="refresh-theme-btn"
                    style={{ marginLeft: 8, padding: '4px 10px', borderRadius: 16, background: '#f3f4f6', border: '1px solid #d1d5db', cursor: isRefreshingThemes ? 'not-allowed' : 'pointer', opacity: isRefreshingThemes ? 0.6 : 1 }}
                    title="Refresh themes"
                    onClick={async () => {
                        setIsRefreshingThemes(true);
                        try {
                            await fetchThemes(currentPage);
                            await fetchAllThemes();
                        } finally {
                            setIsRefreshingThemes(false);
                        }
                    }}
                    disabled={isRefreshingThemes}
                >
                    {isRefreshingThemes ? (
                        <span style={{ fontSize: 16, display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                    ) : (
                        <span>&#x21bb; Refresh</span>
                    )}
                </button>
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
                    {filteredThemes.map(ele => (
                        <tr key={ele._id}>
                            <td>{ele.themeTitle}</td>
                            <td>{getSectorNames(ele.sectors, sectors.data)}</td>
                            <td>{getSubSectorNames(ele.subSectors, subSectors.data)}</td>
                            <td>{ele.generalComment || 'N/A'}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(ele._id)}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(ele._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {themes.totalPages > 0 && (
                <div className="pagination">
                    <button
                        disabled={themes.currentPage === 1}
                        onClick={() => {
                            const newPage = Math.max(themes.currentPage - 1, 1);
                            setCurrentPage(newPage);
                            localStorage.setItem('currentPage', newPage);
                        }}
                    >
                        Previous
                    </button>
                    <span>
                        Page {themes.currentPage} of {themes.totalPages || 1}
                    </span>
                    <button
                        disabled={themes.currentPage >= themes.totalPages}
                        onClick={() => {
                            const newPage = Math.min(themes.currentPage + 1, themes.totalPages);
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
