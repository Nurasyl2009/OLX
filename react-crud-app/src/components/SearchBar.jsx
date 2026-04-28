import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-section">
      <div className="search-bar">
        <Search className="search-icon" size={20} />
        <input 
          id="search-input"
          type="text" 
          placeholder="Вакансия немесе компания бойынша іздеу..." 
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBar;
