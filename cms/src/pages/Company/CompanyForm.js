import React, { useContext, useState, useEffect } from 'react'; // Importing necessary React hooks and components
import CompanyContext from '../../context/CompanyContext'; // Importing CompanyContext to use context state and actions
import axios from '../../config/axios'; // Importing axios instance for making HTTP requests
import '../../html/css/Company.css'; // Importing CSS file for styling the component

export default function CompanyForm() {
    // Destructuring context values and functions from CompanyContext
    const { companies, companiesDispatch, handleFormSubmit, countries, sectors: sectorsData, subSectors: subSectorsData, setIsFormVisible, isFormVisible } = useContext(CompanyContext);

    // State hooks for managing form data and other states
    const [companyName, setCompanyName] = useState(''); // State for company name
    const [parentName, setParentName] = useState(''); // State for parent company name
    const [website, setWebsite] = useState(''); // State for company website
    const [country, setCountry] = useState(''); // State for selected country
    const [selectedSectors, setSelectedSectors] = useState([]); // State for selected sector IDs
    const [selectedSubSectors, setSelectedSubSectors] = useState([]); // State for selected sub-sector IDs
    const [generalComment, setGeneralComment] = useState(''); // State for general comment
    const [filteredSubSectors, setFilteredSubSectors] = useState([]); // State for filtered sub-sectors based on selected sectors

    useEffect(() => {
        // Effect runs when component mounts or dependencies change
        if (companies.editId) {
            // If there's an editId, find the company to edit
            const company = companies.data.find((ele) => ele._id === companies.editId);
            if (company) {
                // Populate form fields with company data
                setCompanyName(company.companyName);
                setParentName(company.parentName);
                setWebsite(company.website);
                setCountry(company.country);
                setSelectedSectors(company.sectors || []);
                setSelectedSubSectors(company.subSectors || []);
                setGeneralComment(company.generalComment);
    
                // Filter sub-sectors based on selected sectors for edit
                if (subSectorsData.data && company.sectors) {
                    const filtered = subSectorsData.data.filter(subSector => company.sectors.includes(subSector.sectorId));
                    setFilteredSubSectors(filtered);
                }
            }
        } else {
            // Clear fields if no editId (creating a new company)
            setCompanyName('');
            setParentName('');
            setWebsite('');
            setCountry('');
            setSelectedSectors([]);
            setSelectedSubSectors([]);
            setGeneralComment('');
            setFilteredSubSectors([]);
        }
    }, [companies.editId, companies.data, subSectorsData.data]); // Dependencies for effect

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents default form submission
        // Creates a form data object to send to the server
        const formData = {
            companyName,
            parentName,
            website,
            country,
            sectors: selectedSectors, // Array of sector IDs
            subSectors: selectedSubSectors, // Array of sub-sector IDs
            generalComment
        };
    
        try {
            if (companies.editId) {
                // If editing an existing company, send a PUT request
                const response = await axios.put(`/api/admin/companies/${companies.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                companiesDispatch({ type: 'UPDATE_COMPANY', payload: response.data }); // Dispatch update action
                handleFormSubmit('Company updated successfully'); // Notify success
            } else {
                // If creating a new company, send a POST request
                const response = await axios.post('/api/admin/companies', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                console.log('adding comp', response); // Log response for debugging
                companiesDispatch({ type: 'ADD_COMPANY', payload: response.data }); // Dispatch add action
                handleFormSubmit('Company added successfully'); // Notify success
            }
        } catch (err) {
            console.error('Error submitting form:', err); // Log error
            alert('An error occurred while submitting the form.'); // Notify user of error
        }
    };

    const handleSectorChange = (e) => {
        // Handles sector selection changes
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value); // Get selected sector IDs
        setSelectedSectors(selectedOptions);
    
        // Filter sub-sectors based on selected sectors
        if (subSectorsData.data) {
            const filtered = subSectorsData.data.filter(subSector => selectedOptions.includes(subSector.sectorId));
            setFilteredSubSectors(filtered);
        }
    };
    
    const handleSubSectorChange = (e) => {
        // Handles sub-sector selection changes
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value); // Get selected sub-sector IDs
        setSelectedSubSectors(selectedOptions);
    };
    
    console.log('filtered subsec', filteredSubSectors); // Log filtered sub-sectors for debugging
    console.log('sele sub sec', selectedSubSectors); // Log selected sub-sectors for debugging
    
    const handleHomeNav = () => {
        // Hides the form when navigating back to home
        setIsFormVisible(false);
        console.log('form vis', isFormVisible); // Log form visibility status for debugging
    };

    return (
        <div className="company-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Company Home</button>
            {/* Button to navigate back to company home */}
            <form onSubmit={handleSubmit} className="company-form">
                <label htmlFor="companyName"><b>Company Name</b> <span style={{color: 'red'}}>*</span></label>
                <input
                    id="companyName"
                    type="text"
                    placeholder="Company Name"
                    name="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="company-input"
                    required
                />
                {/* Input field for company name */}
                <label htmlFor="parentName"><b>Parent Name</b></label>
                <input
                    id="parentName"
                    type="text"
                    placeholder="Parent Name"
                    name="parentName"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="company-input"
                />
                {/* Input field for parent company name */}
                <label htmlFor="website"><b>Company Website</b> <span style={{color: 'red'}}>*</span></label>
                <input
                    id="website"
                    type="text"
                    placeholder="Company Website"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="company-input"
                    required
                />
                {/* Input field for company website */}
                <label htmlFor="country"><b>Country</b> <span style={{color: 'red'}}>*</span></label>
                <select
                    id="country"
                    name="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="company-select"
                    required
                >
                    <option value=""><b>Select Country</b></option>
                    {/* Default option */}
                    {countries.data && countries.data.map(country => (
                        <option key={country._id} value={country._id}>{country.countryName}</option>
                    ))}
                    {/* Options for each country */}
                </select>
                <label htmlFor="sectors"><b>Sectors</b> <span style={{color: 'red'}}>*</span></label>
                <select
                    id="sectors"
                    name="sectors"
                    value={selectedSectors}
                    onChange={handleSectorChange}
                    className="company-select"
                    multiple
                    required
                >
                    {sectorsData.data && sectorsData.data.map(sector => (
                        <option key={sector._id} value={sector._id}>{sector.sectorName}</option>
                    ))}
                    {/* Options for each sector */}
                </select>
                <label htmlFor="subSectors"><b>Sub-Sectors</b></label>
                <select
                    id="subSectors"
                    name="subSectors"
                    value={selectedSubSectors}
                    onChange={handleSubSectorChange}
                    className="company-select"
                    multiple
                >
                    {filteredSubSectors.map(subSector => (
                        <option key={subSector._id} value={subSector._id}>{subSector.subSectorName}</option>
                    ))}
                    {/* Options for each filtered sub-sector */}
                </select>
                <label htmlFor="generalComment"><b>General Comment</b></label>
                <textarea
                    id="generalComment"
                    name="generalComment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    placeholder="General Comment"
                    className="company-textarea"
                />
                {/* Textarea for general comment */}
                <button type="submit" className="company-submit-btn">Submit</button>
                {/* Submit button for the form */}
            </form>
        </div>
    );
}
