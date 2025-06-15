import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import SubSectorContext from '../../context/SubSectorContext';
import SectorContext from '../../context/SectorContext';

export default function SubSectorForm({ handleFormSubmit }) {
    const { subSectors, subSectorsDispatch, setIsFormVisible, isFormVisible } = useContext(SubSectorContext);
    const { sectors } = useContext(SectorContext);

    const [subSectorName, setSubSectorName] = useState('');
    const [sectorId, setSectorId] = useState('');
    const [generalComment, setGeneralComment] = useState('');

    useEffect(() => {
        if (subSectors.editId) {
            const subSector = subSectors.data.find((ele) => ele._id === subSectors.editId);
            setSubSectorName(subSector.subSectorName);
            setSectorId(subSector.sectorId);
            setGeneralComment(subSector.generalComment);
        } else {
            setSubSectorName('');
            setSectorId('');
            setGeneralComment('');
        }
    }, [subSectors.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            subSectorName,
            sectorId,
            generalComment,
        };
        if (subSectors.editId) {
            try {
                const response = await axios.put(`/api/admin/sub-sectors/${subSectors.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                subSectorsDispatch({ type: 'UPDATE_SUB_SECTOR', payload: response.data });
                handleFormSubmit('Sub-Sector updated successfully');
            } catch (err) {
                console.log(err.message);
            }
        } else {
            try {
                const response = await axios.post('/api/admin/sub-sectors', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                subSectorsDispatch({ type: 'ADD_SUB_SECTOR', payload: response.data });
                handleFormSubmit('Sub-Sector added successfully');
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
        <div className="sub-sector-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Sub-Sector Home</button>
            <form onSubmit={handleSubmit} className="sub-sector-form">
                <h2>{subSectors.editId ? 'Edit Sub-Sector' : 'Add Sub-Sector'}</h2>
                <label htmlFor="subSectorName">Sub-Sector Name <span style={{color: 'red'}}>*</span></label>
                <input
                    type="text"
                    placeholder="Enter sub-sector name"
                    name="subSectorName"
                    value={subSectorName}
                    onChange={(e) => setSubSectorName(e.target.value)}
                    className="sub-sector-input"
                    required
                />
                <label htmlFor="sectorId">Sector <span style={{color: 'red'}}>*</span></label>
                <select
                    name="sectorId"
                    value={sectorId}
                    onChange={(e) => setSectorId(e.target.value)}
                    className="sub-sector-select"
                    required
                >
                    <option value="">Select Sector</option>
                    {sectors.data.map((sector) => (
                        <option key={sector._id} value={sector._id}>
                            {sector.sectorName}
                        </option>
                    ))}
                </select>
                <textarea
                    placeholder="Enter comment"
                    name="generalComment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    className="sub-sector-textarea"
                />
                <button type="submit" className="sub-sector-submit-btn">
                    {subSectors.editId ? 'Update Sub-Sector' : 'Add Sub-Sector'}
                </button>
            </form>
        </div>
    );
}
