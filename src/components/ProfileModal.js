import React from "react";
import { 
  getCountryFromRecord, 
  formatPhoneNumber, 
  getCountryFlag 
} from "../utils/phoneUtils";

export default function ProfileModal({ person, onClose }) {
  if (!person) return null;

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(person, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${person.name || "record"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get country from record
  const country = getCountryFromRecord(person);
  const countryFlag = country ? getCountryFlag(country) : null;

  const fieldGroups = [
    {
      icon: "👤",
      label: "Personal Information",
      fields: [
        { key: "name", label: "Full Name" },
        { key: "sex", label: "Gender" },
        { key: "date_of_birth", label: "Date of Birth" }, // Mis à jour pour correspondre à la BD
        { key: "maritalstatus", label: "Marital Status" } // NOUVEAU
      ]
    },
    {
      icon: "💼",
      label: "Professional Information", 
      fields: [
        { key: "occupation", label: "Occupation" },
        { key: "placeofwork", label: "Place of Work" } // NOUVEAU
      ]
    },
    {
      icon: "📞",
      label: "Contact Details", 
      fields: [
        { key: "email", label: "Email" },
        { 
          key: "phonenumber", 
          label: "Phone Number",
          value: person.phonenumber ? (
            <div>
              <div>{formatPhoneNumber(person.phonenumber)}</div>
              {country && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--muted)', 
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {countryFlag} {country}
                </div>
              )}
            </div>
          ) : "—"
        }
      ]
    },
    {
      icon: "🏠",
      label: "Location",
      fields: [
        { key: "address1", label: "Address 1" },
        { key: "address2", label: "Address 2" },
        { key: "city", label: "City/Town" }, // Mis à jour
        { key: "placeofbirth", label: "Place of Birth" },
        { 
          key: "country", 
          label: "Detected Country",
          value: country ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: 'var(--text)',
              fontWeight: '500'
            }}>
              {countryFlag} {country}
            </div>
          ) : "—"
        }
      ]
    },
    {
      icon: "🆔",
      label: "Identifiers & Meta",
      fields: [
        { key: "nui", label: "NUI (National Unique ID)" },
        { key: "facebookId", label: "Facebook ID" }, // Mis à jour camelCase
        { key: "creationdatetime", label: "Data Indexed On" }, // NOUVEAU
        { key: "raw", label: "Raw Source Reference" } // NOUVEAU
      ]
    }
  ];

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content enhanced-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-avatar-large">{getInitials(person.name)}</div>
          <div className="modal-title">
            <h2>{person.name || "Profile"}</h2>
            <p>{person.occupation || "No occupation specified"}</p>
            {country && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--muted)',
                marginTop: '0.25rem'
              }}>
                <span>{countryFlag}</span>
                <span>Country detected: <strong style={{color: 'white'}}>{country}</strong></span>
              </div>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {fieldGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="field-group">
              <div className="field-group-header">
                <span className="group-icon">{group.icon}</span>
                <h4>{group.label}</h4>
              </div>
              <div className="field-grid">
                {group.fields.map((field) => (
                  (person[field.key] || field.value) && (
                    <div key={field.key} className="field-sticker">
                      <div className="field-sticker-icon">{getFieldIcon(field.key)}</div>
                      <div className="field-sticker-content">
                        <label>{field.label}</label>
                        <span>{field.value || person[field.key]}</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={handleExport} className="export-btn-enhanced">
            <span className="btn-icon">📤</span>
            Export This Record
          </button>
          <button onClick={onClose} className="close-btn-enhanced">
            <span className="btn-icon">✖</span>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function getFieldIcon(fieldKey) {
  const icons = {
    name: "👤",
    sex: "⚧",
    date_of_birth: "📅", 
    maritalstatus: "💍",
    occupation: "💼",
    placeofwork: "🏢",
    email: "📧",
    phonenumber: "📱",
    address1: "🏠",
    address2: "📍",
    city: "🏙️",
    placeofbirth: "🌍",
    nui: "🆔",
    facebookId: "👥",
    creationdatetime: "🕒",
    raw: "📄",
    country: "🌐"
  };
  return icons[fieldKey] || "📄";
}