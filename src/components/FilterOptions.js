import React, { useState, useEffect } from "react";
import { getCountryFromRecord } from "../utils/phoneUtils";

/**
 * FilterOptions Component
 * 
 * Provides a smart input with autocomplete suggestions
 * based on unique values in the selected field
 * 
 * SPECIAL HANDLING:
 * - sex field: Shows only M/F options
 * - country field: Extracts from multiple sources
 * - Other fields: Gets unique values directly
 */
export default function FilterOptions({ 
  records, 
  field, 
  value, 
  onChange,
  placeholder = "Select or type..." 
}) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    if (!records || !field) return;

    let uniqueValues = [];
    
    // SPECIAL: Sex field - detect Male/Female or M/F
    if (field === "sex") {
      const sexValues = records
        .map(r => String(r.sex || "").trim().toLowerCase())
        .filter(val => val.length > 0);
      
      const uniqueSex = [...new Set(sexValues)];
      
      console.log("Detected sex values:", uniqueSex);
      
      // Check if data uses Male/Female or M/F
      const hasMale = uniqueSex.some(v => v === "male" || v === "m");
      const hasFemale = uniqueSex.some(v => v === "female" || v === "f");
      
      if (hasMale && hasFemale) {
        // Determine format from data
        if (uniqueSex.includes("male")) {
          uniqueValues = ["Male", "Female"];
        } else if (uniqueSex.includes("m")) {
          uniqueValues = ["M", "F"];
        } else {
          uniqueValues = uniqueSex.map(v => {
            if (v === "male" || v === "m") return "Male";
            if (v === "female" || v === "f") return "Female";
            return v;
          });
        }
      } else {
        uniqueValues = uniqueSex;
      }
    } 
    // Country field - extract from multiple sources
    else if (field === "country") {
      const countrySet = new Set();
      records.forEach(r => {
        const country = getCountryFromRecord(r);
        if (country) {
          countrySet.add(country);
        }
      });
      uniqueValues = Array.from(countrySet).sort();
    } 
    // Other fields - direct values
    else {
      const values = records
        .map(r => r[field])
        .filter(val => val && String(val).trim() !== "")
        .map(val => String(val).trim());
      
      uniqueValues = [...new Set(values)].sort();
    }
    
    console.log(`Filter options for ${field}:`, uniqueValues.slice(0, 10));
    setOptions(uniqueValues);
  }, [records, field]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  // Special: If sex field, show dropdown instead of datalist
  if (field === "sex") {
    return (
      <select
        value={inputValue}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "0.75rem",
          border: "2px solid var(--border-color, #e5e7eb)",
          borderRadius: "10px",
          background: "var(--card)",
          color: "var(--text)",
          fontSize: "0.9rem",
          cursor: "pointer",
        }}
      >
        <option value="">Select sex...</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option === "Male" || option === "M" ? "👨 Male" : ""}
            {option === "Female" || option === "F" ? "👩 Female" : ""}
            {option !== "Male" && option !== "Female" && option !== "M" && option !== "F" ? option : ""}
          </option>
        ))}
      </select>
    );
  }

  // For other fields, use datalist input
  return (
    <div style={{ position: "relative", width: "100%", flex: 1 }}>
      <input
        list={`${field}-options`}
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "0.75rem",
          border: "2px solid var(--border-color, #e5e7eb)",
          borderRadius: "10px",
          background: "var(--card)",
          color: "var(--text)",
          fontSize: "0.9rem",
        }}
      />
      <datalist id={`${field}-options`}>
        {options.map((option, index) => (
          <option key={index} value={option} />
        ))}
      </datalist>
      
      {options.length > 0 && (
        <div style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "0.75rem",
          color: "var(--muted)",
          pointerEvents: "none"
        }}>
          {options.length} options
        </div>
      )}
    </div>
  );
}