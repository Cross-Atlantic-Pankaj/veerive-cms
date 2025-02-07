import React, { useContext, useState, useMemo } from 'react';
import SubSignalContext from '../../context/SubSignalContext';
import SignalContext from '../../context/SignalContext';
import axios from '../../config/axios';
import '../../html/css/SubSignal.css'; // Ensure this CSS file is created

export default function SubSignalList() {
    const { subSignals, subSignalsDispatch, handleEditClick } = useContext(SubSignalContext);
    const { signals } = useContext(SignalContext);

    const [sortConfig, setSortConfig] = useState({ key: 'subSignalName', direction: 'ascending' });

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this sub-signal?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/sub-signals/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                subSignalsDispatch({ type: 'REMOVE_SUBSIGNAL', payload: response.data._id });
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const findSignalName = (signalId) => {
        const signal = signals.data.find(s => s._id === signalId);
        return signal ? signal.signalName : 'Unknown Signal';
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Sorting logic
    const sortedSubSignals = useMemo(() => {
        let sortableSubSignals = [...subSignals.data];
        if (sortConfig !== null) {
            sortableSubSignals.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'subSignalName':
                        aValue = a.subSignalName.toLowerCase();
                        bValue = b.subSignalName.toLowerCase();
                        break;
                    case 'signal':
                        aValue = findSignalName(a.signalId).toLowerCase();
                        bValue = findSignalName(b.signalId).toLowerCase();
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                        break;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableSubSignals;
    }, [subSignals.data, sortConfig, signals.data]);

    return (
        <div className="subsignal-list-container">
            <table className="subsignal-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('subSignalName')}>
                            SubSignal Name {sortConfig.key === 'subSignalName' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('signal')}>
                            Signal {sortConfig.key === 'signal' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th>Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedSubSignals.map((subSignal) => (
                        <tr key={subSignal._id}>
                            <td>{subSignal.subSignalName}</td>
                            <td>{findSignalName(subSignal.signalId)}</td>
                            <td>{subSignal.generalComment}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(subSignal._id)}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(subSignal._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
