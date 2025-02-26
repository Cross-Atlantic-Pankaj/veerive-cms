import React, { useContext, useState } from 'react'; // Import React and hooks from React
import CompanyContext from '../../context/CompanyContext'; // Import CompanyContext for managing company-related state
import axios from '../../config/axios'; // Import axios instance for making HTTP requests
import '../../html/css/Company.css'; // Import CSS for styling the CompanyList component

export default function CompanyList() {
    // Use CompanyContext to access context values and dispatch actions
    const { companies, companiesDispatch, handleAddClick, handleEditClick, countries, sectors, subSectors } = useContext(CompanyContext);

    // State variables for search query, sorting column, and sorting order
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('companyName');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for ascending, 'desc' for descending

    // Helper function to get country name by ID
    const getCountryName = (id, data) => {
        const item = data.find(ele => ele._id === id); // Find the country item by ID
        return item ? item.countryName : 'N/A'; // Return country name or 'N/A' if not found
    };

    // Helper function to get sector names by array of sector IDs
    const getSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if ids is not an array
        const sectorNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the sector item by ID
            return item ? item.sectorName : 'Unknown'; // Return sector name or 'Unknown' if not found
        });
        return sectorNames.join(', '); // Join sector names with commas
    };

    // Helper function to get sub-sector names by array of sub-sector IDs
    const getSubSectorNames = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown'; // Return 'Unknown' if ids is not an array
        const subSectorNames = ids.map(id => {
            const item = data.find(ele => ele._id === id); // Find the sub-sector item by ID
            return item ? item.subSectorName : 'Unknown'; // Return sub-sector name or 'Unknown' if not found
        });
        return subSectorNames.join(', '); // Join sub-sector names with commas
    };

    // Filter companies based on the search query
    const filteredCompanies = companies.data.filter(company =>
        (company.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by company name
        (company.parentName || '').toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by parent name
        (company.website || '').toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by website
        getCountryName(company.country, countries.data).toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by country name
        getSectorNames(company.sectors, sectors.data).toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by sector names
        getSubSectorNames(company.subSectors, subSectors.data).toLowerCase().includes(searchQuery.toLowerCase()) // Filter by sub-sector names
    );

    // Sort the filtered companies based on the selected column and order
    const sortedCompanies = [...filteredCompanies].sort((a, b) => {
        const aValue = a[sortColumn] || ''; // Get the value of the column for company a
        const bValue = b[sortColumn] || ''; // Get the value of the column for company b

        let comparison = 0;
        if (aValue > bValue) {
            comparison = 1; // Determine the comparison result
        } else if (aValue < bValue) {
            comparison = -1; // Determine the comparison result
        }
        return sortOrder === 'asc' ? comparison : -comparison; // Return sorted result based on order
    });

    // Handle sorting when a column header is clicked
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order if column is the same
        } else {
            setSortColumn(column); // Set new sort column
            setSortOrder('asc'); // Reset sort order to ascending
        }
    };

    // Handle company removal
    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this company?'); // Confirm deletion
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/companies/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); // Make API request to delete company
                companiesDispatch({ type: 'REMOVE_COMPANY', payload: response.data._id }); // Dispatch action to remove company from context
            } catch (err) {
                alert(err.message); // Show error message if deletion fails
            }
        }
    };

    // Handle search input change
    const handleSearch = () => {
        // You can perform additional logic on search if needed
    };

    return (
        <div className="company-list-container"> {/* Container for the company list */}
            <button className="add-company-btn" onClick={handleAddClick}>Add Company</button> {/* Button to add a new company */}
            <div className="search-container"> {/* Container for the search input */}
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Update search query state on input change
                    className="search-input"
                />
                <button className="search-btn" onClick={handleSearch}>Search</button> {/* Button to trigger search */}
            </div>
            <div className="table-responsive"> 
            <table className="company-table"> {/* Table to display the list of companies */}
                <thead>
                    <tr>
                        <th onClick={() => handleSort('companyName')}>Company Name {sortColumn === 'companyName' && (sortOrder === 'asc' ? '▲' : '▼')}</th> {/* Column header with sorting indicator */}
                        <th onClick={() => handleSort('parentName')}>Parent Name {sortColumn === 'parentName' && (sortOrder === 'asc' ? '▲' : '▼')}</th> {/* Column header with sorting indicator */}
                        <th onClick={() => handleSort('website')}>Website {sortColumn === 'website' && (sortOrder === 'asc' ? '▲' : '▼')}</th> {/* Column header with sorting indicator */}
                        <th onClick={() => handleSort('country')}>Country {sortColumn === 'country' && (sortOrder === 'asc' ? '▲' : '▼')}</th> {/* Column header with sorting indicator */}
                        <th onClick={() => handleSort('sectors')}>Sectors {sortColumn === 'sectors' && (sortOrder === 'asc' ? '▲' : '▼')}</th> {/* Column header with sorting indicator */}
                        <th onClick={() => handleSort('subSectors')}>Sub-Sectors {sortColumn === 'subSectors' && (sortOrder === 'asc' ? '▲' : '▼')}</th> {/* Column header with sorting indicator */}
                        <th onClick={() => handleSort('generalComment')}>General Comment {sortColumn === 'generalComment' && (sortOrder === 'asc' ? '▲' : '▼')}</th> {/* Column header with sorting indicator */}
                        <th>Actions</th> {/* Column header for action buttons */}
                    </tr>
                </thead>
                <tbody>
                    {sortedCompanies.map(ele => (
                        <tr key={ele._id}> {/* Row for each company */}
                            <td>{ele.companyName}</td> {/* Display company name */}
                            <td>{ele.parentName}</td> {/* Display parent name */}
                            <td>{ele.website}</td> {/* Display website */}
                            <td>{getCountryName(ele.country, countries.data)}</td> {/* Display country name */}
                            <td>{getSectorNames(ele.sectors, sectors.data)}</td> {/* Display sector names */}
                            <td>{getSubSectorNames(ele.subSectors, subSectors.data)}</td> {/* Display sub-sector names */}
                            <td>{ele.generalComment || 'N/A'}</td> {/* Display general comment or 'N/A' if not available */}
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(ele._id)}>Edit</button> {/* Button to edit company */}
                                <button className="remove-btn" onClick={() => handleRemove(ele._id)}>Remove</button> {/* Button to remove company */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
}
