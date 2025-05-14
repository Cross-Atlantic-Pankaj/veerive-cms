import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import '../../html/css/Company.css';

export default function MarketDataList() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/admin/market-data', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="company-list-container">
      <h2>Market Data</h2>
      <button className="add-company-btn" onClick={() => navigate('/market-data/add')}>Add</button>
      <table className="company-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Data Description</th>
            <th>Sector</th>
            <th>Sub-Sector</th>
            <th>Source Name</th>
            <th>URL</th>
            <th>CSV Upload</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id}>
              <td>{item.title}</td>
              <td>{item.dataDescription}</td>
              <td>{item.sector?.sectorName || ''}</td>
              <td>{item.subSector?.subSectorName || ''}</td>
              <td>{item.sourceName}</td>
              <td><a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a></td>
              <td>{item.csvUpload ? <a href={item.csvUpload} target="_blank" rel="noopener noreferrer">Download</a> : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 