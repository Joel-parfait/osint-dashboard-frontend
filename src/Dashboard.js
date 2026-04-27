import React, { useState, useRef, useEffect } from "react";
import StatsPanel from "./components/StatsPanel";
import DataTable from "./components/DataTable";
import ProfileModal from "./components/ProfileModal";
import SearchBar from "./components/SearchBar";
import FilterOptions from "./components/FilterOptions";
import AddressChart from "./components/AddressChart";
import CountryChart from "./components/CountryChart";
import { pushReport } from "./Reports";
import { getCountryFromRecord } from "./utils/phoneUtils";
import "./styles.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function Dashboard({ darkMode, setDarkMode }) {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("Vérification...");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // État pour le menu hamburger

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [resultSize, setResultSize] = useState(50); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [activeChartFilter, setActiveChartFilter] = useState(null);

  const tableRef = useRef();

  useEffect(() => {
    fetch(`${API}/search/health`)
      .then(r => r.json())
      .then(() => setBackendStatus("✅ Connecté"))
      .catch(() => setBackendStatus("❌ Hors ligne"));
  }, []);

  const fetchResults = async (searchValue, page = 0, fField = filterField, fValue = filterValue) => {
    setLoading(true);
    setCurrentPage(page);
    try {
      const encodedValue = encodeURIComponent(searchValue);
      let url = `${API}/search/global?value=${encodedValue}&page=${page}&size=${resultSize}`;
      if (fField && fValue) {
        url += `&filterField=${fField}&filterValue=${encodeURIComponent(fValue)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur: ${res.status}`);
      const data = await res.json();
      setResults(data.results || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setQuery(searchValue || "");
      if (page > 0) {
        setTimeout(() => tableRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
      pushReport({
        query: searchValue,
        filter: fField ? `${fField}:${fValue}` : "none",
        total: data.total,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("❌ Échec recherche:", err);
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => fetchResults(query, newPage);

  const applyFilter = () => {
    if (!filterField || !filterValue.trim()) return;
    fetchResults(query, 0, filterField, filterValue);
    setActiveChartFilter({ type: filterField, value: filterValue });
  };

  const clearFilter = () => {
    setFilterField("");
    setFilterValue("");
    setActiveChartFilter(null);
    fetchResults(query, 0, "", "");
  };

  const handleChartClick = (type, val) => {
    setFilterField(type);
    setFilterValue(val);
    fetchResults(query, 0, type, val);
    setActiveChartFilter({ type, value: val });
  };

  return (
    <div className={`dashboard-view ${darkMode ? "dark" : ""}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>
      
      {/* HEADER AVEC MENU HAMBURGER */}
      <div className="dashboard-header" style={{ padding: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Bouton Hamburger */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: darkMode ? 'white' : 'black', zIndex: 1001 }}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>

          <div className="header-center" style={{ textAlign: 'center', flex: 1 }}>
            <img src="/antic-logo.png" alt="ANTIC" style={{ maxHeight: '40px' }} />
            <h1 style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', margin: 0 }}>OSINT Dashboard</h1>
          </div>

          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} style={{ fontSize: '1.2rem' }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Menu latéral (Drawer) */}
        {isMenuOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, height: '100vh', width: '250px', 
            background: darkMode ? '#1a1a1a' : 'white', zIndex: 1000,
            boxShadow: '2px 0 10px rgba(0,0,0,0.2)', padding: '60px 20px'
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <a href="#" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>🏠 Accueil</a>
              <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>📊 Statistiques</a>
              <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>📂 Archives</a>
              <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>⚙️ Paramètres</a>
            </nav>
          </div>
        )}
      </div>

      {/* RECHERCHE - Polices réduites */}
      <div className="search-controls" style={{ padding: '10px', gap: '10px' }}>
        <SearchBar onSearch={(q) => fetchResults(q, 0)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
          <label>Taille:</label>
          <select value={resultSize} onChange={(e) => { setResultSize(Number(e.target.value)); fetchResults(query, 0); }} className="size-select">
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      {/* FILTRES - Layout Compact */}
      <div className="filters" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <select value={filterField} onChange={e => { setFilterField(e.target.value); setFilterValue(""); }} className="filter-select" style={{ fontSize: '0.9rem', padding: '8px' }}>
          <option value="">Champ...</option>
          <option value="country">🌍 Pays</option>
          <option value="address1">📍 Adresse</option>
          <option value="occupation">💼 Profession</option>
        </select>
        <FilterOptions key={filterField} records={results} field={filterField} value={filterValue} onChange={setFilterValue} />
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={applyFilter} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} className="btn-filter-apply">✓ Appliquer</button>
          <button onClick={clearFilter} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} className="btn-filter-clear">✕ Reset</button>
        </div>
      </div>

      {/* GRAPHIQUES - Empilement forcé sur petit mobile */}
      <div className="charts-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '10px', padding: '10px' 
      }}>
        <div style={{ minHeight: '200px' }}><AddressChart records={results} onSelectAddress={(val) => handleChartClick('address1', val)} /></div>
        <div style={{ minHeight: '200px' }}><CountryChart records={results} onSelectCountry={(val) => handleChartClick('country', val)} /></div>
      </div>

      <div style={{ padding: '0 10px' }}>
        <StatsPanel records={results} totalCount={totalCount} />
      </div>

      {/* TABLEAU - Scroll horizontal impératif */}
      <div ref={tableRef} style={{ flex: 1, overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '10px' }}>
        <DataTable
          records={results}
          loading={loading}
          totalCount={totalCount}
          onSelect={setSelected}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* FOOTER COMPACT */}
      <footer className="audit-footer" style={{ padding: '10px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
        <strong>{totalCount.toLocaleString()} rés. | P.{currentPage + 1}</strong>
        <span>Status: {backendStatus}</span>
      </footer>

      {selected && <ProfileModal person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}