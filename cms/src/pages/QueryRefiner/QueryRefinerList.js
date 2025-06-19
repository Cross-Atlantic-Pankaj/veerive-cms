import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import CSVUploader from '../../components/CSVUploader';
import '../../html/css/Company.css';

const QueryRefinerList = () => {
    const [refiners, setRefiners] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRefiners();
    }, []);

    const fetchRefiners = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/query-refiner', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRefiners(response.data.data || []);
        } catch (error) {
            console.error('Error fetching query refiners:', error);
            toast.error('Failed to fetch query refiners');
            setRefiners([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        fetchRefiners();
        toast.success('Data uploaded successfully!');
    };

    return (
        <div className="app-container">
            <div className="content-container">
                <div className="page-header">
                    <h2>Query Refiner List</h2>
                    <div className="header-actions">
                        <CSVUploader
                            endpoint="/api/admin/query-refiner/bulk"
                            onUploadSuccess={handleUploadSuccess}
                            requiredFields={['title', 'moduleDescription', 'promptGuidance', 'sectorName', 'subSectorName']}
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
                            className="primary-button"
                            onClick={() => navigate('/query-refiner/add')}
                        >
                            Add New
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading query refiners...</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Module Description</th>
                                    <th>Prompt Guidance</th>
                                    <th>Sector</th>
                                    <th>Sub Sector</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {refiners.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="empty-message">
                                            No query refiners found
                                        </td>
                                    </tr>
                                ) : (
                                    refiners.map((refiner) => (
                                        <tr key={refiner._id}>
                                            <td>{refiner.title}</td>
                                            <td>{refiner.moduleDescription}</td>
                                            <td>{refiner.promptGuidance}</td>
                                            <td>{refiner.sector?.name}</td>
                                            <td>{refiner.subSector?.name}</td>
                                            <td>
                                                <button
                                                    className="action-button"
                                                    onClick={() => navigate(`/query-refiner/edit/${refiner._id}`)}
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

export default QueryRefinerList; 