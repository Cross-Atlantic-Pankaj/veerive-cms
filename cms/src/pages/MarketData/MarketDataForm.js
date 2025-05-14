import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import SourceContext from '../../context/SourceContext';
import '../../html/css/Company.css';

export default function MarketDataForm() {
  const [title, setTitle] = useState('');
  const [dataDescription, setDataDescription] = useState('');
  const [sector, setSector] = useState('');
  const [subSector, setSubSector] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [url, setUrl] = useState('');
  const [csvUpload, setCsvUpload] = useState('');
  const navigate = useNavigate();
  const { sectors } = useContext(SectorContext);
  const { subSectors } = useContext(SubSectorContext);
  const { sources } = useContext(SourceContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/admin/market-data', {
      title,
      dataDescription,
      sector,
      subSector,
      sourceName,
      url,
      csvUpload
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    navigate('/market-data');
  };

  return (
    <div className="company-form-container">
      <h2>Add Market Data</h2>
      <form onSubmit={handleSubmit} className="company-form">
        <label>Title</label>
        <input className="company-input" value={title} onChange={e => setTitle(e.target.value)} required />
        <label>Data Description</label>
        <textarea className="company-textarea" value={dataDescription} onChange={e => setDataDescription(e.target.value)} required />
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
        <label>Source Name</label>
        <select
          className="company-select"
          value={sourceName}
          onChange={e => setSourceName(e.target.value)}
          required
        >
          <option value="">Select Source</option>
          {sources.data && sources.data.map(src => (
            <option key={src._id} value={src.sourceName}>{src.sourceName}</option>
          ))}
        </select>
        <label>URL</label>
        <input className="company-input" value={url} onChange={e => setUrl(e.target.value)} required />
        <label>CSV Upload (URL or file path)</label>
        <input className="company-input" value={csvUpload} onChange={e => setCsvUpload(e.target.value)} />
        <button className="company-submit-btn" type="submit">Add</button>
      </form>
    </div>
  );
} 