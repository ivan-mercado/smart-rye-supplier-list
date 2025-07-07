import React, { useState } from "react";

const DEPARTMENTS = [
  "Sales",
  "Marketing",
  "Human Resource",
  "Information Technology",
  "Purchasing",
  "OJT",
  "Applicant",
  "Other"
];

export default function DepartmentSelectModal({ onSelect }) {
  const [selected, setSelected] = useState("");

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.25)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 32px #cfd8dc",
        padding: 32,
        minWidth: 320,
        textAlign: "center"
      }}>
        <h2 style={{ color: "#1976d2", marginBottom: 18 }}>Select Your Department</h2>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1.5px solid #b0bec5",
            fontSize: 18,
            marginBottom: 18
          }}
        >
          <option value="">-- Choose Department --</option>
          {DEPARTMENTS.map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
        <br />
        <button
          disabled={!selected}
          onClick={() => onSelect(selected)}
          style={{
            padding: "10px 28px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            cursor: !selected ? "not-allowed" : "pointer",
            opacity: !selected ? 0.6 : 1
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}