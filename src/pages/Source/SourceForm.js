import React, { useContext, useState, useEffect } from 'react';
import SourceContext from '../../context/SourceContext';
import axios from '../../config/axios';
import '../../html/css/Source.css'; // Ensure this CSS file is created

export default function SourceForm() {
    const { sources, sourcesDispatch, handleFormSubmit, setIsFormVisible, isFormVisible } = useContext(SourceContext);
 
const [sourceName, setSourceName] = useState('');
const [sourceType, setSourceType] = useState('');
const [generalComment, setGeneralComment] = useState('');

      useEffect(() => {
        if (sources.editId) {
            const source = sources.data.find((ele) => ele._id === sources.editId);
            setSourceName(source.sourceName);
            setSourceType(source.sourceType);
            setGeneralComment(source.generalComment);
        } else {
            setSourceName('');
            setSourceType('');
            setGeneralComment('');
        }
    }, [sources.editId]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            sourceName,
            sourceType,
            generalComment,
        };
                   if (sources.editId) {
            try {
                const response = await axios.put(`/api/admin/sources/${sources.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                sourcesDispatch({ type: 'UPDATE_SOURCE', payload: response.data });
                handleFormSubmit('Source updated successfully');
            } catch (err) {
                console.log(err.message);
            }
        } else {
            try {
                const response = await axios.post('/api/admin/sources', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                sourcesDispatch({ type: 'ADD_SOURCE', payload: response.data });
                handleFormSubmit('Source added successfully');
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleHomeNav = () =>{
        setIsFormVisible(false)
        console.log('form vis', isFormVisible)
    }

    return (
        <div className="source-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Source Home</button>
            <form onSubmit={handleSubmit} className="source-form">
                <input
                    type="text"
                    name="sourceName"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="Source Name"
                    className="source-input"
                    required
                />
                <select
                    name="sourceType"
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="source-select"
                    required
                >
                    <option value="">Select Source Type</option>
                    <option value="News Site">News Site</option>
                    <option value="Social Media Post">Social Media Post</option>
                    <option value="Professional Services Firm">Professional Services Firm</option>
                    <option value="Other">Other</option>
                </select>
                <textarea
                    name="generalComment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    placeholder="General Comment"
                    className="source-textarea"
                />
                <button type="submit" className="source-submit-btn">Submit</button>
            </form>
        </div>
    );
}
