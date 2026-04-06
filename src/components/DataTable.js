import React, { useState } from "react";
import { getCountryFromRecord, getCountryFlag } from "../utils/phoneUtils"; // ADDED: Import flag function
import "../styles.css";

export default function DataTable({ records, onSelect, loading }) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const totalPages = Math.ceil(records.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecords = records.slice(startIndex, endIndex);

  const formatPhone = (phone) => {
    if (!phone) return "—";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 9) return phone;
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(0, Math.min(totalPages - 1, page)));
  };

  return (
    <div className="table-section">
      <div className="table-header-section">
        <h3>Search Intelligence Database</h3>
        <div className="table-stats">
          Showing {startIndex + 1}-{Math.min(endIndex, records.length)} of {records.length} records
          {totalPages > 1 && ` • Page ${currentPage + 1} of ${totalPages}`}
        </div>
      </div>

      <table className="data-table sticker-headers">
        <thead>
          <tr>
            <th>
              <div className="sticker-header">
                <span className="sticker-icon">👤</span>
                <span>NAME</span>
              </div>
            </th>
            <th>
              <div className="sticker-header">
                <span className="sticker-icon">📧</span>
                <span>EMAIL</span>
              </div>
            </th>
            <th>
              <div className="sticker-header">
                <span className="sticker-icon">📱</span>
                <span>PHONE</span>
              </div>
            </th>
            <th>
              <div className="sticker-header">
                <span className="sticker-icon">🏠</span>
                <span>ADDRESS</span>
              </div>
            </th>
            {/* NEW: Country column */}
            <th>
              <div className="sticker-header">
                <span className="sticker-icon">🌍</span>
                <span>COUNTRY</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="table-loading-cell">
                <div className="loading-spinner"></div>
                Loading intelligence data...
              </td>
            </tr>
          ) : paginatedRecords.length === 0 ? (
            <tr>
              <td colSpan="5" className="table-empty-cell">
                <div className="empty-icon">🔍</div>
                <div>
                  <h4>No records found</h4>
                  <p>Try adjusting your search criteria</p>
                </div>
              </td>
            </tr>
          ) : (
            paginatedRecords.map((r, i) => {
              // Get country from record
              const country = getCountryFromRecord(r);
              const flag = getCountryFlag(country);
              
              return (
                <tr key={startIndex + i} onClick={() => onSelect(r)} className="data-row">
                  <td>
                    <div className="cell-content">
                      <strong>{r.name || "—"}</strong>
                      {r.occupation && <div className="cell-subtitle">{r.occupation}</div>}
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      {r.email || "—"}
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      {formatPhone(r.phonenumber)}
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      {r.address1 || r.placeofbirth || "—"}
                    </div>
                  </td>
                  {/* NEW: Country cell with flag */}
                  <td>
                    <div className="cell-content" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }}>
                      {country ? (
                        <>
                          <span style={{ fontSize: '18px' }}>{flag}</span>
                          <span>{country}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {records.length > pageSize && (
        <div className="modern-pagination">
          <button 
            className="pagination-btn" 
            onClick={handlePrevious}
            disabled={currentPage === 0}
          >
            ‹ Previous
          </button>
          
          <div className="pagination-pages">
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;
              let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
              let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
              
              // Adjust if we're near the start
              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(0, endPage - maxVisiblePages + 1);
              }
              
              // First page
              if (startPage > 0) {
                pages.push(
                  <button key={0} onClick={() => goToPage(0)} className="pagination-page">
                    1
                  </button>
                );
                if (startPage > 1) {
                  pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
                }
              }
              
              // Page numbers
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button 
                    key={i} 
                    onClick={() => goToPage(i)} 
                    className={`pagination-page ${i === currentPage ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                );
              }
              
              // Last page
              if (endPage < totalPages - 1) {
                if (endPage < totalPages - 2) {
                  pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
                }
                pages.push(
                  <button key={totalPages - 1} onClick={() => goToPage(totalPages - 1)} className="pagination-page">
                    {totalPages}
                  </button>
                );
              }
              
              return pages;
            })()}
          </div>
          
          <button 
            className="pagination-btn" 
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
          >
            Next ›
          </button>
        </div>
      )}

      <div className="table-footer">
        <span>OSINT Intelligence Platform • {records.length} records loaded • Page {currentPage + 1} of {totalPages}</span>
      </div>
    </div>
  );
}