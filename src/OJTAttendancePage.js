import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function OJTAttendancePage() {
  const [ojtUsers, setOjtUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // Fetch OJT users
  useEffect(() => {
    async function fetchOjtUsers() {
      const q = query(collection(db, "users"), where("department", "==", "OJT"));
      const snapshot = await getDocs(q);
      setOjtUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }
    fetchOjtUsers();
  }, []);

  // Fetch all attendance for OJT users
  useEffect(() => {
    async function fetchAttendance() {
      if (ojtUsers.length === 0) return;
      const userIds = ojtUsers.map(u => u.id);
      // Firestore "in" queries are limited to 10, so batch if needed
      let allAttendance = [];
      for (let i = 0; i < userIds.length; i += 10) {
        const batchIds = userIds.slice(i, i + 10);
        const q = query(collection(db, "attendance"), where("userId", "in", batchIds));
        const snapshot = await getDocs(q);
        allAttendance = allAttendance.concat(snapshot.docs.map(doc => doc.data()));
      }
      setAttendance(allAttendance);
      setLoading(false);
    }
    fetchAttendance();
  }, [ojtUsers]);
    // Calculate total rendered hours for each OJT user
  function getRenderedHours(userId) {
    const records = attendance.filter(a => a.userId === userId && a.timeIn && a.timeOut);
    let totalSeconds = 0;
    for (const rec of records) {
      const [inH, inM, inS] = rec.timeIn.split(":").map(Number);
      const [outH, outM, outS] = rec.timeOut.split(":").map(Number);
      const inSec = inH * 3600 + inM * 60 + inS;
      const outSec = outH * 3600 + outM * 60 + outS;
      if (outSec > inSec) totalSeconds += outSec - inSec;
    }
    return totalSeconds / 3600; // hours
  }

  // Handle per-student required hours edit
  const handleEditClick = (user) => {
    setEditingId(user.id);
    setEditingValue(user.requiredHours !== undefined ? user.requiredHours : 486);
  };

  const handleEditChange = (e) => {
    setEditingValue(e.target.value);
  };

  const handleEditSave = async (user) => {
    const val = Number(editingValue);
    if (isNaN(val) || val <= 0) return;
    await updateDoc(doc(db, "users", user.id), { requiredHours: val });
    setOjtUsers(users =>
      users.map(u => u.id === user.id ? { ...u, requiredHours: val } : u)
    );
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const thStyle = {
    padding: 16,
    border: "none",
    fontWeight: 800,
    color: "#1976d2",
    background: "#e3f0ff",
    letterSpacing: 1,
    fontSize: 17,
  };

  const tdStyle = {
    padding: 14,
    border: "none",
    fontSize: 16,
    verticalAlign: "top",
  };
    return (
    <div style={{
      maxWidth: 900,
      margin: "40px auto",
      padding: 32,
      background: "#fff",
      borderRadius: 18,
      boxShadow: "0 8px 32px #cfd8dc",
      fontFamily: "Inter, Nunito, Segoe UI, Arial, sans-serif"
    }}>
      <style>
        {`
          /* Hide table on mobile, show cards */
          @media (max-width: 700px) {
            .ojt-table { display: none !important; }
            .ojt-card-list { display: block !important; }
          }
          /* Hide cards on desktop, show table */
          @media (min-width: 701px) {
            .ojt-table { display: table !important; }
            .ojt-card-list { display: none !important; }
          }
          .ojt-card-list {
            display: none;
            width: 100%;
          }
          .ojt-card {
            background: #f9fbfc;
            border-radius: 12px;
            box-shadow: 0 2px 8px #e3e3e3;
            margin-bottom: 18px;
            padding: 18px 16px;
            font-size: 15px;
            display: flex;
            flex-direction: column;
            gap: 7px;
          }
          .ojt-card .ojt-label {
            color: #1976d2;
            font-weight: 700;
            margin-right: 6px;
          }
          .ojt-card .ojt-edit-btn {
            margin-left: 8px;
            background: #43a047;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 2px 10px;
            font-weight: 700;
            cursor: pointer;
            font-size: 13px;
          }
          .ojt-card .ojt-cancel-btn {
            margin-left: 4px;
            background: #e53935;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 2px 10px;
            font-weight: 700;
            cursor: pointer;
            font-size: 13px;
          }
        `}
      </style>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1976d2", marginBottom: 18, letterSpacing: 1 }}>
        OJT Attendance Tracker
      </h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Desktop/Tablet Table */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="ojt-table" style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              fontSize: 17,
              background: "#f9fbfc",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 8px #e3e3e3",
              minWidth: 600
            }}>
              <thead>
                <tr style={{ background: "#e3f0ff" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Required Hours</th>
                  <th style={thStyle}>Rendered Hours</th>
                  <th style={thStyle}>Remaining Hours</th>
                </tr>
              </thead>
              <tbody>
                {ojtUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#888" }}>
                      No OJT students found.
                    </td>
                  </tr>
                ) : (
                  ojtUsers.map((u, idx) => {
                    const required = u.requiredHours !== undefined ? u.requiredHours : 486;
                    const rendered = getRenderedHours(u.id);
                    const remaining = Math.max(0, required - rendered);
                    return (
                      <tr key={u.id} style={{
                        background: idx % 2 === 0 ? "#f9fbfc" : "#fff",
                        transition: "background 0.2s"
                      }}>
                        <td style={tdStyle}>{u.name || u.displayName || "--"}</td>
                        <td style={tdStyle}>{u.email}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {editingId === u.id ? (
                            <>
                              <input
                                type="number"
                                min={1}
                                value={editingValue}
                                onChange={handleEditChange}
                                style={{
                                  width: 70,
                                  padding: 4,
                                  borderRadius: 6,
                                  border: "1px solid #b0bec5",
                                  fontSize: 15,
                                  fontWeight: 700
                                }}
                              />
                              <button
                                onClick={() => handleEditSave(u)}
                                className="ojt-edit-btn"
                              >Save</button>
                              <button
                                onClick={handleEditCancel}
                                className="ojt-cancel-btn"
                              >Cancel</button>
                            </>
                          ) : (
                            <span
                              style={{ cursor: "pointer", color: "#1976d2", fontWeight: 700 }}
                              title="Click to edit"
                              onClick={() => handleEditClick(u)}
                            >
                              {required}
                            </span>
                          )}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "#1976d2" }}>
                          {rendered.toFixed(2)}
                        </td>
                        <td style={{
                          ...tdStyle,
                          textAlign: "center",
                          fontWeight: 700,
                          color: remaining === 0 ? "#43a047" : "#e53935"
                        }}>
                          {remaining.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile Card/List */}
          <div className="ojt-card-list">
            {ojtUsers.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: 24,
                color: "#888",
                background: "#f9fbfc",
                borderRadius: 12,
                marginTop: 18
              }}>
                No OJT students found.
              </div>
            ) : (
              ojtUsers.map((u, idx) => {
                const required = u.requiredHours !== undefined ? u.requiredHours : 486;
                const rendered = getRenderedHours(u.id);
                const remaining = Math.max(0, required - rendered);
                return (
                  <div className="ojt-card" key={u.id}>
                    <div><span className="ojt-label">Name:</span> {u.name || u.displayName || "--"}</div>
                    <div><span className="ojt-label">Email:</span> {u.email}</div>
                    <div>
                      <span className="ojt-label">Required Hours:</span>
                      {editingId === u.id ? (
                        <>
                          <input
                            type="number"
                            min={1}
                            value={editingValue}
                            onChange={handleEditChange}
                            style={{
                              width: 70,
                              padding: 4,
                              borderRadius: 6,
                              border: "1px solid #b0bec5",
                              fontSize: 15,
                              fontWeight: 700
                            }}
                          />
                          <button
                            onClick={() => handleEditSave(u)}
                            className="ojt-edit-btn"
                          >Save</button>
                          <button
                            onClick={handleEditCancel}
                            className="ojt-cancel-btn"
                          >Cancel</button>
                        </>
                      ) : (
                        <span
                          style={{ cursor: "pointer", color: "#1976d2", fontWeight: 700 }}
                          title="Click to edit"
                          onClick={() => handleEditClick(u)}
                        >
                          {required}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="ojt-label">Rendered:</span>
                      <span style={{ color: "#1976d2", fontWeight: 700 }}> {rendered.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="ojt-label">Remaining:</span>
                      <span style={{
                        color: remaining === 0 ? "#43a047" : "#e53935",
                        fontWeight: 700
                      }}> {remaining.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}