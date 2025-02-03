// pages/SubSignal/SubSignalPage.js
import React, { useContext } from 'react';
import SubSignalList from './SubSignalList';
import SubSignalForm from './SubSignalForm';
import SubSignalContext from '../../context/SubSignalContext';
import '../../html/css/SubSignal.css';

export default function SubSignalPage() {
    const { subSignals, isFormVisible, handleAddClick, handleFormSubmit } = useContext(SubSignalContext);

    return (
        <div className="subsignals-container">
            <h2>SubSignals Master</h2>
            {!isFormVisible ? (
                <>
                    <button className="add-subsignal-btn" onClick={handleAddClick}>Add SubSignal</button>
                    <SubSignalList />
                </>
            ) : (
                <SubSignalForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
}
