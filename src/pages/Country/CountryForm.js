import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import CountryContext from '../../context/CountryContext';
import RegionContext from '../../context/RegionContext';

export default function CountryForm() {
    const { countries, countriesDispatch, handleFormSubmit, setIsFormVisible, isFormVisible } = useContext(CountryContext);
    const { regions } = useContext(RegionContext);

    const [countryName, setCountryName] = useState('');
    const [regionId, setRegionId] = useState('');
    const [generalComment, setGeneralComment] = useState('');

    useEffect(() => {
        if (countries.editId) {
            const country = countries.data.find((ele) => ele._id === countries.editId);
            setCountryName(country.countryName);
            setRegionId(country.regionId);
            setGeneralComment(country.generalComment);
        } else {
            setCountryName('');
            setRegionId('');
            setGeneralComment('');
        }
    }, [countries.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            countryName,
            regionId,
            generalComment,
        };
        if (countries.editId) {
            try {
                const response = await axios.put(`/api/admin/countries/${countries.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                countriesDispatch({ type: 'UPDATE_COUNTRY', payload: response.data });
                handleFormSubmit('Country updated successfully');
            } catch (err) {
                console.log(err.message);
            }
        } else {
            try {
                const response = await axios.post('/api/admin/countries', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                countriesDispatch({ type: 'ADD_COUNTRY', payload: response.data });
                handleFormSubmit('Country added successfully');
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleHomeNav = () =>{
        setIsFormVisible(false)
        console.log('form vis', isFormVisible)
    }

    return (
        <div className="country-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Country Home</button>
            <form onSubmit={handleSubmit} className="country-form">
                <h2>{countries.editId ? 'Edit Country' : 'Add Country'}</h2>
                <input
                    type="text"
                    placeholder="Enter country name"
                    name="countryName"
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    className="country-input"
                />
                <select
                    name="regionId"
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    className="country-select"
                >
                    <option value="">Select Region</option>
                    {regions.data.map(region => (
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
                />
                <button type="submit" className="country-submit-btn">
                    {countries.editId ? 'Update Country' : 'Add Country'}
                </button>
            </form>
        </div>
    );
}
