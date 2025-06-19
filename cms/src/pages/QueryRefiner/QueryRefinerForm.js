import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import { toast } from 'react-toastify';
import '../../html/css/QueryRefiner.css';

export default function QueryRefinerForm() {
  const [title, setTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [promptGuidance, setPromptGuidance] = useState('');
  const [sector, setSector] = useState('');
  const [subSector, setSubSector] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { sectors } = useContext(SectorContext);
  const { subSectors } = useContext(SubSectorContext);

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
      await axios.post('/api/admin/query-refiner', {
        title,
        moduleDescription,
        promptGuidance,
        sector,
        subSector
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Query refiner added successfully!');
      navigate('/query-refiner');
    } catch (error) {
      console.error('Error adding query refiner:', error);
      toast.error('Failed to add query refiner');
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
          <h2>Add Query Refiner</h2>
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
              <label>Module Description <span style={{color: 'red'}}>*</span></label>
              <textarea 
                className="company-textarea" 
                value={moduleDescription} 
                onChange={e => setModuleDescription(e.target.value)} 
                required 
                placeholder="Enter module description"
              />
            </div>
            
            <div>
              <label>Prompt Guidance <span style={{color: 'red'}}>*</span></label>
              <textarea 
                className="company-textarea" 
                value={promptGuidance} 
                onChange={e => setPromptGuidance(e.target.value)} 
                required 
                placeholder="Enter prompt guidance"
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
            
            <button 
              className="company-submit-btn" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Query Refiner'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 