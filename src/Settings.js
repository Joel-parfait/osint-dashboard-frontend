import React, { useEffect, useState } from "react";

const REPORTS_KEY = "osint_search_history_v1";
const AUTO_REFRESH_KEY = "osint_auto_refresh_v1";
const CHART_LIMIT_KEY = "osint_chart_limit_v1";
const EXPORT_FORMAT_KEY = "osint_export_format_v1";

/**
 * Settings Component - Collapsible Accordion Style
 * 
 * FEATURES:
 * - Collapsible sections to reduce clutter
 * - System preferences (dark mode, auto-refresh)
 * - Chart display settings
 * - Data export options
 * - Backend validation
 * - Redis Cache Management
 * - Data management
 * - Password change
 */
export default function Settings({ darkMode, setDarkMode }) {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [chartLimit, setChartLimit] = useState(10);
  const [exportFormat, setExportFormat] = useState("json");
  const [backendStatus, setBackendStatus] = useState({ ok: null, msg: "", sourcesCount: null });
  const [isValidating, setIsValidating] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Cache management state
  const [cacheStats, setCacheStats] = useState(null);
  const [redisStatus, setRedisStatus] = useState(null);
  const [isLoadingCache, setIsLoadingCache] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  // Accordion state - track which sections are open
  const [openSections, setOpenSections] = useState({
    system: true,
    display: false,
    backend: false,
    redis: false,
    cache: false,
    data: false,
    password: false,
  });

  // Toggle section open/close
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Load saved preferences
  useEffect(() => {
    try {
      const savedRefresh = localStorage.getItem(AUTO_REFRESH_KEY);
      setAutoRefresh(savedRefresh === "1");

      const savedLimit = localStorage.getItem(CHART_LIMIT_KEY);
      if (savedLimit) setChartLimit(Number(savedLimit));

      const savedFormat = localStorage.getItem(EXPORT_FORMAT_KEY);
      if (savedFormat) setExportFormat(savedFormat);
    } catch (e) {
      console.error("Failed to load settings:", e);
    }

    // Load cache stats on mount
    loadCacheStats();
  }, []);

  /* ================================
     Preference Handlers
  ================================= */
  const toggleAutoRefresh = () => {
    const next = !autoRefresh;
    setAutoRefresh(next);
    try {
      localStorage.setItem(AUTO_REFRESH_KEY, next ? "1" : "0");
    } catch (e) {
      console.error("Failed to save auto-refresh:", e);
    }
  };

  const handleChartLimit = (value) => {
    const num = Math.max(5, Math.min(50, Number(value || 10)));
    setChartLimit(num);
    try {
      localStorage.setItem(CHART_LIMIT_KEY, String(num));
      window.dispatchEvent(new CustomEvent("osint:chart-limit-changed", { detail: { limit: num } }));
    } catch (e) {
      console.error("Failed to save chart limit:", e);
    }
  };

  const handleExportFormat = (format) => {
    setExportFormat(format);
    try {
      localStorage.setItem(EXPORT_FORMAT_KEY, format);
    } catch (e) {
      console.error("Failed to save export format:", e);
    }
  };

  /* ================================
     Backend Validation
  ================================= */
  const validateBackend = async () => {
    setIsValidating(true);

    try {
      let ok = false;
      let msg = "";
      let sourcesCount = null;

      try {
        const healthRes = await fetch("http://localhost:8080/search/health");
        if (healthRes.ok) {
          ok = true;
          msg = "Health check passed";
        }
      } catch (e) {}

      try {
        const sourcesRes = await fetch("http://localhost:8080/sources");
        if (sourcesRes.ok) {
          const data = await sourcesRes.json();
          sourcesCount = Array.isArray(data) ? data.length : 0;
          ok = true;
          msg = ok ? `${msg} • Sources accessible` : "Sources accessible";
        }
      } catch (e) {
        if (!ok) msg = `Connection failed: ${e.message}`;
      }

      setBackendStatus({ ok, msg, sourcesCount });
      alert(ok ? `✅ Backend healthy!\n${msg}` : `❌ Backend failed!\n${msg}`);
    } catch (e) {
      console.error("Validation error:", e);
      setBackendStatus({ ok: false, msg: e.message || "Unknown error", sourcesCount: null });
      alert("❌ Backend validation failed");
    } finally {
      setIsValidating(false);
    }
  };

  /* ================================
     Cache Management
  ================================= */
  const loadCacheStats = async () => {
    setIsLoadingCache(true);
    try {
      const statsRes = await fetch("http://localhost:8080/api/cache/stats");
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setCacheStats(stats);
      }

      const healthRes = await fetch("http://localhost:8080/api/cache/health");
      if (healthRes.ok) {
        const health = await healthRes.json();
        setRedisStatus(health);
      }
    } catch (e) {
      console.error("Failed to load cache stats:", e);
      setRedisStatus({ redis: "disconnected", status: "error" });
    } finally {
      setIsLoadingCache(false);
    }
  };

  const clearAllCaches = async () => {
    if (!window.confirm("⚠️ Clear all Redis caches? This will slow down the next searches.")) return;
    
    setIsClearingCache(true);
    try {
      const res = await fetch("http://localhost:8080/api/cache/clear", { method: "POST" });
      if (res.ok) {
        alert("✅ All caches cleared successfully!");
        loadCacheStats();
      } else {
        alert("❌ Failed to clear caches");
      }
    } catch (e) {
      console.error("Clear cache error:", e);
      alert("❌ Error clearing caches");
    } finally {
      setIsClearingCache(false);
    }
  };

  const clearSpecificCache = async (type) => {
    if (!window.confirm(`⚠️ Clear ${type} cache?`)) return;
    
    try {
      const res = await fetch(`http://localhost:8080/api/cache/clear/${type}`, { method: "POST" });
      if (res.ok) {
        alert(`✅ ${type} cache cleared!`);
        loadCacheStats();
      } else {
        alert(`❌ Failed to clear ${type} cache`);
      }
    } catch (e) {
      console.error(`Clear ${type} cache error:`, e);
      alert(`❌ Error clearing ${type} cache`);
    }
  };

  /* ================================
     Data Export & Management
  ================================= */
  const exportReports = () => {
    try {
      const raw = localStorage.getItem(REPORTS_KEY);
      const reports = raw ? JSON.parse(raw) : [];
      if (!reports || reports.length === 0) return alert("⚠️ No reports found");

      const timestamp = new Date().toISOString().split('T')[0];

      if (exportFormat === "json") {
        const blob = new Blob([JSON.stringify(reports, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `osint-reports-${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === "csv") {
        const headers = ["Timestamp", "Query", "Type", "Total Results"];
        const rows = reports.map(r => `"${r.timestamp}","${r.query}","${r.field}","${r.total}"`);
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `osint-reports-${timestamp}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === "pdf") {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>OSINT Reports</title>
            <style>
              body { font-family: Arial; padding: 40px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 8px; border: 1px solid #ddd; }
              th { background-color: #3b82f6; color: white; }
            </style>
          </head>
          <body>
            <h1>OSINT Reports</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <table>
              <thead>
                <tr><th>Timestamp</th><th>Query</th><th>Type</th><th>Results</th></tr>
              </thead>
              <tbody>
                ${reports.map(r => `<tr><td>${r.timestamp}</td><td>${r.query}</td><td>${r.field}</td><td>${r.total}</td></tr>`).join('')}
              </tbody>
            </table>
          </body>
          </html>`;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
      }
    } catch (e) { console.error("Export failed:", e); }
  };

  const clearLocalReports = () => {
    if (!window.confirm("⚠️ Clear all search history?")) return;
    localStorage.removeItem(REPORTS_KEY);
    window.dispatchEvent(new CustomEvent("osint:reports:updated", { detail: [] }));
    alert("✅ Search history cleared!");
  };

  const resetSettings = () => {
    if (!window.confirm("⚠️ Reset all settings to defaults?")) return;
    localStorage.removeItem(CHART_LIMIT_KEY);
    localStorage.removeItem(EXPORT_FORMAT_KEY);
    localStorage.removeItem(AUTO_REFRESH_KEY);
    setChartLimit(10);
    setExportFormat("json");
    setAutoRefresh(false);
    alert("✅ Settings reset to defaults!");
  };

  /* ================================
     Password Change Handler
  ================================= */
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return alert("⚠️ Fill all fields");
    }
    if (newPassword !== confirmPassword) {
      return alert("❌ Passwords do not match");
    }
    if (newPassword.length < 6) {
      return alert("⚠️ New password must be at least 6 characters");
    }

    let username = null;
    try {
      const possibleKeys = ["osint_user", "user", "currentUser", "userData"];
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.username) {
              username = parsed.username;
              break;
            }
          } catch (e) {
            if (data && typeof data === 'string' && !data.startsWith('{')) {
              username = data;
              break;
            }
          }
        }
      }

      if (!username) {
        return alert("❌ User not logged in. Please log in again.");
      }
    } catch (e) {
      console.error("Error reading user data:", e);
      return alert("❌ Error reading user data. Please log in again.");
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("http://localhost:8080/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username,
          oldPassword: currentPassword, 
          newPassword: newPassword 
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert("✅ Password changed successfully!");
        setCurrentPassword(""); 
        setNewPassword(""); 
        setConfirmPassword("");
      } else {
        alert(`❌ Failed: ${data.message || "Unknown error"}`);
      }
    } catch (e) {
      console.error("Password change error:", e); 
      alert(`❌ Error connecting to server: ${e.message}`);
    } finally { 
      setIsChangingPassword(false); 
    }
  };

  /* ================================
     JSX - Collapsible Accordion
  ================================= */
  return (
    <div className="settings-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">⚙️ Settings</h1>
        <p className="dashboard-subtitle">Configure your OSINT Intelligence Platform</p>
      </div>

      <div className="settings-accordion">

        {/* System Preferences */}
        <div className={`accordion-section ${openSections.system ? 'open' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('system')}>
            <div className="accordion-title">
              <span className="settings-icon">🎨</span>
              <h3>System Preferences</h3>
            </div>
            <span className="accordion-arrow">{openSections.system ? '▼' : '▶'}</span>
          </div>
          {openSections.system && (
            <div className="accordion-content">
              <div className="settings-options">
                <div className="setting-item">
                  <label>Dark Mode</label>
                  <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                </div>
                <div className="setting-item">
                  <label>Auto-Refresh</label>
                  <input type="checkbox" checked={autoRefresh} onChange={toggleAutoRefresh} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Display Settings */}
        <div className={`accordion-section ${openSections.display ? 'open' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('display')}>
            <div className="accordion-title">
              <span className="settings-icon">📊</span>
              <h3>Display Settings</h3>
            </div>
            <span className="accordion-arrow">{openSections.display ? '▼' : '▶'}</span>
          </div>
          {openSections.display && (
            <div className="accordion-content">
              <div className="settings-options">
                <div className="setting-item">
                  <label>Top Addresses to Display</label>
                  <input type="number" value={chartLimit} onChange={e => handleChartLimit(e.target.value)} min={5} max={50} />
                </div>
                <div className="setting-item">
                  <label>Export Format</label>
                  <select value={exportFormat} onChange={e => handleExportFormat(e.target.value)}>
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Backend Status */}
        <div className={`accordion-section ${openSections.backend ? 'open' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('backend')}>
            <div className="accordion-title">
              <span className="settings-icon">🔌</span>
              <h3>Backend Status</h3>
              <span className="status-indicator">
                {backendStatus.ok === null ? "⚪" : backendStatus.ok ? "✅" : "❌"}
              </span>
            </div>
            <span className="accordion-arrow">{openSections.backend ? '▼' : '▶'}</span>
          </div>
          {openSections.backend && (
            <div className="accordion-content">
              <div className="backend-status">
                <div style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
                  {backendStatus.ok === null ? "⚪ Not Checked" : 
                   backendStatus.ok ? "✅ Connected" : "❌ Disconnected"}
                </div>
                {backendStatus.msg && (
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    {backendStatus.msg}
                  </div>
                )}
                <button onClick={validateBackend} disabled={isValidating}>
                  {isValidating ? "🔄 Validating..." : "🔍 Validate Backend"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Redis Cache Status */}
        <div className={`accordion-section ${openSections.redis ? 'open' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('redis')}>
            <div className="accordion-title">
              <span className="settings-icon">⚡</span>
              <h3>Redis Cache Status</h3>
              <span className="status-indicator">
                {redisStatus ? (redisStatus.redis === "connected" ? "✅" : "❌") : "⚪"}
              </span>
            </div>
            <span className="accordion-arrow">{openSections.redis ? '▼' : '▶'}</span>
          </div>
          {openSections.redis && (
            <div className="accordion-content">
              <div className="backend-status">
                <div style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
                  {redisStatus ? (
                    redisStatus.redis === "connected" ? "✅ Redis Connected" : "❌ Redis Disconnected"
                  ) : "⚪ Not Checked"}
                </div>
                {cacheStats && cacheStats.caches && (
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    {cacheStats.caches.map(cache => (
                      <div key={cache.name} style={{ marginBottom: '0.5rem' }}>
                        <strong>{cache.name}:</strong> {cache.size} entries
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={loadCacheStats} disabled={isLoadingCache}>
                  {isLoadingCache ? "🔄 Loading..." : "🔄 Refresh Stats"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cache Management */}
        <div className={`accordion-section ${openSections.cache ? 'open' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('cache')}>
            <div className="accordion-title">
              <span className="settings-icon">🗄️</span>
              <h3>Cache Management</h3>
            </div>
            <span className="accordion-arrow">{openSections.cache ? '▼' : '▶'}</span>
          </div>
          {openSections.cache && (
            <div className="accordion-content">
              <div className="settings-actions">
                <button onClick={clearAllCaches} disabled={isClearingCache}>
                  {isClearingCache ? "🔄 Clearing..." : "🗑️ Clear All Caches"}
                </button>
                <button onClick={() => clearSpecificCache('name')}>Clear Name Cache</button>
                <button onClick={() => clearSpecificCache('phone')}>Clear Phone Cache</button>
                <button onClick={() => clearSpecificCache('email')}>Clear Email Cache</button>
                <button onClick={() => clearSpecificCache('address')}>Clear Address Cache</button>
              </div>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className={`accordion-section ${openSections.data ? 'open' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('data')}>
            <div className="accordion-title">
              <span className="settings-icon">💾</span>
              <h3>Data Management</h3>
            </div>
            <span className="accordion-arrow">{openSections.data ? '▼' : '▶'}</span>
          </div>
          {openSections.data && (
            <div className="accordion-content">
              <div className="settings-actions">
                <button onClick={exportReports}>📤 Export Reports ({exportFormat.toUpperCase()})</button>
                <button onClick={clearLocalReports}>🗑️ Clear Search History</button>
                <button onClick={resetSettings}>🔄 Reset to Defaults</button>
              </div>
            </div>
          )}
        </div>

        {/* Password Change */}
        <div className={`accordion-section ${openSections.password ? 'open' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('password')}>
            <div className="accordion-title">
              <span className="settings-icon">🔒</span>
              <h3>Change Password</h3>
            </div>
            <span className="accordion-arrow">{openSections.password ? '▼' : '▶'}</span>
          </div>
          {openSections.password && (
            <div className="accordion-content">
              <div className="settings-options">
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                />
                <input 
                  type="password" 
                  placeholder="New Password (min 6 chars)" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                />
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                />
                <button onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword ? "🔄 Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}