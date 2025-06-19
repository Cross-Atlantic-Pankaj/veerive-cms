import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import CSVUploader from '../../components/CSVUploader';
import '../../html/css/Company.css';

const MarketDataList = () => {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMarketData();
    }, []);

    const fetchMarketData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/market-data', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMarketData(response.data.data || []);
        } catch (error) {
            console.error('Error fetching market data:', error);
            toast.error('Failed to fetch market data');
            setMarketData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        fetchMarketData();
        toast.success('Data uploaded successfully!');
    };

    return (
        <div className="app-container">
            <div className="content-container">
                <div className="page-header">
                    <h2>Market Data List</h2>
                    <div className="header-actions">
                        <CSVUploader
                            endpoint="/api/admin/market-data/bulk"
                            onUploadSuccess={handleUploadSuccess}
                            requiredFields={[
                                'title',
                                'dataDescription',
                                'sectorName',
                                'subSectorName',
                                'sourceName',
                                'url'
                            ]}
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
                            onClick={() => navigate('/market-data/add')}
                        >
                            Add New
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading market data...</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Sector</th>
                                    <th>Sub Sector</th>
                                    <th>Source</th>
                                    <th>URL</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marketData.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="empty-message">
                                            No market data found
                                        </td>
                                    </tr>
                                ) : (
                                    marketData.map((data) => (
                                        <tr key={data._id}>
                                            <td>{data.title}</td>
                                            <td>{data.dataDescription}</td>
                                            <td>{data.sector?.name}</td>
                                            <td>{data.subSector?.name}</td>
                                            <td>{data.sourceName}</td>
                                            <td>
                                                <a 
                                                    href={data.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="csv-template-link"
                                                >
                                                    View
                                                </a>
                                            </td>
                                            <td>
                                                <button
                                                    className="action-button"
                                                    onClick={() => navigate(`/market-data/edit/${data._id}`)}
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

export default MarketDataList; 