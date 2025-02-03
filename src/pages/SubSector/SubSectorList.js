import React, { useContext, useState, useMemo } from 'react';
import SubSectorContext from '../../context/SubSectorContext';
import SectorContext from '../../context/SectorContext';
import axios from '../../config/axios';
import '../../html/css/SubSector.css'; // Ensure this CSS file is created

export default function SubSectorList() {
    const { subSectors, subSectorsDispatch, handleEditClick } = useContext(SubSectorContext);
    const { sectors } = useContext(SectorContext);

    const [sortConfig, setSortConfig] = useState({ key: 'subSectorName', direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this sub-sector?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/sub-sectors/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                subSectorsDispatch({ type: 'REMOVE_SUB_SECTOR', payload: response.data._id });
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const findSectorName = (sectorId) => {
        const sector = sectors.data.find(s => s._id === sectorId);
        return sector ? sector.sectorName : 'Unknown Sector';
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Sorting logic
    const sortedSubSectors = useMemo(() => {
        let sortableSubSectors = [...subSectors.data];
        if (sortConfig !== null) {
            sortableSubSectors.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'subSectorName':
                        aValue = a.subSectorName.toLowerCase();
                        bValue = b.subSectorName.toLowerCase();
                        break;
                    case 'sector':
                        aValue = findSectorName(a.sectorId).toLowerCase();
                        bValue = findSectorName(b.sectorId).toLowerCase();
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                        break;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableSubSectors;
    }, [subSectors.data, sortConfig, sectors.data]);

    // Filtering logic
    const filteredSubSectors = useMemo(() => {
        return sortedSubSectors.filter((subSector) => {
            const subSectorName = subSector.subSectorName.toLowerCase();
            const sectorName = findSectorName(subSector.sectorId).toLowerCase();
            return (
                subSectorName.includes(searchTerm.toLowerCase()) ||
                sectorName.includes(searchTerm.toLowerCase())
            );
        });
    }, [sortedSubSectors, searchTerm]);

    return (
        <div className="sub-sector-list-container">
            <input
                type="text"
                placeholder="Search Sub-Sectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            <table className="sub-sector-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('subSectorName')}>
                            Sub-Sector Name {sortConfig.key === 'subSectorName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('sector')}>
                            Sector {sortConfig.key === 'sector' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th>Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSubSectors.map((subSector) => (
                        <tr key={subSector._id}>
                            <td>{subSector.subSectorName}</td>
                            <td>{findSectorName(subSector.sectorId)}</td>
                            <td>{subSector.generalComment}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(subSector._id)}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(subSector._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
