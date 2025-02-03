import { useContext } from 'react';
import SectorContext from '../../context/SectorContext';
import axios from '../../config/axios';

export default function SectorList() {
    const { sectors, sectorsDispatch, handleEditClick } = useContext(SectorContext);

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this sector?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/sectors/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                sectorsDispatch({ type: 'REMOVE_SECTOR', payload: response.data._id });
            } catch (err) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="sector-list-container">
            <table className="sector-table">
                <thead>
                    <tr>
                        <th>Sector Name</th>
                        <th>Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sectors.data.map((sector) => (
                        <tr key={sector._id}>
                            <td>{sector.sectorName}</td>
                            <td>{sector.generalComment}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(sector._id)}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(sector._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
