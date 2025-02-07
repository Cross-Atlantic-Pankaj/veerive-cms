
import React, { useContext, useState, useMemo, useEffect, useCallback } from 'react';
import CountryContext from '../../context/CountryContext';
import RegionContext from '../../context/RegionContext';
import axios from '../../config/axios';
import '../../html/css/Country.css';

export default function CountryList() {
    const { countries, countriesDispatch, handleEditClick } = useContext(CountryContext);
    const { regions } = useContext(RegionContext);

    const [sortConfig, setSortConfig] = useState({ key: 'countryName', direction: 'ascending' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        axios.get('/api/admin/countries', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
            console.log("Fetched Countries Data:", response.data);
            countriesDispatch({ type: 'SET_COUNTRIES', payload: response.data });
        })
        .catch(error => console.log("API Fetch Error:", error));
    }, [countriesDispatch]); // ✅ Included 'countriesDispatch' here
    

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

    
    // const findRegionName = useCallback((regionId) => {
    //     if (regions.data) {
    //         const region = regions.data.find(r => r._id === regionId);
    //         return region ? region.regionName : 'Unknown Region';
    //     }
    //     return 'Unknown Region';
    // }, [regions]);

    const findRegionName = useCallback((regionId) => {
        if (!regions?.data || regions.data.length === 0) {
            return 'Loading...'; // ✅ Show 'Loading...' instead of 'Unknown Region'
        }
        
        const region = regions.data.find(r => r._id === regionId);
        return region ? region.regionName : 'Unknown Region';
    }, [regions]);
    
    
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedCountries = useMemo(() => {
        console.log("Sorting countries:", countries.data);
    
        if (!Array.isArray(countries.data) || countries.data.length === 0) {
            return [];
        }
    
        let sortableCountries = [...countries.data];
    
        if (sortConfig !== null) {
            sortableCountries.sort((a, b) => {
                let aValue = a.countryName?.toLowerCase() || "";
                let bValue = b.countryName?.toLowerCase() || "";
    
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
    
        return sortableCountries.filter(country => 
            country.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            findRegionName(country.regionId).toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [countries, sortConfig, searchQuery, findRegionName]); // ✅ Added findRegionName here
    
    if (!countries?.data || !regions?.data) {
        return <p>Loading data...</p>; // ✅ Prevent rendering empty data
    }
    
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
                    {sortedCountries.length > 0 ? (
                        sortedCountries.map((country) => (
                            <tr key={country._id}>
                                <td>{country.countryName || "N/A"}</td>
                                <td>{findRegionName(country.regionId) || "N/A"}</td>
                                <td>{country.generalComment || "N/A"}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEditClick(country._id)}>Edit</button>
                                    <button className="remove-btn" onClick={() => handleRemove(country._id)}>Remove</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center", color: "red" }}>No Data Available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
