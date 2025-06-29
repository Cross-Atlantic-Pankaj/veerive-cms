import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import styles from '../../html/css/Sector.module.css';

export default function SectorForm({ handleFormSubmit }) {
    const { sectors, sectorsDispatch, setIsFormVisible, isFormVisible } = useContext(SectorContext);
    const navigate = useNavigate();

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

    const handleHomeNav = () => {
        setIsFormVisible(false);
        console.log('form vis', isFormVisible);
    };

    const handleBackToList = () => {
        setIsFormVisible(false);
        navigate('/sectors');
    };

    return (
        <div className={styles.companyFormContainer}>
            <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={handleBackToList}>
                ← Back to Sectors
            </button>
            <div className={styles.companyFormContainer}>
                <h2>{sectors.editId ? 'Edit Sector' : 'Add Sector'}</h2>
                <form onSubmit={handleSubmit} className={styles.companyForm}>
                    <div>
                        <label>Sector Name <span style={{color: 'red'}}>*</span></label>
                        <input
                            type="text"
                            placeholder="Enter sector name"
                            value={sectorName}
                            onChange={(e) => setSectorName(e.target.value)}
                            className={styles.companyInput}
                            required
                        />
                    </div>
                    
                    <div>
                        <label>General Comment</label>
                        <textarea
                            placeholder="Enter comment"
                            value={generalComment}
                            onChange={(e) => setGeneralComment(e.target.value)}
                            className={styles.companyTextarea}
                        />
                    </div>
                    
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.companySubmitBtn}>
                            {sectors.editId ? 'Update Sector' : 'Add Sector'}
                        </button>
                        <button type="button" onClick={handleHomeNav} className={styles.cancelBtn}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
