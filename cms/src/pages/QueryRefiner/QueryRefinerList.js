import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import '../../html/css/Company.css';

export default function QueryRefinerList() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/admin/query-refiner', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="company-list-container">
      <h2>Query Refiner</h2>
      <button className="add-company-btn" onClick={() => navigate('/query-refiner/add')}>Add</button>
      <table className="company-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Module Description</th>
            <th>Prompt Guidance</th>
            <th>Sector</th>
            <th>Sub-Sector</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id}>
              <td>{item.title}</td>
              <td>{item.moduleDescription}</td>
              <td>{item.promptGuidance}</td>
              <td>{item.sector?.sectorName || ''}</td>
              <td>{item.subSector?.subSectorName || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 