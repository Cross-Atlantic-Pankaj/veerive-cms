import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import '../../html/css/Company.css';

export default function ClarificationGuidanceForm() {
  const [title, setTitle] = useState('');
  const [clarificationNote, setClarificationNote] = useState('');
  const [sector, setSector] = useState('');
  const [subSector, setSubSector] = useState('');
  const navigate = useNavigate();
  const { sectors } = useContext(SectorContext);
  const { subSectors } = useContext(SubSectorContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/admin/clarification-guidance', {
      title,
      clarificationNote,
      sector,
      subSector
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    navigate('/clarification-guidance');
  };

  return (
    <div className="company-form-container">
      <h2>Add Clarification Guidance</h2>
      <form onSubmit={handleSubmit} className="company-form">
        <label>Title</label>
        <input className="company-input" value={title} onChange={e => setTitle(e.target.value)} required />
        <label>Clarification Note</label>
        <textarea className="company-textarea" value={clarificationNote} onChange={e => setClarificationNote(e.target.value)} required />
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