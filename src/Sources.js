import React, { useEffect, useState } from "react";

/**
 * Sources Component
 * 
 * PURPOSE: Manage data sources for the OSINT platform
 * 
 * FEATURES:
 * - View all sources in a grid layout
 * - Add new sources with name, description, and URL
 * - Edit existing sources (opens modal with form)
 * - Delete sources with confirmation dialog
 * - View source details in a modal
 * 
 * STATE MANAGEMENT:
 * - sources: Array of all sources from backend
 * - newSource: Form data for adding new source
 * - loading: Loading state for fetch operations
 * - viewing: Currently viewed source (modal)
 * - editing: Currently edited source (modal)
 * - editForm: Form data for editing
 * 
 * BACKEND ENDPOINTS REQUIRED:
 * - GET /sources - Fetch all sources
 * - POST /sources - Create new source
 * - PUT /sources/:id - Update existing source
 * - DELETE /sources/:id - Delete source
 */
export default function Sources() {
  const [sources, setSources] = useState([]);
  const [newSource, setNewSource] = useState({ name: "", description: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", url: "" });

  /* =============================
     FETCH ALL SOURCES
     Called on component mount
     ============================= */
  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/sources");
      const data = await res.json();
      setSources(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchSources error:", e);
      setSources([]);
      alert("⚠️ Failed to fetch sources. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     ADD NEW SOURCE
     Validates name, sends POST request
     ============================= */
  const addSource = async () => {
    if (!newSource.name.trim()) {
      return alert("❌ Name is required");
    }
    
    try {
      const res = await fetch("http://localhost:8080/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSource),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Success! Clear form and refresh list
      setNewSource({ name: "", description: "", url: "" });
      fetchSources();
      alert("✅ Source added successfully!");
      
    } catch (e) {
      console.error("addSource error:", e);
      alert(`❌ Failed to add source: ${e.message}`);
    }
  };

  /* =============================
     EDIT SOURCE - START
     Opens edit modal with current values
     ============================= */
  const startEdit = (source) => {
    setEditing(source);
    setEditForm({
      name: source.name || "",
      description: source.description || "",
      url: source.url || ""
    });
  };

  /* =============================
     EDIT SOURCE - SAVE
     Sends PUT request to update source
     Requires backend endpoint: PUT /sources/:id
     ============================= */
  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      return alert("❌ Name is required");
    }
    
    try {
      const res = await fetch(`http://localhost:8080/sources/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Success! Close modal and refresh list
      setEditing(null);
      setEditForm({ name: "", description: "", url: "" });
      fetchSources();
      alert("✅ Source updated successfully!");
      
    } catch (e) {
      console.error("saveEdit error:", e);
      alert(`❌ Failed to update source: ${e.message}\n\nMake sure your backend has PUT /sources/:id endpoint`);
    }
  };

  /* =============================
     EDIT SOURCE - CANCEL
     Closes modal without saving
     ============================= */
  const cancelEdit = () => {
    setEditing(null);
    setEditForm({ name: "", description: "", url: "" });
  };

  /* =============================
     DELETE SOURCE
     Shows confirmation, sends DELETE request
     Requires backend endpoint: DELETE /sources/:id
     ============================= */
  const deleteSource = async (source) => {
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to delete "${source.name}"?\n\n` +
      `This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      const res = await fetch(`http://localhost:8080/sources/${source.id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Success! Refresh list
      fetchSources();
      alert("✅ Source deleted successfully!");
      
    } catch (e) {
      console.error("deleteSource error:", e);
      alert(`❌ Failed to delete source: ${e.message}\n\nMake sure your backend has DELETE /sources/:id endpoint`);
    }
  };

  /* =============================
     COMPONENT MOUNT
     Fetch sources when component loads
     ============================= */
  useEffect(() => {
    fetchSources();
  }, []);

  /* =============================
     RENDER
     ============================= */
  return (
    <div className="sources-page">
      {/* Page Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">📚 Data Sources</h1>
        <p className="dashboard-subtitle">Manage and monitor your intelligence sources</p>
      </div>

      {/* Add Source Card */}
      <div className="source-add-card">
        <h3>➕ Add New Source</h3>
        <div className="source-form">
          <input
            placeholder="Source Name *"
            value={newSource.name}
            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
            className="source-input"
          />
          <input
            placeholder="Description"
            value={newSource.description}
            onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
            className="source-input"
          />
          <input
            placeholder="URL (optional)"
            value={newSource.url}
            onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
            className="source-input"
          />
          <button onClick={addSource} className="source-add-btn">
            + Add Source
          </button>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="sources-grid-enhanced">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            Loading sources...
          </div>
        ) : sources.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No Sources Found</h3>
            <p>Add your first data source to get started</p>
          </div>
        ) : (
          sources.map((source, index) => (
            <div key={source.id || index} className="source-card-enhanced">
              {/* Card Header */}
              <div className="source-card-header">
                <div className="source-icon">
                  {source.name?.charAt(0).toUpperCase()}
                </div>
                <div className="source-title">
                  <h3>{source.name}</h3>
                  <span className="source-status active">✓ Active</span>
                </div>
              </div>
              
              {/* Description */}
              <div className="source-description">
                {source.description || "No description provided"}
              </div>

              {/* URL Link */}
              {source.url && (
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="source-link"
                >
                  🔗 Visit Source
                </a>
              )}

              {/* Action Buttons */}
              <div className="source-actions">
                <button 
                  className="btn-action btn-view" 
                  onClick={() => setViewing(source)}
                  title="View details"
                >
                  👁️ View
                </button>
                <button 
                  className="btn-action btn-edit" 
                  onClick={() => startEdit(source)}
                  title="Edit source"
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn-action btn-delete" 
                  onClick={() => deleteSource(source)}
                  title="Delete source"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =============================
          VIEW SOURCE MODAL
          Shows source details
          ============================= */}
      {viewing && (
        <div className="modal enhanced-modal" onClick={() => setViewing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-avatar-large">
                {viewing.name?.charAt(0).toUpperCase()}
              </div>
              <div className="modal-title">
                <h2>{viewing.name}</h2>
                <p>Data Source Details</p>
              </div>
              <button className="modal-close" onClick={() => setViewing(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="field-group">
                <div className="field-group-header">
                  <span className="group-icon">📝</span>
                  <h4>Description</h4>
                </div>
                <div className="source-detail">
                  {viewing.description || "No description available"}
                </div>
              </div>

              {viewing.url && (
                <div className="field-group">
                  <div className="field-group-header">
                    <span className="group-icon">🔗</span>
                    <h4>URL</h4>
                  </div>
                  <a 
                    href={viewing.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="source-url"
                  >
                    {viewing.url}
                  </a>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="close-btn-enhanced" onClick={() => setViewing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================
          EDIT SOURCE MODAL
          Form to update source
          ============================= */}
      {editing && (
        <div className="modal enhanced-modal" onClick={cancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-avatar-large">
                {editing.name?.charAt(0).toUpperCase()}
              </div>
              <div className="modal-title">
                <h2>✏️ Edit Source</h2>
                <p>Update source information</p>
              </div>
              <button className="modal-close" onClick={cancelEdit}>×</button>
            </div>

            <div className="modal-body">
              {/* Name Field */}
              <div className="field-group">
                <label className="field-label">
                  Source Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="source-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter source name"
                />
              </div>

              {/* Description Field */}
              <div className="field-group">
                <label className="field-label">Description</label>
                <textarea
                  className="source-input"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter description"
                  rows="4"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* URL Field */}
              <div className="field-group">
                <label className="field-label">URL</label>
                <input
                  type="text"
                  className="source-input"
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  placeholder="Enter URL (optional)"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn-enhanced" onClick={cancelEdit}>
                Cancel
              </button>
              <button className="save-btn-enhanced" onClick={saveEdit}>
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}