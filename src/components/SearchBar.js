import React, { useState, useEffect, useRef } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

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
      {/* Utilisation de flex-wrap pour l'empilement automatique sur mobile */}
      <form 
        onSubmit={handleSubmit} 
        style={{ 
          display: 'flex', 
          gap: '10px', 
          width: '100%',
          flexWrap: 'wrap' 
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => input.length >= 1 && setShowSuggestions(true)}
          placeholder="Search by name, phone, email..."
          autoComplete="off"
          style={{
            flex: '1 1 300px', // Prend tout l'espace mais passe à la ligne si < 300px
            padding: '12px 15px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            background: 'white',
            minWidth: '200px'
          }}
        />
        
        {/* Container pour les boutons pour qu'ils restent groupés ou s'adaptent */}
        <div style={{ display: 'flex', gap: '10px', flex: '1 1 auto' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '12px 20px',
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
              flex: 1,
              padding: '12px 20px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              whiteSpace: 'nowrap'
            }}
          >
            📄 All
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0, // S'aligne sur toute la largeur disponible du parent
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
                padding: '12px 15px', // Padding légèrement augmenté pour le tactile
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