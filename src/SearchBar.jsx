import React, { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = "Search by name, phone, NUI, town..." }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = (query || '').trim();
    if (!q) return;
    onSearch(q);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        aria-label="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" aria-label="Search">Search</button>
    </form>
  );
}
