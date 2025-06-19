import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import CSVUploader from '../../components/CSVUploader';
import '../../html/css/Company.css';

const ClarificationGuidanceList = () => {
    const [guidances, setGuidances] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGuidances();
    }, []);

    const fetchGuidances = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/clarification-guidance', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setGuidances(response.data.data || []);
        } catch (error) {
            console.error('Error fetching guidances:', error);
            toast.error('Failed to fetch clarification guidances');
            setGuidances([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        fetchGuidances();
        toast.success('Data uploaded successfully!');
    };

    return (
        <div className="main-container">
            <div className="company-list-container">
                <div className="header-section">
                    <h2>Clarification Guidance List</h2>
                    <div className="action-buttons">
                        <CSVUploader
                            endpoint="/api/admin/clarification-guidance/bulk"
                            onUploadSuccess={handleUploadSuccess}
                            requiredFields={['title', 'clarificationNote', 'sectorName', 'subSectorName']}
                            lookupFields={{
                                sectorName: { collection: 'sectors', key: 'name', value: '_id' },
                                subSectorName: { collection: 'sub-sectors', key: 'name', value: '_id' }
                            }}
                            fieldMappings={{
                                sectorName: 'sector',
                                subSectorName: 'subSector'
                            }}
                        />
                        <button 
                            className="add-company-btn" 
                            onClick={() => navigate('/clarification-guidance/add')}
                        >
                            Add New
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading clarification guidances...</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="company-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Clarification Note</th>
                                    <th>Sector</th>
                                    <th>Sub Sector</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guidances.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            No clarification guidances found
                                        </td>
                                    </tr>
                                ) : (
                                    guidances.map((guidance) => (
                                        <tr key={guidance._id}>
                                            <td>{guidance.title}</td>
                                            <td>{guidance.clarificationNote}</td>
                                            <td>{guidance.sector?.name}</td>
                                            <td>{guidance.subSector?.name}</td>
                                            <td>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => navigate(`/clarification-guidance/edit/${guidance._id}`)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClarificationGuidanceList; 