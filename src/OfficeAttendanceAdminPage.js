import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import html2canvas from "html2canvas";
// import { useNavigate } from "react-router-dom";

import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "./firebase";

export default function OfficeAttendanceAdminPage({ user }) {
  const [officeWorkers, setOfficeWorkers] = useState([]);
  const [selectedPresent, setSelectedPresent] = useState([]);
  const [selectedAbsent, setSelectedAbsent] = useState([]);
  const [showWorkers, setShowWorkers] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const resultsRef = useRef(null);
//   const navigate = useNavigate();


  // Fetch office workers list
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "officeWorkers"), (snapshot) => {
      setOfficeWorkers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return () => unsub();
  }, []);

  // Fetch attendance submissions
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "attendanceOfficeAdmin"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setSubmissions(sorted);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPresent.length && !selectedAbsent.length) return alert("Please select present or absent workers");

    await addDoc(collection(db, "attendanceOfficeAdmin"), {
      present: selectedPresent.map((w) => w.label),
      absent: selectedAbsent.map((w) => w.label),
      createdBy: user?.email || "Unknown",
      timestamp: serverTimestamp(),
    });

    setSelectedPresent([]);
    setSelectedAbsent([]);
  };

  const updateWorker = async (worker) => {
  if (!worker.name.trim()) return alert("Worker name cannot be empty");
  try {
    await updateDoc(doc(db, "officeWorkers", worker.id), { name: worker.name });
    alert("Worker name updated!");
  } catch (err) {
    console.error("Failed to update worker:", err);
    alert("Error updating worker.");
  }
};

const deleteWorker = async (id) => {
  if (!window.confirm("Delete this worker?")) return;
  try {
    await deleteDoc(doc(db, "officeWorkers", id));
  } catch (err) {
    console.error("Failed to delete worker:", err);
    alert("Error deleting worker.");
  }
};


  const handleDelete = async (id) => {
    if (window.confirm("Delete this submission?")) {
      await deleteDoc(doc(db, "attendanceOfficeAdmin", id));
    }
  };

  const saveAsImage = async (id) => {
  const element = document.getElementById(`attendance-${id}`);
  if (!element) return;

  // Hide the buttons before taking screenshot
  const buttons = element.querySelectorAll(".no-print");
  buttons.forEach((btn) => (btn.style.display = "none"));

  const canvas = await html2canvas(element);

  // Restore the buttons after screenshot
  buttons.forEach((btn) => (btn.style.display = ""));

  // Find the submission's timestamp
  const submission = submissions.find((s) => s.id === id);
  const date = submission?.timestamp?.toDate();

  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "unknown-date";

  const fileName = `office-attendance-${formattedDate}.jpg`;

  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/jpeg");
  link.click();
};



  const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const d = timestamp.toDate();
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};


  const options = officeWorkers.map((w) => ({
    value: w.id,
    label: w.name,
  }));

  return (
    <div style={{ maxWidth: 1100, margin: "32px auto", padding: 16 }}>
        <button
  onClick={() => (window.location.href = "/")}
  style={{
    padding: "8px 16px",
    background: "#eeeeee",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 16,
  }}
>
  ← Back to Main Page
</button>

      <h2 style={{ color: "#1976d2", fontWeight: "bold" }}>Office Attendance (Admin)</h2>


      {/* Show All Office Workers */}
<div style={{ marginTop: 24, marginBottom: 16 }}>
  <button
    onClick={() => setShowWorkers((prev) => !prev)}
    style={{
      padding: "8px 16px",
      background: "#1976d2",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    {showWorkers ? "Hide" : "Show All Office Workers"}
  </button>

  {showWorkers && (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: "1px solid #ccc",
        borderRadius: 8,
        background: "#f0f0f0",
      }}
    >
      <h4 style={{ marginBottom: 12 }}>All Office Workers</h4>
      {officeWorkers.length === 0 ? (
        <p>No workers found.</p>
      ) : (
        officeWorkers.map((worker) => (
          <div
            key={worker.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
              background: "#fff",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
            }}
          >
            <input
              type="text"
              value={worker.name}
              onChange={(e) =>
                setOfficeWorkers((prev) =>
                  prev.map((w) =>
                    w.id === worker.id ? { ...w, name: e.target.value } : w
                  )
                )
              }
              style={{
                flex: 1,
                marginRight: 8,
                padding: "6px 8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
            <button
              onClick={() => updateWorker(worker)}
              style={{
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 10px",
                marginRight: 8,
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={() => deleteWorker(worker.id)}
              style={{
                background: "#d32f2f",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  )}
</div>


      {/* Attendance Form */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 24,
          background: "#f9f9f9",
          marginTop: 24,
        }}
      >
        <h3 style={{ marginBottom: 8 }}>Mark Attendance</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label style={{ fontWeight: 600 }}>Present</label>
            <Select
  isMulti
  options={options.filter(
    (option) => !selectedAbsent.some((a) => a.value === option.value)
  )}
  value={selectedPresent}
  onChange={setSelectedPresent}
  placeholder="Select present workers"
/>

          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label style={{ fontWeight: 600 }}>Absent</label>
            <Select
  isMulti
  options={options.filter(
    (option) => !selectedPresent.some((p) => p.value === option.value)
  )}
  value={selectedAbsent}
  onChange={setSelectedAbsent}
  placeholder="Select absent workers"
/>

          </div>
        </div>
        <button
          onClick={handleSubmit}
          style={{
            marginTop: 24,
            padding: "10px 24px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Submit Attendance
        </button>
      </div>

      {/* Submissions */}
      <div ref={resultsRef} style={{ marginTop: 40 }}>
        <h3 style={{ color: "#444", marginBottom: 16 }}>Attendance Submissions</h3>
        {submissions.map((sub) => (
          <div
            key={sub.id}
            id={`attendance-${sub.id}`}
            style={{
              border: "1px solid #ccc",
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
              Date: <span style={{ fontWeight: 400 }}>{formatDate(sub.timestamp)}</span>
            </div>
            <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
              Submitted by: <span style={{ fontWeight: 400 }}>{sub.createdBy}</span>
            </div>
            <div style={{ display: "flex", gap: 32, marginTop: 16 }}>
              <div>
                <h4 style={{ marginBottom: 6, color: "#1976d2" }}>Present</h4>
                <ul>
                  {sub.present?.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ marginBottom: 6, color: "#d32f2f" }}>Absent</h4>
                <ul>
                  {sub.absent?.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
  <button
    className="no-print"
    onClick={() => saveAsImage(sub.id)}
    style={{
      padding: "6px 16px",
      background: "#4caf50",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    Save as Picture
  </button>
  <button
    className="no-print"
    onClick={() => handleDelete(sub.id)}
    style={{
      padding: "6px 16px",
      background: "#d32f2f",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    Delete
  </button>
</div>

          </div>
        ))}
      </div>
    </div>
  );
}
