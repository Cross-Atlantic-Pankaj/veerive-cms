// pages/Country/CountryPage.js
import React, { useContext } from 'react';
import CountryList from './CountryList';
import CountryForm from './CountryForm';
import CountryContext from '../../context/CountryContext';
import RegionContext from '../../context/RegionContext';
import '../../html/css/Country.css';

const CountryPage = () => {
    const { isFormVisible, handleAddClick, handleFormSubmit } = useContext(CountryContext);
    const { regions } = useContext(RegionContext);
    console.log('count pg ', isFormVisible)
    return (
        <div className="countries-container">
            <h2>Countries Master</h2>
            {!isFormVisible ? (
                <>
                    <button className="add-country-btn" onClick={handleAddClick}>Add Country</button>
                    <CountryList />
                </>
            ) : (
                <CountryForm regions={regions} handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
};

export default CountryPage;
