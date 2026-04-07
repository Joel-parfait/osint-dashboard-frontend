import React, { useState, useRef, useEffect } from "react";
import StatsPanel from "./components/StatsPanel";
import DataTable from "./components/DataTable";
import ProfileModal from "./components/ProfileModal";
import SearchBar from "./components/SearchBar";
import FilterOptions from "./components/FilterOptions";
import AddressChart from "./components/AddressChart";
import CountryChart from "./components/CountryChart";
import { pushReport } from "./Reports";
import { getCountryFromRecord, getCountryFlag } from "./utils/phoneUtils";
import "./styles.css";

const API = "http://localhost:8080";

export default function Dashboard({ darkMode, setDarkMode }) {
  // ÉTATS DES DONNÉES
  const [results, setResults] = useState([]); // Résultats bruts du backend
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking...");

  // ÉTATS DE RECHERCHE ET PAGINATION
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [resultSize, setResultSize] = useState(50); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0); // Total global en DB

  // ÉTATS DES FILTRES
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [filteredView, setFilteredView] = useState(null);
  const [activeChartFilter, setActiveChartFilter] = useState(null);

  const tableRef = useRef();

  // CALCUL DYNAMIQUE DES RÉSULTATS AFFICHÉS (Pour StatsPanel et Footer)
  // Si un filtre est actif, on compte le filteredView, sinon les résultats de la page
  const shown = filteredView !== null ? filteredView : results;
  const displayCount = filteredView !== null ? filteredView.length : totalCount;

  /* =============================
     HEALTH CHECK
     ============================= */
  useEffect(() => {
    fetch(`${API}/search/health`)
      .then(r => r.json())
      .then(() => setBackendStatus("✅ Connected"))
      .catch(() => setBackendStatus("❌ Offline"));
  }, []);

  /* =============================
     AUTO-SEARCH FROM REPORTS
     ============================= */
  useEffect(() => {
    const handleAutoSearch = (event) => {
      const searchQuery = event.detail?.query;
      if (searchQuery) fetchResults(searchQuery, 0);
    };
    window.addEventListener("osint:auto-search", handleAutoSearch);
    return () => window.removeEventListener("osint:auto-search", handleAutoSearch);
  }, [resultSize]);

  /* =============================
     SEARCH HANDLER (PAGINATED & GLOBAL)
     ============================= */
  const fetchResults = async (value, page = 0) => {
    setLoading(true);
    setCurrentPage(page);
    
    try {
      const encodedValue = encodeURIComponent(value);
      const url = `${API}/search/global?value=${encodedValue}&page=${page}&size=${resultSize}`;
      
      console.log(`🔍 Query: ${value} | Page: ${page}`);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      const data = await res.json();
      
      const fetchedResults = data.results || [];
      const totalElements = data.total || 0;
      const totalP = data.totalPages || 0;

      setResults(fetchedResults);
      setTotalCount(totalElements);
      setTotalPages(totalP);
      setQuery(value || "");

      // Reset des filtres visuels lors d'une NOUVELLE recherche uniquement (page 0)
      if (page === 0) {
        setFilteredView(null);
        setActiveChartFilter(null);
        setFilterField("");
        setFilterValue("");
      }

      pushReport({
        query: value,
        field: "global",
        total: totalElements,
        page: page,
        timestamp: new Date().toLocaleString()
      });

    } catch (err) {
      console.error("❌ Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     PAGINATION CONTROL
     ============================= */
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchResults(query, newPage);
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  /* =============================
     FILTERS LOGIC (COMBINÉ AVEC RECHERCHE)
     ============================= */
  const applyFilter = () => {
    if (!filterField || !filterValue.trim()) return;
    
    const searchVal = filterValue.toLowerCase();
    const filtered = results.filter(r => {
      const fieldValue = String(r[filterField] || "").toLowerCase();
      
      // Cas particulier pour le sexe
      if (filterField === 'sex') {
        if (searchVal.startsWith('m')) return fieldValue === 'm';
        if (searchVal.startsWith('f')) return fieldValue === 'f';
      }
      return fieldValue.includes(searchVal);
    });

    setFilteredView(filtered);
    setActiveChartFilter({ type: filterField, value: filterValue });
  };

  /* =============================
     RÉINITIALISATION COMPLÈTE DES FILTRES
     ============================= */
  const clearFilter = () => {
    console.log("🧹 Nettoyage des filtres actifs...");
    
    // 1. On réinitialise les états de filtrage
    setFilteredView(null);
    setActiveChartFilter(null);
    
    // 2. On vide explicitement les champs
    setFilterField("");   // Remet le <select> à "Filtrer par champ..."
    setFilterValue("");   // Vide la valeur pour FilterOptions
    
    // On ne touche pas à fetchResults pour garder la recherche globale intacte
  };

  // ... (dans le return du Dashboard) ...

  {/* FILTERS SECTION */}
  <div className="filters">
    <div className="filter-group">
      <select 
        value={filterField} // Contrôlé par l'état
        onChange={e => { 
          setFilterField(e.target.value); 
          setFilterValue(""); // Reset de la valeur quand on change de champ
        }}
        className="filter-select"
      >
        <option value="">Filtrer par champ...</option>
        <option value="country">🌍 Pays</option>
        <option value="address1">📍 Adresse</option>
        <option value="sex">👤 Sexe</option>
        <option value="occupation">💼 Profession</option>
      </select>

      {/* IMPORTANT: FilterOptions DOIT utiliser 'value' pour être vidé.
          On ajoute une 'key' dynamique basée sur filterField pour forcer 
          le composant à se re-charger proprement quand on change de filtre.
      */}
      <FilterOptions
        key={filterField} 
        records={results}
        field={filterField}
        value={filterValue} // Reçoit le "" de clearFilter
        onChange={setFilterValue}
      />
    </div>
    <div className="filter-actions">
      <button onClick={applyFilter} className="btn-filter-apply">✓ Appliquer</button>
      <button onClick={clearFilter} className="btn-filter-clear">✕ Réinitialiser</button>
    </div>
  </div>

  /* =============================
     CHART CLICK HANDLERS
     ============================= */
  const handleAddressClick = (address) => {
    if (!address) return;
    const filtered = results.filter(r => 
      (r.address1 || "").toLowerCase().includes(address.toLowerCase())
    );
    setFilteredView(filtered);
    setActiveChartFilter({ type: 'address', value: address });
  };

  const handleCountryClick = (country) => {
    if (!country) return;
    const filtered = results.filter(r => 
      getCountryFromRecord(r).toLowerCase() === country.toLowerCase()
    );
    setFilteredView(filtered);
    setActiveChartFilter({ type: 'country', value: country });
  };

  const handleSelect = (record) => setSelected(record);

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

      {/* SEARCH CONTROLS */}
      <div className="search-controls">
        <SearchBar onSearch={(q) => fetchResults(q, 0)} />
        <div className="result-size-selector">
          <label>Taille de page:</label>
          <select 
            value={resultSize} 
            onChange={(e) => {
              setResultSize(Number(e.target.value));
              if (query) fetchResults(query, 0);
            }}
            className="size-select"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      {/* FILTERS SECTION */}
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

      {/* CHARTS & STATS DYNAMIQUES */}
      <div className="charts-grid">
        <AddressChart records={shown} onSelectAddress={handleAddressClick} />
        <CountryChart records={shown} onSelectCountry={handleCountryClick} />
      </div>

      {/* On passe 'shown' pour que les stats changent avec le filtre */}
      <StatsPanel records={shown} totalCount={displayCount} />

      {/* DATA TABLE */}
      <div ref={tableRef}>
        <DataTable
          records={shown}
          loading={loading}
          totalCount={displayCount} // Affiche le compte filtré ou total
          onSelect={handleSelect}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* FOOTER SYNCHRONISÉ */}
      <footer className="audit-footer">
        <strong>
          Résultats : {displayCount.toLocaleString()} | Page {currentPage + 1} / {totalPages}
        </strong>
        <span>Statut Backend: {backendStatus}</span>
      </footer>

      {/* MODAL */}
      {selected && <ProfileModal person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}