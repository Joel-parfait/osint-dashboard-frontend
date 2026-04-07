import React from "react";
import { getCountryFromRecord, getCountryFlag } from "../utils/phoneUtils";
import "../styles.css";

export default function DataTable({ 
  records, 
  onSelect, 
  loading, 
  totalCount, 
  currentPage, 
  totalPages, 
  onPageChange 
}) {

  const formatPhone = (phone) => {
    if (!phone) return "—";
    return phone;
  };

  /* =============================
     LOGIQUE DE PAGINATION DYNAMIQUE
     Génère une fenêtre de pages autour de la page actuelle
     ============================= */
  const getPaginationRange = () => {
    const delta = 2; // Nombre de pages à afficher avant et après la page actuelle
    const range = [];
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    const finalRange = [];
    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          finalRange.push(l + 1);
        } else if (i - l !== 1) {
          finalRange.push('...');
        }
      }
      finalRange.push(i);
      l = i;
    }
    return finalRange;
  };

  return (
    <div className="table-section">
      <div className="table-header-section">
        <h3>OSINT Intelligence Database</h3>
        <div className="table-stats">
          Total : <strong>{totalCount.toLocaleString()}</strong> enregistrements 
          {totalPages > 0 && ` • Page ${currentPage + 1} sur ${totalPages}`}
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
                Accès aux serveurs du CIRT...
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan="5" className="table-empty-cell">
                <div className="empty-icon">🔍</div>
                <div><h4>Aucun résultat</h4><p>Affinez votre recherche globale</p></div>
              </td>
            </tr>
          ) : (
            records.map((r, i) => {
              const country = getCountryFromRecord(r);
              const flag = getCountryFlag(country);
              return (
                <tr key={r.id || i} onClick={() => onSelect(r)} className="data-row">
                  <td>
                    <div className="cell-content">
                      <div className="main-text"><strong>{r.name || "INCONNU"}</strong></div>
                      <div className="sub-text">
                        <span className="badge-sex">{r.sex === 'F' ? '♀️' : '♂️'}</span> 
                        {r.occupation || "—"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      {r.nui && <div className="id-tag">NUI: {r.nui}</div>}
                      {r.facebookId && <div className="fb-tag">FB: {r.facebookId}</div>}
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      <div className="contact-email">{r.email || "—"}</div>
                      <div className="contact-phone">{formatPhone(r.phonenumber)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      <div className="main-text">{r.address1 || "—"}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-content flag-cell">
                      <span className="flag-emoji">{flag}</span>
                      <span className="country-name">{country || "—"}</span>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* PAGINATION SERVEUR AMÉLIORÉE */}
      {totalPages > 1 && (
        <div className="modern-pagination">
          <button 
            className="pagination-btn" 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 0 || loading}
          >
            ‹ Précédent
          </button>
          
          <div className="pagination-pages">
            {getPaginationRange().map((page, index) => (
              page === '...' ? (
                <span key={`dots-${index}`} className="pagination-ellipsis">...</span>
              ) : (
                <button 
                  key={`page-${page}`} 
                  onClick={() => onPageChange(page - 1)} 
                  className={`pagination-page ${page === (currentPage + 1) ? 'active' : ''}`}
                  disabled={loading}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button 
            className="pagination-btn" 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage >= totalPages - 1 || loading}
          >
            Suivant ›
          </button>
        </div>
      )}

      <div className="table-footer">
        <span>Session d'Audit ANTIC • {totalCount.toLocaleString()} entrées identifiées</span>
      </div>
    </div>
  );
}