import React, { useState, useEffect } from "react";
import { getCountryFromRecord, getCountryFlag } from "../utils/phoneUtils";
import "../styles.css";

export default function DataTable({ records, onSelect, loading }) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Réinitialiser la page si les résultats changent
  useEffect(() => {
    setCurrentPage(0);
  }, [records]);

  const totalPages = Math.ceil(records.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecords = records.slice(startIndex, endIndex);

  const formatPhone = (phone) => {
    if (!phone) return "—";
    return phone; // On garde le format brut car les leaks ont des formats variés
  };

  const handlePrevious = () => setCurrentPage(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  const goToPage = (page) => setCurrentPage(page);

  return (
    <div className="table-section">
      <div className="table-header-section">
        <h3>OSINT Intelligence Database</h3>
        <div className="table-stats">
          Affichage {records.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, records.length)} sur {records.length} enregistrements
          {totalPages > 1 && ` • Page ${currentPage + 1} de ${totalPages}`}
        </div>
      </div>

      <table className="data-table sticker-headers">
        <thead>
          <tr>
            <th><div className="sticker-header"><span className="sticker-icon">👤</span><span>IDENTITÉ</span></div></th>
            <th><div className="sticker-header"><span className="sticker-icon">🆔</span><span>IDS (NUI/FB)</span></div></th>
            <th><div className="sticker-header"><span className="sticker-icon">📧</span><span>CONTACT</span></div></th>
            <th><div className="sticker-header"><span className="sticker-icon">🏠</span><span>LOCALISATION</span></div></th>
            <th><div className="sticker-header"><span className="sticker-icon">🌍</span><span>PAYS</span></div></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="table-loading-cell">
                <div className="loading-spinner"></div>
                Chargement des données CIRT...
              </td>
            </tr>
          ) : paginatedRecords.length === 0 ? (
            <tr>
              <td colSpan="5" className="table-empty-cell">
                <div className="empty-icon">🔍</div>
                <div><h4>Aucun résultat</h4><p>Vérifiez l'orthographe ou changez de critères</p></div>
              </td>
            </tr>
          ) : (
            paginatedRecords.map((r, i) => {
              const country = getCountryFromRecord(r);
              const flag = getCountryFlag(country);
              
              return (
                <tr key={r.id || startIndex + i} onClick={() => onSelect(r)} className="data-row">
                  {/* COLONNE IDENTITÉ */}
                  <td>
                    <div className="cell-content">
                      <div className="main-text"><strong>{r.name || "NOM INCONNU"}</strong></div>
                      <div className="sub-text">
                        <span className="badge-sex">{r.sex === 'F' ? '♀️' : '♂️'}</span> 
                        {r.occupation || "Sans profession"}
                      </div>
                    </div>
                  </td>

                  {/* COLONNE IDENTIFIANTS (NUI / FACEBOOK) */}
                  <td>
                    <div className="cell-content">
                      {r.nui && <div className="id-tag">NUI: {r.nui}</div>}
                      {r.facebookId && <div className="fb-tag">FB: {r.facebookId}</div>}
                      {!r.nui && !r.facebookId && <span className="muted">—</span>}
                    </div>
                  </td>

                  {/* COLONNE CONTACT */}
                  <td>
                    <div className="cell-content">
                      <div className="contact-email">{r.email || "Pas d'email"}</div>
                      <div className="contact-phone">{formatPhone(r.phonenumber)}</div>
                    </div>
                  </td>

                  {/* COLONNE LOCALISATION */}
                  <td>
                    <div className="cell-content">
                      <div className="main-text">{r.address1 || "—"}</div>
                      {r.city && <div className="sub-text">{r.city}</div>}
                    </div>
                  </td>

                  {/* COLONNE PAYS */}
                  <td>
                    <div className="cell-content flag-cell">
                      <span className="flag-emoji">{flag}</span>
                      <span className="country-name">{country || "Inconnu"}</span>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {records.length > pageSize && (
        <div className="modern-pagination">
          <button className="pagination-btn" onClick={handlePrevious} disabled={currentPage === 0}>‹ Précédent</button>
          <div className="pagination-pages">
            {/* Logique simplifiée des pages pour Joel */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => (
              <button 
                key={idx} 
                onClick={() => goToPage(idx)} 
                className={`pagination-page ${idx === currentPage ? 'active' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
            {totalPages > 5 && <span className="pagination-ellipsis">...</span>}
          </div>
          <button className="pagination-btn" onClick={handleNext} disabled={currentPage >= totalPages - 1}>Suivant ›</button>
        </div>
      )}
    </div>
  );
}