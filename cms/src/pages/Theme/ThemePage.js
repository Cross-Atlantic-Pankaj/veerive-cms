import React, { useContext } from 'react';
import ThemeContext from '../../context/ThemeContext';
import ThemeList from './ThemeList';
import ThemeForm from './ThemeForm';
import '../../html/css/Theme.css'; // Make sure to adjust this path as needed

const ThemePage = () => {
    const {  isFormVisible,  handleFormSubmit } = useContext(ThemeContext);

    return (
        <div className="themes-container">
            <h2>Themes Master</h2>
            {!isFormVisible ? (
                <>
                    <ThemeList />
                </>
            ) : (
                <ThemeForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
};

export default ThemePage;
