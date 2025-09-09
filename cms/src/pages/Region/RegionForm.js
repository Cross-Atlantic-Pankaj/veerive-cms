import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import RegionContext from '../../context/RegionContext';

export default function RegionForm() {
    const { regions, regionsDispatch, handleFormSubmit, setIsFormVisible, isFormVisible } = useContext(RegionContext);

    const [regionName, setRegionName] = useState('');
    const [generalComment, setGeneralComment] = useState('');

    useEffect(() => {
        if (regions.editId) {
            const region = regions.data.find((ele) => ele._id === regions.editId);
            setRegionName(region.regionName);
            setGeneralComment(region.generalComment);
        } else {
            setRegionName('');
            setGeneralComment('');
        }
    }, [regions.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            regionName,
            generalComment,
        };
        if (regions.editId) {
            try {
                const response = await axios.put(`/api/admin/regions/${regions.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                regionsDispatch({ type: 'UPDATE_REGION', payload: response.data });
                handleFormSubmit('Region updated successfully');
            } catch (err) {
                console.log(err.message);
            }
        } else {
            try {
                const response = await axios.post('/api/admin/regions', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                regionsDispatch({ type: 'ADD_REGION', payload: response.data });
                handleFormSubmit('Region added successfully');
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
        <div className="region-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Region Home</button>
            <form onSubmit={handleSubmit} className="region-form">
                <h2>{regions.editId ? 'Edit Region' : 'Add Region'}</h2>
                <label htmlFor="regionName">Region Name <span style={{color: 'red'}}>*</span></label>
                <input id="enterregionname" name="enterregionname"
                    type="text"
                    placeholder="Enter region name"
                    name="regionName"
                    value={regionName}
                    onChange={(e) => setRegionName(e.target.value)}
                    className="region-input"
                    required
                />
                <textarea id="entercomment" name="entercomment"
                    placeholder="Enter comment"
                    name="generalComment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    className="region-textarea"
                />
                <button type="submit" className="region-submit-btn">
                    {regions.editId ? 'Update Region' : 'Add Region'}
                </button>
            </form>
        </div>
    );
}
