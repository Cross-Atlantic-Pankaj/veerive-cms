import { useContext } from 'react';
import RegionContext from '../../context/RegionContext';
import axios from '../../config/axios';

export default function RegionList() {
    const { regions, regionsDispatch, handleEditClick } = useContext(RegionContext);

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this region?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/regions/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                regionsDispatch({ type: 'REMOVE_REGION', payload: response.data._id });
            } catch (err) {
                alert(err.message);
            }
        }
    };
    if (!regions?.data) {
        return <p>Loading regions...</p>; // ✅ Show loading until regions are available
    }
    
    return (
        <div className="region-list-container">
            <table className="region-table">
                <thead>
                    <tr>
                        <th>Region Name</th>
                        <th>Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {regions.data.map((ele) => (
                        <tr key={ele._id}>
                            <td>{ele.regionName}</td>
                            <td>{ele.generalComment}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(ele._id)}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(ele._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
