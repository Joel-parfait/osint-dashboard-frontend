import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', width: '100%' }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search by name, phone, email, address, country..."
        style={{
          flex: 1,
          padding: '12px 15px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          fontSize: '16px',
          background: 'white'
        }}
      />
      <button
        type="submit"
        style={{
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          whiteSpace: 'nowrap',
          fontWeight: 'bold'
        }}
      >
        🔍 Search
      </button>
      <button
        type="button"
        onClick={() => {
          setInput("");
          onSearch(""); // Empty search to get all records
        }}
        style={{
          padding: '12px 24px',
          background: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          whiteSpace: 'nowrap'
        }}
      >
        📄 Show All
      </button>
    </form>
  );
}