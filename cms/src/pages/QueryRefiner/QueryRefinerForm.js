import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import '../../html/css/Company.css';

export default function QueryRefinerForm() {
  const [title, setTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [promptGuidance, setPromptGuidance] = useState('');
  const [sector, setSector] = useState('');
  const [subSector, setSubSector] = useState('');
  const navigate = useNavigate();
  const { sectors } = useContext(SectorContext);
  const { subSectors } = useContext(SubSectorContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/admin/query-refiner', {
      title,
      moduleDescription,
      promptGuidance,
      sector,
      subSector
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    navigate('/query-refiner');
  };

  return (
    <div className="company-form-container">
      <h2>Add Query Refiner</h2>
      <form onSubmit={handleSubmit} className="company-form">
        <label>Title</label>
        <input className="company-input" value={title} onChange={e => setTitle(e.target.value)} required />
        <label>Module Description</label>
        <textarea className="company-textarea" value={moduleDescription} onChange={e => setModuleDescription(e.target.value)} required />
        <label>Prompt Guidance</label>
        <textarea className="company-textarea" value={promptGuidance} onChange={e => setPromptGuidance(e.target.value)} required />
        <label>Sector</label>
        <select className="company-select" value={sector} onChange={e => setSector(e.target.value)} required>
          <option value="">Select Sector</option>
          {sectors.data && sectors.data.map(sec => (
            <option key={sec._id} value={sec._id}>{sec.sectorName}</option>
          ))}
        </select>
        <label>Sub-Sector</label>
        <select className="company-select" value={subSector} onChange={e => setSubSector(e.target.value)} required>
          <option value="">Select Sub-Sector</option>
          {subSectors.data && subSectors.data.filter(ss => ss.sectorId === sector).map(ss => (
            <option key={ss._id} value={ss._id}>{ss.subSectorName}</option>
          ))}
        </select>
        <button className="company-submit-btn" type="submit">Add</button>
      </form>
    </div>
  );
} 