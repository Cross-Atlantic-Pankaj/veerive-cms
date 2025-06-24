import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import SourceContext from '../../context/SourceContext';
import { toast } from 'react-toastify';
import '../../html/css/MarketData.css';

export default function MarketDataForm() {
  const [title, setTitle] = useState('');
  const [dataDescription, setDataDescription] = useState('');
  const [sector, setSector] = useState('');
  const [subSector, setSubSector] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [csvUpload, setCsvUpload] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { sectors } = useContext(SectorContext);
  const { subSectors } = useContext(SubSectorContext);
  const { sources } = useContext(SourceContext);

  useEffect(() => {
    console.log('Sectors data:', sectors);
  }, [sectors]);

  // Reset sub-sector when sector changes
  useEffect(() => {
    setSubSector('');
  }, [sector]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/admin/market-data', {
        title,
        dataDescription,
        sector,
        subSector,
        sourceName,
        csvUpload
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Market data added successfully!');
      navigate('/market-data');
    } catch (error) {
      console.error('Error adding market data:', error);
      toast.error('Failed to add market data');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubSectors = subSectors?.data?.filter(ss => ss.sectorId === sector) || [];

  // Check if sectors data exists and has items
  const sectorOptions = sectors?.data || [];
  console.log('Available sector options:', sectorOptions);

  return (
    <div className="app-container">
      <div className="content-container">
        <div className="company-form-container">
          <h2>Add Market Data</h2>
          <form onSubmit={handleSubmit} className="company-form">
            <div>
              <label>Title <span style={{color: 'red'}}>*</span></label>
              <input 
                className="company-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                placeholder="Enter title"
              />
            </div>
            
            <div>
              <label>Data Description <span style={{color: 'red'}}>*</span></label>
              <textarea 
                className="company-textarea" 
                value={dataDescription} 
                onChange={e => setDataDescription(e.target.value)} 
                required 
                placeholder="Enter data description"
              />
            </div>
            
            <div>
              <label>Sector <span style={{color: 'red'}}>*</span></label>
              <select 
                className="company-select" 
                value={sector} 
                onChange={e => setSector(e.target.value)} 
                required
              >
                <option value="">Select Sector</option>
                {sectorOptions.length > 0 ? (
                  sectorOptions.map(sec => (
                    <option key={sec._id} value={sec._id}>
                      {sec.name || sec.sectorName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading sectors...</option>
                )}
              </select>
            </div>
            
            <div>
              <label>Sub-Sector <span style={{color: 'red'}}>*</span></label>
              <select 
                className="company-select" 
                value={subSector} 
                onChange={e => setSubSector(e.target.value)} 
                required
                disabled={!sector}
              >
                <option value="">Select Sub-Sector</option>
                {filteredSubSectors.map(ss => (
                  <option key={ss._id} value={ss._id}>{ss.name || ss.subSectorName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label>Source Name <span style={{color: 'red'}}>*</span></label>
              <select
                className="company-select"
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                required
              >
                <option value="">Select Source</option>
                {sources?.data?.map(src => (
                  <option key={src._id} value={src.sourceName}>{src.sourceName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label>CSV Upload (URL or file path)</label>
              <input 
                className="company-input" 
                value={csvUpload} 
                onChange={e => setCsvUpload(e.target.value)} 
                placeholder="Enter CSV upload URL or file path (optional)"
              />
            </div>
            
            <button 
              className="company-submit-btn" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Market Data'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 