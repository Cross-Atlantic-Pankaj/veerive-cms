import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import CountryContext from '../../context/CountryContext';
import RegionContext from '../../context/RegionContext';
import { toast } from 'react-toastify';

export default function CountryForm() {
    const { countries, countriesDispatch, handleFormSubmit, setIsFormVisible, isFormVisible } = useContext(CountryContext);
    const { regions } = useContext(RegionContext);
    const [isLoading, setIsLoading] = useState(false);

    const [countryName, setCountryName] = useState('');
    const [regionId, setRegionId] = useState('');
    const [generalComment, setGeneralComment] = useState('');

    // Fetch country data when editId changes
    useEffect(() => {
        const fetchCountryData = async () => {
            if (!countries.editId) {
                // Clear form if not in edit mode
                setCountryName('');
                setRegionId('');
                setGeneralComment('');
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(`/api/admin/countries/${countries.editId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                
                if (response.data.success) {
                    const country = response.data.country;
                    setCountryName(country.countryName || '');
                    setRegionId(country.regionId || '');
                    setGeneralComment(country.generalComment || '');
                }
            } catch (err) {
                console.error('Error fetching country:', err);
                toast.error('Failed to load country data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCountryData();
    }, [countries.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = {
            countryName,
            regionId,
            generalComment,
        };

        try {
            if (countries.editId) {
                const response = await axios.put(
                    `/api/admin/countries/${countries.editId}`, 
                    formData, 
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                countriesDispatch({ type: 'UPDATE_COUNTRY', payload: response.data });
                toast.success('Country updated successfully');
            } else {
                const response = await axios.post(
                    '/api/admin/countries', 
                    formData, 
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                countriesDispatch({ type: 'ADD_COUNTRY', payload: response.data });
                toast.success('Country added successfully');
            }
            handleFormSubmit('Operation completed successfully');
        } catch (err) {
            console.error('Error submitting form:', err);
            toast.error(err.response?.data?.error || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleHomeNav = () => {
        setIsFormVisible(false);
    };

    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="country-form-container">
            <button 
                type="button" 
                className="submit-btn" 
                onClick={handleHomeNav}
                disabled={isLoading}
            >
                Country Home
            </button>
            <form onSubmit={handleSubmit} className="country-form">
                <h2>{countries.editId ? 'Edit Country' : 'Add Country'}</h2>
                <label htmlFor="countryName">Country Name <span style={{color: 'red'}}>*</span></label>
                <input
                    type="text"
                    placeholder="Enter country name"
                    name="countryName"
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    className="country-input"
                    disabled={isLoading}
                    required
                />
                <label htmlFor="regionId">Region <span style={{color: 'red'}}>*</span></label>
                <select
                    name="regionId"
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    className="country-select"
                    disabled={isLoading}
                    required
                >
                    <option value="">Select Region</option>
                    {regions.data?.map(region => (
                        <option key={region._id} value={region._id}>
                            {region.regionName}
                        </option>
                    ))}
                </select>
                <textarea
                    placeholder="Enter comment"
                    name="generalComment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    className="country-textarea"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    className="country-submit-btn"
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : (countries.editId ? 'Update Country' : 'Add Country')}
                </button>
            </form>
        </div>
    );
}
