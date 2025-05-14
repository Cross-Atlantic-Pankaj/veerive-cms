import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import '../../html/css/Company.css';
import { SectorContext } from '../../context/SectorContext';
import { SubSectorContext } from '../../context/SubSectorContext';

export default function ClarificationGuidanceList() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/admin/clarification-guidance', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="company-list-container">
      <h2>Clarification Guidance</h2>
      <button className="add-company-btn" onClick={() => navigate('/clarification-guidance/add')}>Add</button>
      <table className="company-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Clarification Note</th>
            <th>Sector</th>
            <th>Sub-Sector</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id}>
              <td>{item.title}</td>
              <td>{item.clarificationNote}</td>
              <td>{item.sector?.sectorName || ''}</td>
              <td>{item.subSector?.subSectorName || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 