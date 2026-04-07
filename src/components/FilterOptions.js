import React, { useState, useEffect } from "react";
import { getCountryFromRecord } from "../utils/phoneUtils";

/**
 * FilterOptions Component - Version Corrigée (Contrôlée)
 * Synchronisé avec le Dashboard pour le bouton Réinitialiser.
 */
export default function FilterOptions({ 
  records, 
  field, 
  value, // Cette prop vient du Dashboard
  onChange,
  placeholder = "Sélectionner ou taper..." 
}) {
  const [options, setOptions] = useState([]);

  // Génération des options (Pays, Sexe, etc.)
  useEffect(() => {
    if (!records || !field) {
      setOptions([]);
      return;
    }

    let uniqueValues = [];
    
    // Cas spécial: SEXE
    if (field === "sex") {
      const sexValues = records
        .map(r => String(r.sex || "").trim().toUpperCase()) // On harmonise en Majuscule
        .filter(val => val.length > 0);
      
      const uniqueSex = [...new Set(sexValues)];
      
      // On s'assure d'avoir un format propre M/F ou Male/Female
      uniqueValues = uniqueSex.map(v => {
        if (v === "M" || v === "MALE") return "M";
        if (v === "F" || v === "FEMALE") return "F";
        return v;
      }).sort();
    } 
    // Cas spécial: PAYS
    else if (field === "country") {
      const countrySet = new Set();
      records.forEach(r => {
        const country = getCountryFromRecord(r);
        if (country) countrySet.add(country);
      });
      uniqueValues = Array.from(countrySet).sort();
    } 
    // Autres champs (address1, occupation)
    else {
      const values = records
        .map(r => r[field])
        .filter(val => val && String(val).trim() !== "")
        .map(val => String(val).trim());
      
      uniqueValues = [...new Set(values)].sort();
    }
    
    setOptions(uniqueValues);
  }, [records, field]);

  // IMPORTANT : On utilise directement la prop 'value' du Dashboard
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const commonStyles = {
    width: "100%",
    padding: "0.75rem",
    border: "2px solid var(--border-color, #e5e7eb)",
    borderRadius: "10px",
    background: "var(--card, #fff)",
    color: "var(--text, #000)",
    fontSize: "0.9rem",
    outline: "none"
  };

  // Affichage spécifique pour le SEXE (Menu déroulant)
  if (field === "sex") {
    return (
      <select
        value={value} // LIÉ AU DASHBOARD
        onChange={handleChange}
        style={{ ...commonStyles, cursor: "pointer" }}
      >
        <option value="">Sélectionner sexe...</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option === "M" ? "👨 Masculin (M)" : option === "F" ? "👩 Féminin (F)" : option}
          </option>
        ))}
      </select>
    );
  }

  // Affichage standard (Input avec suggestions)
  return (
    <div style={{ position: "relative", width: "100%", flex: 1 }}>
      <input
        list={`${field}-options`}
        value={value} // LIÉ AU DASHBOARD (Se vide quand value = "")
        onChange={handleChange}
        placeholder={placeholder}
        style={commonStyles}
      />
      <datalist id={`${field}-options`}>
        {options.map((option, index) => (
          <option key={index} value={option} />
        ))}
      </datalist>
      
      {options.length > 0 && field && (
        <div style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "0.75rem",
          color: "#888",
          pointerEvents: "none"
        }}>
          {options.length} suggestions
        </div>
      )}
    </div>
  );
}