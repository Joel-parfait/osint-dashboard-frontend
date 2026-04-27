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

// Utilise l'URL de Vercel en prod, ou localhost en développement
const API = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function Dashboard({ darkMode, setDarkMode }) {
  // --- ÉTATS DES DONNÉES ---
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("Vérification...");

  // --- ÉTATS DE RECHERCHE ET PAGINATION ---
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [resultSize, setResultSize] = useState(50); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // --- ÉTATS DES FILTRES ---
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [activeChartFilter, setActiveChartFilter] = useState(null);

  const tableRef = useRef();

  /* =============================
     VÉRIFICATION SANTÉ BACKEND
     ============================= */
  useEffect(() => {
    fetch(`${API}/search/health`)
      .then(r => r.json())
      .then(() => setBackendStatus("✅ Connecté"))
      .catch(() => setBackendStatus("❌ Hors ligne"));
  }, []);

  /* =============================
     MOTEUR DE RECHERCHE (BACKEND)
     ============================= */
  const fetchResults = async (searchValue, page = 0, fField = filterField, fValue = filterValue) => {
    setLoading(true);
    setCurrentPage(page);
    
    try {
      const encodedValue = encodeURIComponent(searchValue);
      let url = `${API}/search/global?value=${encodedValue}&page=${page}&size=${resultSize}`;
      
      if (fField && fValue) {
        url += `&filterField=${fField}&filterValue=${encodeURIComponent(fValue)}`;
      }

      console.log(`🔍 Requête ANTIC: ${url}`);
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

  const handlePageChange = (newPage) => {
    fetchResults(query, newPage);
  };

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
    <div className={`dashboard-view ${darkMode ? "dark" : ""}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER RESPONSIVE */}
      <div className="dashboard-header" style={{ padding: '20px 10px' }}>
        <div className="header-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '15px', position: 'relative' }}>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} style={{ position: 'absolute', left: '10px', top: '0' }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <div className="header-center" style={{ textAlign: 'center', maxWidth: '100%' }}>
            <img src="/antic-logo.png" alt="ANTIC" className="antic-logo-img" style={{ maxHeight: '60px', marginBottom: '10px' }} />
            <h1 style={{ fontSize: 'clamp(1.2rem, 5vw, 2rem)', margin: '5px 0' }}>OSINT Intelligence Dashboard</h1>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>CIRT Onsite OSINT Tool - ANTIC</p>
          </div>
          <div className="header-spacer" style={{ width: '40px' }}></div>
        </div>
      </div>

      {/* RECHERCHE ET TAILLE RESPONSIVE */}
      <div className="search-controls" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <SearchBar onSearch={(q) => fetchResults(q, 0)} />
        <div className="result-size-selector" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <label style={{ fontSize: '14px' }}>Taille page:</label>
          <select 
            value={resultSize} 
            onChange={(e) => {
              setResultSize(Number(e.target.value));
              fetchResults(query, 0); 
            }}
            className="size-select"
            style={{ padding: '5px', borderRadius: '5px' }}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      {/* FILTRES DYNAMIQUES RESPONSIVES */}
      <div className="filters" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="filter-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <select 
            value={filterField} 
            onChange={e => { setFilterField(e.target.value); setFilterValue(""); }}
            className="filter-select"
            style={{ flex: '1 1 200px', padding: '10px', borderRadius: '8px' }}
          >
            <option value="">Filtrer par champ...</option>
            <option value="country">🌍 Pays</option>
            <option value="address1">📍 Adresse</option>
            <option value="sex">👤 Sexe</option>
            <option value="occupation">💼 Profession</option>
          </select>

          <div style={{ flex: '1 1 200px' }}>
            <FilterOptions
              key={filterField}
              records={results}
              field={filterField}
              value={filterValue}
              onChange={setFilterValue}
            />
          </div>
        </div>
        <div className="filter-actions" style={{ display: 'flex', gap: '10px' }}>
          <button onClick={applyFilter} className="btn-filter-apply" style={{ flex: 1, padding: '12px' }}>✓ Appliquer</button>
          <button onClick={clearFilter} className="btn-filter-clear" style={{ flex: 1, padding: '12px' }}>✕ Réinitialiser</button>
        </div>
      </div>

      {/* GRAPHIQUES ET STATS RESPONSIVES */}
      <div className="charts-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px', 
        padding: '15px' 
      }}>
        <div style={{ minHeight: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px' }}>
          <AddressChart records={results} onSelectAddress={(val) => handleChartClick('address1', val)} />
        </div>
        <div style={{ minHeight: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px' }}>
          <CountryChart records={results} onSelectCountry={(val) => handleChartClick('country', val)} />
        </div>
      </div>

      <div style={{ padding: '0 15px' }}>
        <StatsPanel records={results} totalCount={totalCount} />
      </div>

      {/* TABLEAU DE DONNÉES (Horizontal scroll sur mobile) */}
      <div ref={tableRef} style={{ flex: 1, overflowX: 'auto', padding: '15px' }}>
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

      {/* FOOTER RESPONSIVE */}
      <footer className="audit-footer" style={{ 
        padding: '15px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        gap: '10px',
        fontSize: '13px'
      }}>
        <strong>
          Résultats : {totalCount.toLocaleString()} | Page {currentPage + 1} / {totalPages}
        </strong>
        <span>Backend: {backendStatus}</span>
      </footer>

      {/* MODAL PROFIL */}
      {selected && <ProfileModal person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}