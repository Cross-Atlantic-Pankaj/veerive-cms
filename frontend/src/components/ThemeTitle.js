import React from 'react';

const ThemeTitle = ({ theme }) => {
  return (
    <h2>Theme: {theme || 'N/A'}</h2>
  );
};

export default ThemeTitle;
