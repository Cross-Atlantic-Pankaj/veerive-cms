// pages/SubSignal/SubSignalForm.js
import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import SubSignalContext from '../../context/SubSignalContext';

export default function SubSignalForm({ handleFormSubmit }) {
    const { subSignals, subSignalsDispatch, handleAddClick, setIsFormVisible, isFormVisible } = useContext(SubSignalContext);

    const [subSignalName, setSubSignalName] = useState('');
    const [signalId, setSignalId] = useState('');
    const [generalComment, setGeneralComment] = useState('');
    const [signals, setSignals] = useState([]);

    useEffect(() => {
        if (subSignals.editId) {
            const subSignal = subSignals.data.find((ele) => ele._id === subSignals.editId);
            setSubSignalName(subSignal.subSignalName);
            setSignalId(subSignal.signalId);
            setGeneralComment(subSignal.generalComment);
        } else {
            setSubSignalName('');
            setSignalId('');
            setGeneralComment('');
        }
    }, [subSignals.editId]);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get('/api/admin/signals', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                setSignals(response.data);
            } catch (err) {
                console.log(err);
            }
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = { subSignalName, signalId, generalComment };
        if (subSignals.editId) {
            try {
                const response = await axios.put(`/api/admin/sub-signals/${subSignals.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                subSignalsDispatch({ type: 'UPDATE_SUBSIGNAL', payload: response.data });
                handleFormSubmit('SubSignal updated successfully');
            } catch (err) {
                console.log(err.message);
            }
        } else {
            try {
                const response = await axios.post('/api/admin/sub-signals', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                subSignalsDispatch({ type: 'ADD_SUBSIGNAL', payload: response.data });
                handleFormSubmit('SubSignal added successfully');
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
        <div className="subsignal-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Sub-Signal Home</button>
            <form onSubmit={handleSubmit} className="subsignal-form">
                <h2>{subSignals.editId ? 'Edit SubSignal' : 'Add SubSignal'}</h2>
                <input
                    type="text"
                    placeholder="Enter sub-signal name"
                    name="subSignalName"
                    value={subSignalName}
                    onChange={(e) => setSubSignalName(e.target.value)}
                    className="subsignal-input"
                />
                <select
                    name="signalId"
                    value={signalId}
                    onChange={(e) => setSignalId(e.target.value)}
                    className="subsignal-select"
                >
                    <option value="">Select Signal</option>
                    {signals.map((signal) => (
                        <option key={signal._id} value={signal._id}>
                            {signal.signalName}
                        </option>
                    ))}
                </select>
                <textarea
                    placeholder="Enter comment"
                    name="generalComment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    className="subsignal-textarea"
                />
                <button type="submit" className="subsignal-submit-btn">
                    {subSignals.editId ? 'Update SubSignal' : 'Add SubSignal'}
                </button>
            </form>
        </div>
    );
}
