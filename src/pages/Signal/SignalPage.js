// pages/Signal/SignalPage.js
import React, { useContext } from 'react';
import SignalList from './SignalList';
import SignalForm from './SignalForm';
import SignalContext from '../../context/SignalContext';
import '../../html/css/Signal.css';

export default function SignalPage() {
    const { signals, isFormVisible, handleAddClick, handleFormSubmit } = useContext(SignalContext);

    return (
        <div className="signals-container">
            <h2>Signals Master</h2>
            {!isFormVisible ? (
                <>
                    <button className="add-signal-btn" onClick={handleAddClick}>Add Signal</button>
                    <SignalList />
                </>
            ) : (
                <SignalForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
}
