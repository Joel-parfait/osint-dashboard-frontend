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

const API = "http://localhost:8080";

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
     Gère la pagination et les filtres combinés
     ============================= */
  const fetchResults = async (searchValue, page = 0, fField = filterField, fValue = filterValue) => {
    setLoading(true);
    setCurrentPage(page);
    
    try {
      const encodedValue = encodeURIComponent(searchValue);
      // On construit l'URL avec les paramètres de pagination
      let url = `${API}/search/global?value=${encodedValue}&page=${page}&size=${resultSize}`;
      
      // Si un filtre est sélectionné, on l'ajoute à la requête Backend
      if (fField && fValue) {
        url += `&filterField=${fField}&filterValue=${encodeURIComponent(fValue)}`;
      }

      console.log(`🔍 Requête ANTIC: ${url}`);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur: ${res.status}`);

      const data = await res.json();
      
      setResults(data.results || []);
      setTotalCount(data.total || 0); // Le VRAI total filtré en base
      setTotalPages(data.totalPages || 0);
      setQuery(searchValue || "");

      // Scroll vers le tableau
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

  /* =============================
     GESTIONNAIRES D'ACTIONS
     ============================= */

  const handlePageChange = (newPage) => {
    fetchResults(query, newPage);
  };

  const applyFilter = () => {
    if (!filterField || !filterValue.trim()) return;
    // On relance la recherche depuis la page 0 avec le nouveau filtre
    fetchResults(query, 0, filterField, filterValue);
    setActiveChartFilter({ type: filterField, value: filterValue });
  };

  const clearFilter = () => {
    setFilterField("");
    setFilterValue("");
    setActiveChartFilter(null);
    // On recharge les données sans filtre
    fetchResults(query, 0, "", "");
  };

  const handleChartClick = (type, val) => {
    setFilterField(type);
    setFilterValue(val);
    fetchResults(query, 0, type, val);
    setActiveChartFilter({ type, value: val });
  };

  return (
    <div className={`dashboard-view ${darkMode ? "dark" : ""}`}>
      
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-container">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <div className="header-center">
            <img src="/antic-logo.png" alt="ANTIC" className="antic-logo-img" />
            <h1>OSINT Intelligence Dashboard</h1>
            <p>CIRT Onsite OSINT Tool - ANTIC</p>
          </div>
          <div className="header-spacer"></div>
        </div>
      </div>

      {/* RECHERCHE ET TAILLE */}
      <div className="search-controls">
        <SearchBar onSearch={(q) => fetchResults(q, 0)} />
        <div className="result-size-selector">
          <label>Taille page:</label>
          <select 
            value={resultSize} 
            onChange={(e) => {
              setResultSize(Number(e.target.value));
              fetchResults(query, 0); 
            }}
            className="size-select"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      {/* FILTRES DYNAMIQUES */}
      <div className="filters">
        <div className="filter-group">
          <select 
            value={filterField} 
            onChange={e => { setFilterField(e.target.value); setFilterValue(""); }}
            className="filter-select"
          >
            <option value="">Filtrer par champ...</option>
            <option value="country">🌍 Pays</option>
            <option value="address1">📍 Adresse</option>
            <option value="sex">👤 Sexe</option>
            <option value="occupation">💼 Profession</option>
          </select>

          <FilterOptions
            key={filterField} // Force le reset visuel quand on change de champ
            records={results}
            field={filterField}
            value={filterValue}
            onChange={setFilterValue}
          />
        </div>
        <div className="filter-actions">
          <button onClick={applyFilter} className="btn-filter-apply">✓ Appliquer</button>
          <button onClick={clearFilter} className="btn-filter-clear">✕ Réinitialiser</button>
        </div>
      </div>

      {/* GRAPHIQUES ET STATS */}
      <div className="charts-grid">
        <AddressChart records={results} onSelectAddress={(val) => handleChartClick('address1', val)} />
        <CountryChart records={results} onSelectCountry={(val) => handleChartClick('country', val)} />
      </div>

      <StatsPanel records={results} totalCount={totalCount} />

      {/* TABLEAU DE DONNÉES */}
      <div ref={tableRef}>
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

      {/* FOOTER */}
      <footer className="audit-footer">
        <strong>
          Résultats filtrés : {totalCount.toLocaleString()} | Page {currentPage + 1} / {totalPages}
        </strong>
        <span>Backend: {backendStatus}</span>
      </footer>

      {/* MODAL PROFIL */}
      {selected && <ProfileModal person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}