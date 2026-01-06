import React, { useEffect, useState } from "react";

const STORAGE_KEY = "osint_search_history_v1";

/**
 * Push a search report to localStorage
 * Called from Dashboard after each search
 */
export function pushReport(entry) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const now = new Date();
    const item = { 
      ...entry, 
      timestamp: now.toLocaleString(),
      id: Date.now() + Math.random(),
      cached: false // Will be updated when we check cache
    };
    const updated = [item, ...arr].slice(0, 500); // Keep last 500
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("osint:reports:updated", { detail: updated }));
    console.log("Report pushed:", item);
  } catch (e) {
    console.error("pushReport error:", e);
  }
}

/**
 * Reports Component - Redis Cache Aware
 * 
 * FEATURES:
 * - Shows history of all searches
 * - Click on a report to re-run that search
 * - Shows if search is cached (will be fast)
 * - Filter by result size (large/small)
 * - Filter by cache status
 * - Export reports as JSON
 * - Clear all history
 */
export default function Reports({ onNavigateToDashboard }) {
  const [history, setHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState("all");
  const [cacheFilter, setCacheFilter] = useState("all");

  /* =============================
     LOAD HISTORY & CHECK CACHE STATUS
     ============================= */
  useEffect(() => {
    loadHistory();
    checkCacheStatus();

    // Listen for updates
    const handler = (e) => {
      setHistory(e.detail || []);
      checkCacheStatus();
    };
    window.addEventListener("osint:reports:updated", handler);
    return () => window.removeEventListener("osint:reports:updated", handler);
  }, []);

  const loadHistory = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      setHistory(data);
      console.log("Loaded reports:", data.length);
    } catch (e) {
      console.error("Failed to load reports:", e);
      setHistory([]);
    }
  };

  /* =============================
     CHECK WHICH SEARCHES ARE CACHED
     ============================= */
  const checkCacheStatus = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/cache/stats");
      if (res.ok) {
        const stats = await res.json();
        
        // Update history with cache status
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        
        const reports = JSON.parse(raw);
        const updated = reports.map(report => {
          // Check if this query exists in any cache
          let isCached = false;
          if (stats.caches) {
            stats.caches.forEach(cache => {
              if (cache.keys && Array.isArray(cache.keys)) {
                if (cache.keys.some(key => key.includes(report.query))) {
                  isCached = true;
                }
              }
            });
          }
          return { ...report, cached: isCached };
        });
        
        setHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Failed to check cache status:", e);
    }
  };

  /* =============================
     CLEAR ALL REPORTS
     ============================= */
  const clearAll = () => {
    if (!window.confirm("⚠️ Clear all reports? This cannot be undone.")) return;
    
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    window.dispatchEvent(new CustomEvent("osint:reports:updated", { detail: [] }));
    alert("✅ All reports cleared");
  };

  /* =============================
     RE-RUN SEARCH FROM REPORT
     Dispatch custom event that Dashboard will listen for
     ============================= */
  const rerunSearch = (report) => {
    if (!report.query) {
      alert("❌ Cannot re-run: No query found in report");
      return;
    }

    console.log("Re-running search:", report.query);
    
    // Show cache hint
    if (report.cached) {
      alert("⚡ This search is cached - it will be instant!");
    }
    
    // Dispatch custom event with search query
    window.dispatchEvent(new CustomEvent("osint:auto-search", { 
      detail: { 
        query: report.query,
        field: report.field 
      } 
    }));
    
    // If navigation callback provided, use it to switch tabs
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    } else {
      alert("✅ Search triggered! Switch to Dashboard tab to see results.");
    }
  };

  /* =============================
     DELETE SINGLE REPORT
     ============================= */
  const deleteReport = (reportId) => {
    const updated = history.filter(r => r.id !== reportId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
    setSelectedReport(null);
    window.dispatchEvent(new CustomEvent("osint:reports:updated", { detail: updated }));
  };

  /* =============================
     FILTER REPORTS
     ============================= */
  const filteredReports = history.filter(report => {
    // Size filter
    let sizeMatch = true;
    if (filter === "large") sizeMatch = report.total > 100;
    if (filter === "small") sizeMatch = report.total <= 100;
    
    // Cache filter
    let cacheMatch = true;
    if (cacheFilter === "cached") cacheMatch = report.cached === true;
    if (cacheFilter === "uncached") cacheMatch = report.cached !== true;
    
    return sizeMatch && cacheMatch;
  });

  /* =============================
     CALCULATE STATS
     ============================= */
  const cachedCount = history.filter(r => r.cached).length;

  return (
    <div className="reports-page">
      {/* Page Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">📊 Search Reports</h1>
        <p className="dashboard-subtitle">
          History of all your searches • Click to re-run • ⚡ Cached searches are instant!
        </p>
      </div>

      {/* Reports Header with Stats */}
      <div className="reports-header">
        <div className="reports-stats">
          <div className="stat-card-enhanced stat-blue-enhanced">
            <div className="stat-icon-container">📊</div>
            <div className="stat-content-enhanced">
              <h3>Total Reports</h3>
              <div className="stat-value-enhanced">{history.length}</div>
            </div>
          </div>
          
          <div className="stat-card-enhanced stat-green-enhanced">
            <div className="stat-icon-container">⚡</div>
            <div className="stat-content-enhanced">
              <h3>Cached</h3>
              <div className="stat-value-enhanced">{cachedCount}</div>
            </div>
          </div>

          <div className="stat-card-enhanced stat-orange-enhanced">
            <div className="stat-icon-container">🔍</div>
            <div className="stat-content-enhanced">
              <h3>Filtered</h3>
              <div className="stat-value-enhanced">{filteredReports.length}</div>
            </div>
          </div>
        </div>

        <div className="reports-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className="filter-select"
          >
            <option value="all">All Sizes</option>
            <option value="large">Large (&gt;100)</option>
            <option value="small">Small (≤100)</option>
          </select>

          <select 
            value={cacheFilter} 
            onChange={(e) => setCacheFilter(e.target.value)} 
            className="filter-select"
          >
            <option value="all">All Cache Status</option>
            <option value="cached">⚡ Cached Only</option>
            <option value="uncached">🔍 Uncached Only</option>
          </select>
          
          <button onClick={checkCacheStatus} className="refresh-btn">
            🔄 Refresh Cache Status
          </button>

          <button onClick={clearAll} className="clear-btn">
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="reports-grid">
        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Reports Found</h3>
            <p>Try adjusting your filters or perform some searches</p>
          </div>
        ) : (
          filteredReports.map((report, index) => (
            <div 
              key={report.id || index} 
              className={`report-card ${report.cached ? 'cached' : ''}`}
            >
              {report.cached && (
                <div className="cache-badge">⚡ CACHED - Instant Results</div>
              )}
              
              <div className="report-header">
                <div className="report-icon">
                  {report.total > 100 ? "📈" : "📄"}
                </div>
                <div className="report-title">
                  <h3>{report.query || "Unknown Search"}</h3>
                  <span className={`report-badge ${report.total > 100 ? 'large' : 'small'}`}>
                    {report.total} results
                  </span>
                </div>
              </div>

              <div className="report-details">
                <div className="report-meta">
                  <span>🔎 {report.field || "All fields"}</span>
                  <span>🕐 {report.timestamp}</span>
                </div>
              </div>

              <div className="report-actions">
                <button 
                  className={`btn-action btn-rerun ${report.cached ? 'cached' : ''}`}
                  onClick={() => rerunSearch(report)}
                  title={report.cached ? "⚡ Cached - Instant results!" : "Re-run this search"}
                >
                  {report.cached ? "⚡ Instant Search" : "🔄 Re-run Search"}
                </button>
                <button 
                  className="btn-action btn-view" 
                  onClick={() => setSelectedReport(report)}
                  title="View details"
                >
                  👁️ Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="modal enhanced-modal" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-avatar-large">
                {selectedReport.total > 100 ? "📈" : "📄"}
              </div>
              <div className="modal-title">
                <h2>Search Report Details</h2>
                <p>{selectedReport.query}</p>
              </div>
              <button 
                className="modal-close" 
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Cache Status */}
              {selectedReport.cached && (
                <div className="field-group">
                  <div className="cache-info-banner">
                    ⚡ This search is cached in Redis - re-running will be instant!
                  </div>
                </div>
              )}

              {/* Search Query Info */}
              <div className="field-group">
                <div className="field-group-header">
                  <span className="group-icon">🔎</span>
                  <h4>Search Query</h4>
                </div>
                <div className="report-detail-card">
                  <div className="detail-item">
                    <label>Query</label>
                    <span>{selectedReport.query || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Search Type</label>
                    <span>{selectedReport.field || "All fields"}</span>
                  </div>
                </div>
              </div>

              {/* Results Stats */}
              <div className="field-group">
                <div className="field-group-header">
                  <span className="group-icon">📊</span>
                  <h4>Results</h4>
                </div>
                <div className="results-stats">
                  <div className="stat-mini">
                    <div className="stat-mini-value">{selectedReport.total || 0}</div>
                    <div className="stat-mini-label">Total Results</div>
                  </div>
                  <div className="stat-mini">
                    <div className="stat-mini-value">
                      {selectedReport.total > 100 ? "Large" : "Small"}
                    </div>
                    <div className="stat-mini-label">Size Category</div>
                  </div>
                  <div className="stat-mini">
                    <div className="stat-mini-value">
                      {selectedReport.cached ? "⚡ Yes" : "❌ No"}
                    </div>
                    <div className="stat-mini-label">Cached</div>
                  </div>
                </div>
              </div>

              {/* Timing Info */}
              <div className="field-group">
                <div className="field-group-header">
                  <span className="group-icon">🕐</span>
                  <h4>Timing</h4>
                </div>
                <div className="timestamp">
                  {selectedReport.timestamp}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="delete-btn-enhanced" 
                onClick={() => deleteReport(selectedReport.id)}
              >
                🗑️ Delete Report
              </button>
              
              <button 
                className={`rerun-btn-enhanced ${selectedReport.cached ? 'cached' : ''}`}
                onClick={() => rerunSearch(selectedReport)}
              >
                {selectedReport.cached ? "⚡ Instant Search" : "🔄 Re-run Search"}
              </button>
              
              <button 
                className="export-btn-enhanced" 
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify(selectedReport, null, 2)], 
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `report-${selectedReport.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  alert("✅ Report exported");
                }}
              >
                📤 Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}