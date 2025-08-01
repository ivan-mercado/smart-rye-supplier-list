import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getPHDate } from './phTimeUtils';
import { useNavigate } from "react-router-dom";

export default function AdminAttendanceDashboard({ user }) {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(getPHDate());
  const [selectedIds, setSelectedIds] = useState([]);
  const [ojtLabel, setOjtLabel] = useState(() => localStorage.getItem('ojtLabel') || "OJT");
  const navigate = useNavigate();

  function formatTo12Hour(timeStr) {
    if (!timeStr) return '--';
    const [hour, minute, second] = timeStr.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${minute}:${second} ${ampm}`;
  }

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      const q = query(collection(db, "attendance"), where("date", "==", date));
      const snapshot = await getDocs(q);
      setAttendanceList(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setSelectedIds([]); // Clear selection on date change
      setLoading(false);
    }
    fetchAttendance();
  }, [date]);
    // Stats
  const totalPresent = attendanceList.filter(a => a.status === "Present" || a.status === "Late").length;
  const totalLate = attendanceList.filter(a => a.status === "Late").length;
  const avgCheckIn = attendanceList.length
    ? (attendanceList
        .filter(a => a.timeIn)
        .map(a => {
          const [h, m, s] = a.timeIn.split(':').map(Number);
          return h * 60 + m + s / 60;
        })
        .reduce((acc, cur) => acc + cur, 0) /
      attendanceList.filter(a => a.timeIn).length)
    : null;

  let avgCheckInStr = "--:--";
  if (avgCheckIn) {
    const hours = Math.floor(avgCheckIn / 60);
    const mins = Math.round(avgCheckIn % 60);
    avgCheckInStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Select all logic
  const allSelected = attendanceList.length > 0 && selectedIds.length === attendanceList.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(attendanceList.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Select single row
  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Delete selected
  const handleDeleteSelected = async () => {
    if (!window.confirm("Delete selected attendance records?")) return;
    for (const id of selectedIds) {
      await deleteDoc(doc(db, "attendance", id));
    }
    setAttendanceList(list => list.filter(a => !selectedIds.includes(a.id)));
    setSelectedIds([]);
  };

  // OJT label edit
  const handleOjtLabelEdit = (e) => {
    e.preventDefault();
    const newLabel = prompt("Edit OJT Button Label:", ojtLabel);
    if (newLabel && newLabel.trim()) {
      setOjtLabel(newLabel.trim());
      localStorage.setItem('ojtLabel', newLabel.trim());
    }
  };

  const thStyle = {
    padding: 16,
    border: 'none',
    fontWeight: 800,
    color: '#1976d2',
    background: '#e3f0ff',
    letterSpacing: 1,
    fontSize: 17,
  };

  const tdStyle = {
    padding: 14,
    border: 'none',
    fontSize: 16,
    verticalAlign: 'top',
  };
  return (
    <>
      <style>
        {`
          /* Responsive OJT button and header */
          .dashboard-header {
            display: flex;
            align-items: center;
            margin-bottom: 18px;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          .ojt-btn {
            margin-left: 18px;
            background: #43a047;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            border-radius: 8px;
            padding: 8px 22px;
            border: none;
            cursor: pointer;
            box-shadow: 0 2px 8px #e3e3e3;
            user-select: none;
            transition: all 0.2s;
          }
          @media (max-width: 700px) {
            .dashboard-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }
            .ojt-btn {
              margin-left: 0;
              margin-top: 10px;
              width: 100%;
              max-width: 220px;
            }
            .attendance-table { display: none !important; }
            .attendance-card-list { display: block !important; }
          }
          @media (min-width: 701px) {
            .attendance-table { display: table !important; }
            .attendance-card-list { display: none !important; }
          }
          .attendance-card-list {
            display: none;
            width: 100%;
          }
          .attendance-card {
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
          .attendance-card .attendance-label {
            color: #1976d2;
            font-weight: 700;
            margin-right: 6px;
          }
        `}
      </style>
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: 24,
          background: "#1976d2",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16,
          borderRadius: 8,
          padding: "10px 24px",
          boxShadow: "0 2px 8px #e3e3e3",
          border: "none",
          cursor: "pointer"
        }}
      >
        ← Back to Main Menu
      </button>
      <div style={{
        maxWidth: 1200,
        margin: '40px auto',
        padding: 32,
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 8px 32px #cfd8dc',
        fontFamily: 'Inter, Nunito, Segoe UI, Arial, sans-serif'
      }}>
        <div className="dashboard-header">
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1976d2', letterSpacing: 1, margin: 0 }}>
            Attendance Dashboard
          </h2>
          <button
            className="ojt-btn"
            onClick={() => navigate("/ojt-attendance")}
            onContextMenu={handleOjtLabelEdit}
            title="Right-click to edit label"
          >
            {ojtLabel}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 32, marginBottom: 32, fontSize: 18 }}>
          <div>
            <b>Total Employees Present:</b> {totalPresent}
          </div>
          <div>
            <b>Late Arrivals Today:</b> {totalLate}
          </div>
          <div>
            <b>Average Check-In Time:</b> {avgCheckInStr}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            Date:{" "}
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ padding: 6, borderRadius: 6, border: '1px solid #b0bec5', fontSize: 16 }}
            />
          </label>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            style={{
              marginBottom: 16,
              background: "#e53935",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 8,
              padding: "8px 22px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px #e3e3e3"
            }}
          >
            Delete Selected Attendance ({selectedIds.length})
          </button>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Desktop/Tablet Table */}
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="attendance-table" style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                fontSize: 17,
                background: '#f9fbfc',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 2px 8px #e3e3e3',
                minWidth: 600
              }}>
                <thead>
                  <tr style={{ background: '#e3f0ff' }}>
                    <th style={thStyle}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        style={{ transform: "scale(1.2)" }}
                      />
                    </th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Time In</th>
                    <th style={thStyle}>Time Out</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#888' }}>No attendance records for this date.</td>
                    </tr>
                  ) : (
                    attendanceList.map((a, idx) => (
                      <tr key={a.id} style={{
                        background: idx % 2 === 0 ? '#f9fbfc' : '#fff',
                        transition: 'background 0.2s'
                      }}>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(a.id)}
                            onChange={() => handleSelectRow(a.id)}
                            style={{ transform: "scale(1.2)" }}
                          />
                        </td>
                        <td style={tdStyle}>{a.name}</td>
                        <td style={tdStyle}>{a.department}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{formatTo12Hour(a.timeIn)}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{formatTo12Hour(a.timeOut)}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', verticalAlign: 'middle', padding: 0 }}>
  <span style={{
    display: 'inline-block',
    minWidth: 60,
    padding: '4px 18px',
    borderRadius: 16,
    background: a.status === "Late" ? "#ffecb3" : "#c8e6c9",
    color: a.status === "Late" ? "#ff9800" : "#43a047",
    fontWeight: 700,
    fontSize: 15,
    textAlign: 'center',
    boxShadow: a.status === "Late" ? "0 1px 4px #ffe0b2" : "0 1px 4px #c8e6c9",
    margin: 0, // ensure no margin
    verticalAlign: 'middle'
  }}>
    {a.status}
  </span>
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Mobile Card/List */}
            <div className="attendance-card-list">
              {attendanceList.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: 24,
                  color: "#888",
                  background: "#f9fbfc",
                  borderRadius: 12,
                  marginTop: 18
                }}>
                  No attendance records for this date.
                </div>
              ) : (
                attendanceList.map((a, idx) => (
                  <div className="attendance-card" key={a.id}>
                    <div><span className="attendance-label">Name:</span> {a.name}</div>
                    <div><span className="attendance-label">Department:</span> {a.department}</div>
                    <div><span className="attendance-label">Time In:</span> {formatTo12Hour(a.timeIn)}</div>
                    <div><span className="attendance-label">Time Out:</span> {formatTo12Hour(a.timeOut)}</div>
                    <div>
                      <span className="attendance-label">Status:</span>
                      <span style={{
                        display: 'inline-block',
                        minWidth: 60,
                        padding: '4px 18px',
                        borderRadius: 16,
                        background: a.status === "Late" ? "#ffecb3" : "#c8e6c9",
                        color: a.status === "Late" ? "#ff9800" : "#43a047",
                        fontWeight: 700,
                        fontSize: 15,
                        textAlign: 'center',
                        boxShadow: a.status === "Late" ? "0 1px 4px #ffe0b2" : "0 1px 4px #c8e6c9",
                        marginLeft: 8
                      }}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}