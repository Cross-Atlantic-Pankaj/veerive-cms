import React, { useContext, useState, useMemo } from 'react';
import CountryContext from '../../context/CountryContext';
import RegionContext from '../../context/RegionContext'; // Ensure this is the correct import
import axios from '../../config/axios';
import '../../html/css/Country.css'; // Ensure this CSS file is created

export default function CountryList() {
    const { countries, countriesDispatch, handleEditClick } = useContext(CountryContext);
    const { regions } = useContext(RegionContext);

    const [sortConfig, setSortConfig] = useState({ key: 'countryName', direction: 'ascending' });
    const [searchQuery, setSearchQuery] = useState('');

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this country?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/countries/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                countriesDispatch({ type: 'REMOVE_COUNTRY', payload: response.data._id });
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleEdit = (id) => {
        countriesDispatch({ type: 'SET_EDIT_ID', payload: id });
    };

    const findRegionName = (regionId) => {
        if (regions.data) {
            const region = regions.data.find(r => r._id === regionId);
            return region ? region.regionName : 'Unknown Region';
        }
        return 'Unknown Region';
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Sorting logic
    const sortedCountries = useMemo(() => {
        let sortableCountries = [...countries.data];

        if (sortConfig !== null) {
            sortableCountries.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'countryName':
                        aValue = a.countryName.toLowerCase();
                        bValue = b.countryName.toLowerCase();
                        break;
                    case 'region':
                        aValue = findRegionName(a.regionId).toLowerCase();
                        bValue = findRegionName(b.regionId).toLowerCase();
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

        // Filter based on search query
        return sortableCountries.filter(country => 
            country.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            findRegionName(country.regionId).toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [countries.data, sortConfig, regions.data, searchQuery]);

    return (
        <div className="country-list-container">
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />
            <table className="country-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('countryName')}>
                            Country Name {sortConfig.key === 'countryName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('region')}>
                            Region {sortConfig.key === 'region' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th>Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedCountries.map((country) => (
                        <tr key={country._id}>
                            <td>{country.countryName}</td>
                            <td>{findRegionName(country.regionId)}</td>
                            <td>{country.generalComment}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(country._id)}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(country._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
