// components/SearchBar.js
import React from 'react';

const SearchBar = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={onChange}
        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
      />
    </div>
  );
};

export default SearchBar;
