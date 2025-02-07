import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';

export default function SectorForm({ handleFormSubmit }) {
    const { sectors, sectorsDispatch, setIsFormVisible, isFormVisible } = useContext(SectorContext);

    const [sectorName, setSectorName] = useState('');
    const [generalComment, setGeneralComment] = useState('');

    useEffect(() => {
        if (sectors.editId) {
            const sector = sectors.data.find((ele) => ele._id === sectors.editId);
            setSectorName(sector.sectorName);
            setGeneralComment(sector.generalComment);
        } else {
            setSectorName('');
            setGeneralComment('');
        }
    }, [sectors.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            sectorName,
            generalComment,
        };
        if (sectors.editId) {
            try {
                const response = await axios.put(`/api/admin/sectors/${sectors.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                sectorsDispatch({ type: 'UPDATE_SECTOR', payload: response.data });
                handleFormSubmit('Sector updated successfully');
            } catch (err) {
                console.log(err.message);
            }
        } else {
            try {
                const response = await axios.post('/api/admin/sectors', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                sectorsDispatch({ type: 'ADD_SECTOR', payload: response.data });
                handleFormSubmit('Sector added successfully');
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
        <div className="sector-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Sector Home</button>
            <form onSubmit={handleSubmit} className="sector-form">
                <h2>{sectors.editId ? 'Edit Sector' : 'Add Sector'}</h2>
                <input
                    type="text"
                    placeholder="Enter sector name"
                    name="sectorName"
                    value={sectorName}
                    onChange={(e) => setSectorName(e.target.value)}
                    className="sector-input"
                />
                <textarea
                    placeholder="Enter comment"
                    name="generalComment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    className="sector-textarea"
                />
                <button type="submit" className="sector-submit-btn">
                    {sectors.editId ? 'Update Sector' : 'Add Sector'}
                </button>
            </form>
        </div>
    );
}
