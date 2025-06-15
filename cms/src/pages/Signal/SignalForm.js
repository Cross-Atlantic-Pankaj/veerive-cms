// pages/Signal/SignalForm.js
import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import SignalContext from '../../context/SignalContext';

export default function SignalForm({ handleFormSubmit }) {
    const { signals, signalsDispatch, setIsFormVisible, isFormVisible } = useContext(SignalContext);

    const [signalName, setSignalName] = useState('');
    const [generalComment, setGeneralComment] = useState('');

    useEffect(() => {
        if (signals.editId) {
            const signal = signals.data.find((ele) => ele._id === signals.editId);
            setSignalName(signal.signalName);
            setGeneralComment(signal.generalComment);
        } else {
            setSignalName('');
            setGeneralComment('');
        }
    }, [signals.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = { signalName, generalComment };
        if (signals.editId) {
            try {
                const response = await axios.put(`/api/admin/signals/${signals.editId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                signalsDispatch({ type: 'UPDATE_SIGNAL', payload: response.data });
                handleFormSubmit('Signal updated successfully');
            } catch (err) {
                console.log(err.message);
            }
        } else {
            try {
                const response = await axios.post('/api/admin/signals', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                signalsDispatch({ type: 'ADD_SIGNAL', payload: response.data });
                handleFormSubmit('Signal added successfully');
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
        <div className="signal-form-container">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Signal Home</button>
            <form onSubmit={handleSubmit} className="signal-form">
                <h2>{signals.editId ? 'Edit Signal' : 'Add Signal'}</h2>
                <label htmlFor="signalName">Signal Name <span style={{color: 'red'}}>*</span></label>
                <input
                    type="text"
                    placeholder="Enter signal name"
                    name="signalName"
                    value={signalName}
                    onChange={(e) => setSignalName(e.target.value)}
                    className="signal-input"
                    required
                />
                <textarea
                    placeholder="Enter comment"
                    name="generalComment"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    className="signal-textarea"
                />
                <button type="submit" className="signal-submit-btn">
                    {signals.editId ? 'Update Signal' : 'Add Signal'}
                </button>
            </form>
        </div>
    );
}
