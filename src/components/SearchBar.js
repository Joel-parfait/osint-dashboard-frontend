import React, { useState, useEffect, useRef } from "react";

// Utilise l'URL de l'API définie dans Vercel ou localhost par défaut
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // --- LOGIQUE AUTOCOMPLÉTION ---
  useEffect(() => {
    const timer = setTimeout(() => {
      // Correction : On utilise l'URL dynamique API_URL
      if (input.trim().length >= 1) {
        fetch(`${API_URL}/search/suggest?value=${encodeURIComponent(input)}`)
          .then(res => {
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
          })
          .then(data => {
            setSuggestions(data);
            setShowSuggestions(true);
          })
          .catch(err => console.error("Erreur suggestions:", err));
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Le Debounce de 300ms est parfait pour limiter la charge sur Render

    return () => clearTimeout(timer);
  }, [input]);

  // Fermer si clic extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(input.trim());
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (val) => {
    setInput(val);
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(val);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => input.length >= 1 && setShowSuggestions(true)}
          placeholder="Search by name, phone, email, address, country..."
          autoComplete="off"
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
            setSuggestions([]);
            onSearch("");
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

      {showSuggestions && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: 'calc(100% - 210px)',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '0 0 8px 8px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          zIndex: 1000,
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {suggestions.map((s, i) => (
            <li 
              key={i} 
              onClick={() => handleSelectSuggestion(s)}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                color: '#333',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              🔍 {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}