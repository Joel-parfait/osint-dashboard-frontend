import React from "react";
import "../styles.css";

/**
 * StatsPanel optimisé pour la Phase 2.2 (Pagination Serveur)
 * @param {Array} records - Les enregistrements de la page actuelle (pour les calculs locaux)
 * @param {Number} totalCount - Le nombre total réel provenant de la base de données
 */
export default function StatsPanel({ records, totalCount }) {
  
  // Calcul de l'adresse la plus fréquente sur l'échantillon actuel
  const addressCounts = records.reduce((acc, r) => {
    // On vérifie plusieurs champs de localisation possibles dans les leaks
    const address = (r.address1 || r.city || r.placeofwork || "").trim();
    if (address && address !== "—" && address !== "") {
      acc[address] = (acc[address] || 0) + 1;
    }
    return acc;
  }, {});

  const mostCommon = Object.entries(addressCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "Aucune donnée";

  return (
    <div className="stats-panel-enhanced">
      {/* CARTE : TOTAL RÉEL EN BASE */}
      <div className="stat-card-enhanced stat-blue-enhanced">
        <div className="stat-icon-container">
          <div className="stat-icon">📊</div>
        </div>
        <div className="stat-content-enhanced">
          <h3>Total Résultats</h3>
          {/* On affiche totalCount qui est le vrai chiffre global du Backend */}
          <p className="stat-value-enhanced">{(totalCount || 0).toLocaleString()}</p>
        </div>
        <div className="stat-glow"></div>
      </div>
      
      {/* CARTE : ADRESSE LA PLUS COMMUNE (ÉCHANTILLON) */}
      <div className="stat-card-enhanced stat-green-enhanced">
        <div className="stat-icon-container">
          <div className="stat-icon">📍</div>
        </div>
        <div className="stat-content-enhanced">
          <h3>Top Localisation (Page)</h3>
          <p className="stat-value-enhanced" style={{ fontSize: mostCommon.length > 20 ? "1rem" : "1.4rem" }}>
            {mostCommon}
          </p>
        </div>
        <div className="stat-glow"></div>
      </div>

      {/* PETITE INFO DE CONTEXTE (Optionnel pour le CIRT) */}
      <div className="stats-info-tag">
        Analyse basée sur la page actuelle ({records.length} entrées)
      </div>
    </div>
  );
}