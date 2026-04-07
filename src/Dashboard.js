import React, { useState, useRef, useEffect } from "react";
import StatsPanel from "./components/StatsPanel";
import DataTable from "./components/DataTable";
import ProfileModal from "./components/ProfileModal";
import SearchBar from "./components/SearchBar";
import FilterOptions from "./components/FilterOptions";
import AddressChart from "./components/AddressChart";
import CountryChart from "./components/CountryChart";
import { pushReport } from "./Reports";
import { getCountryFromRecord, getCountryFlag } from "./utils/phoneUtils";  // ADDED getCountryFlag
import "./styles.css";

const API = "http://localhost:8080";

export default function Dashboard({ darkMode, setDarkMode }) {
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [filteredView, setFilteredView] = useState(null);
  const [activeChartFilter, setActiveChartFilter] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking...");
  
  // NEW: Result size selector (10k, 30k, 50k, 100k)
  const [resultSize, setResultSize] = useState(10000);

  const tableRef = useRef();

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
     Listen for custom event
     ============================= */
  useEffect(() => {
    const handleAutoSearch = (event) => {
      const searchQuery = event.detail?.query;
      if (searchQuery) {
        console.log("🔄 Auto-searching from report:", searchQuery);
        fetchResults(searchQuery);
      }
    };

    window.addEventListener("osint:auto-search", handleAutoSearch);
    return () => window.removeEventListener("osint:auto-search", handleAutoSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only set up listener once

  /* =============================
     SEARCH HANDLER
     ============================= */

     /* =============================
     SEARCH HANDLER (GLOBAL OPTIMIZED)
     ============================= */
  const fetchResults = async (value) => {
    setLoading(true);
    try {
      // On utilise désormais la route /global pour chercher partout simultanément
      // (Nom, téléphone, email, adresse, ville...)
      let url = `${API}/search/global?value=${encodeURIComponent(value)}&size=${resultSize}`;
      
      console.log("🔍 Global OSINT Search:", url);

      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const fetchedResults = data.results || [];
      const total = data.total || fetchedResults.length;

      console.log(`✅ Found ${total} results across all fields`);

      setResults(fetchedResults);
      setAllResults(fetchedResults);
      setTotalCount(total);
      setQuery(value || "(all)");

      // Reset des filtres visuels
      setActiveChartFilter(null);
      setFilteredView(null);
      setFilterField("");
      setFilterValue("");

      // Enregistrement dans le rapport local
      pushReport({
        query: value,
        field: "global",
        total: total,
        resultSize: resultSize,
        timestamp: new Date().toLocaleString()
      });

      // Scroll vers le tableau
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err) {
      console.error("❌ Search failed:", err);
      alert("Search failed. Ensure Backend is running and 'leakeddata' index is created.");
      setResults([]);
      setAllResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     MANUAL FILTER HANDLING
     ============================= */
  const applyFilter = () => {
    if (!filterField || !filterValue.trim()) {
      alert("⚠️ Please select a field and enter a value");
      return;
    }

    console.log(`🔍 Applying filter: ${filterField} = "${filterValue}"`);

    const filtered = allResults.filter(r => {
      // Special handling for country field
      if (filterField === "country") {
        const recordCountry = getCountryFromRecord(r);
        return recordCountry && 
               recordCountry.toLowerCase().includes(filterValue.toLowerCase());
      }
      
      // Special handling for sex field (handles multiple languages)
      if (filterField === "sex") {
        const recordSex = String(r.sex || "").trim().toLowerCase();
        const searchSex = filterValue.trim().toLowerCase();
        
        // Direct exact match first
        if (recordSex === searchSex) {
          return true;
        }
        
        // Handle English variations
        if (searchSex === "m" || searchSex === "male") {
          return recordSex === "male" || recordSex === "m" || recordSex === "laki-laki" || recordSex === "ذكر";
        }
        
        if (searchSex === "f" || searchSex === "female") {
          return recordSex === "female" || recordSex === "f" || recordSex === "perempuan" || recordSex === "أنثى";
        }
        
        // Handle Indonesian
        if (searchSex === "laki-laki") {
          return recordSex === "male" || recordSex === "m" || recordSex === "laki-laki" || recordSex === "ذكر";
        }
        
        if (searchSex === "perempuan") {
          return recordSex === "female" || recordSex === "f" || recordSex === "perempuan" || recordSex === "أنثى";
        }
        
        return false; // No match
      }
      
      // For other fields (address1), use contains
      const fieldValue = String(r[filterField] || "").trim();
      return fieldValue.toLowerCase().includes(filterValue.toLowerCase());
    });

    console.log(`✅ Filter results: ${filtered.length} of ${allResults.length}`);
    
    if (filtered.length === 0) {
      alert(`⚠️ No records found matching ${filterField} = "${filterValue}"`);
    }
    
    setFilteredView(filtered);
    setActiveChartFilter(null);
  };

  const clearFilter = () => {
    console.log("🧹 Clearing all filters");
    setFilteredView(null);
    setActiveChartFilter(null);
    setFilterField("");
    setFilterValue("");
    setResults(allResults);
  };

  /* =============================
     CHART CLICK HANDLERS
     ============================= */
  const handleAddressClick = (address) => {
    if (!address) return;
    
    console.log(`🏠 Filtering by address: "${address}"`);
    
    const filtered = allResults.filter(r => {
      const recordAddress = (r.address1 || r.placeofbirth || "").trim();
      return recordAddress.toLowerCase() === address.toLowerCase();
    });
    
    console.log(`✅ Address filter: ${filtered.length} results`);
    setFilteredView(filtered);
    setActiveChartFilter({ type: 'address', value: address });
    
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCountryClick = (country) => {
    if (!country) return;
    
    console.log(`🌍 Filtering by country: "${country}"`);
    
    const filtered = allResults.filter(r => {
      const recordCountry = getCountryFromRecord(r);
      if (!recordCountry) return false;
      return recordCountry.toLowerCase() === country.toLowerCase();
    });
    
    console.log(`✅ Country filter: ${filtered.length} results`);
    
    if (filtered.length === 0) {
      alert(`⚠️ No records found for country "${country}"`);
    }
    
    setFilteredView(filtered);
    setActiveChartFilter({ type: 'country', value: country });
    
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  /* =============================
     SHOW ALL RESULTS
     Clears size limit and fetches all
     ============================= */
  const showAllResults = async () => {
    if (!query) {
      alert("⚠️ Please perform a search first");
      return;
    }

    const confirmed = window.confirm(
      `⚠️ This will fetch ALL results (current limit: ${resultSize}).\n\n` +
      `Total available: ${totalCount.toLocaleString()}\n\n` +
      `This may take a while. Continue?`
    );

    if (!confirmed) return;

    setResultSize(totalCount);
    fetchResults(query);
  };

  /* =============================
     RECORD SELECT
     ============================= */
  const handleSelect = (record) => {
    setSelected(record);
  };

  const shown = filteredView !== null ? filteredView : results;

  /* =============================
     RENDER
     ============================= */
  return (
    <div className={`dashboard-view ${darkMode ? "dark" : ""}`}>
      
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-container">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          <div className="header-center">
            <img 
              src="/antic-logo.png" 
              alt="ANTIC Logo" 
              className="antic-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="osint-brand" style={{ display: 'none' }}>
              <div className="osint-logo">🕵️</div>
              <div>
                <div className="brand-title">OSINT</div>
                <div className="brand-subtitle">Intelligence Platform</div>
              </div>
            </div>
            
            <h1>OSINT Intelligence Dashboard</h1>
            <p>CIRT Onsite OSINT Tool - ANTIC</p>
          </div>

          <div className="header-spacer"></div>
        </div>
      </div>

      {/* SEARCH BAR WITH RESULT SIZE SELECTOR */}
      <div className="search-controls">
        <SearchBar onSearch={fetchResults} />
        
        <div className="result-size-selector">
          <label>Result Limit:</label>
          <select 
            value={resultSize} 
            onChange={(e) => setResultSize(Number(e.target.value))}
            className="size-select"
          >
            <option value={10000}>10,000</option>
            <option value={30000}>30,000</option>
            <option value={50000}>50,000</option>
            <option value={100000}>100,000</option>
          </select>
          
          {totalCount > resultSize && (
            <button onClick={showAllResults} className="btn-show-all">
              📊 Show All ({totalCount.toLocaleString()})
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE FILTER INDICATOR */}
      {activeChartFilter && (
        <div className="active-filter-badge">
          <span>
            {activeChartFilter.type === 'address' ? '📍' : '🌍'} 
            {' '}Filtered by {activeChartFilter.type}: 
            <strong> {activeChartFilter.value}</strong>
            {' '}({shown.length} results)
          </span>
          <button onClick={clearFilter} className="clear-filter-btn">
            ✕ Clear Filter
          </button>
        </div>
      )}

      {/* MANUAL FILTERS */}
      <div className="filters">
        <div className="filter-group">
          <select 
            value={filterField} 
            onChange={e => {
              setFilterField(e.target.value);
              setFilterValue("");
            }}
            className="filter-select"
          >
            <option value="">Select Field</option>
            <option value="country">🌍 Country</option>
            <option value="address1">📍 Address</option>
            <option value="sex">👤 Sex</option>
          </select>

          <FilterOptions
            records={allResults}
            field={filterField}
            value={filterValue}
            onChange={setFilterValue}
            placeholder={filterField ? `Enter ${filterField}...` : "Select a field first"}
          />
        </div>

        <div className="filter-actions">
          <button onClick={applyFilter} className="btn-filter-apply">
            ✓ Apply Filter
          </button>
          <button onClick={clearFilter} className="btn-filter-clear">
            ✕ Clear
          </button>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-grid">
        <AddressChart 
          records={allResults} 
          onSelectAddress={handleAddressClick}
        />
        <CountryChart 
          records={allResults} 
          onSelectCountry={handleCountryClick}
        />
      </div>

      {/* STATS */}
      <StatsPanel records={allResults} filteredRecords={shown} />

      {/* TABLE */}
      <div ref={tableRef}>
        <DataTable
          records={shown}
          loading={loading}
          totalCount={totalCount}
          onSelect={handleSelect}
        />
      </div>

      {/* FOOTER */}
      <footer className="audit-footer">
        <strong>
          Showing {shown.length.toLocaleString()} of {totalCount.toLocaleString()}
        </strong>
        <span>Backend: {backendStatus}</span>
        <span>Limit: {resultSize.toLocaleString()}</span>
      </footer>

      {/* MODAL */}
      {selected && (
        <ProfileModal
          person={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}