import React, { useEffect, useState } from 'react';
import { addTimeIn, addTimeOut } from './attendanceService';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getPHDate } from './phTimeUtils';
import { useNavigate } from "react-router-dom";

// Utility to format time to 12-hour with AM/PM
function formatTo12Hour(timeStr) {
  if (!timeStr) return '--';
  const [hour, minute, second] = timeStr.split(':');
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${minute}:${second} ${ampm}`;
}

export default function UserAttendancePage({ user }) {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
    useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      const date = getPHDate();
      const attendanceRef = doc(db, "attendance", `${user.uid}_${date}`);
      const docSnap = await getDoc(attendanceRef);
      setAttendance(docSnap.exists() ? docSnap.data() : null);
      setLoading(false);
    }
    fetchAttendance();
  }, [user]);

  const handleTimeIn = async () => {
    await addTimeIn(user);
    setMessage('Time In recorded!');
    window.location.reload();
  };

  const handleTimeOut = async () => {
    await addTimeOut(user);
    setMessage('Time Out recorded!');
    window.location.reload();
  };

  if (loading) return <div>Loading...</div>;

  const today = getPHDate();
  const hasTimeIn = attendance && attendance.timeIn;
  const hasTimeOut = attendance && attendance.timeOut;
    return (
    <>
      <style>
        {`
          @media (max-width: 600px) {
            .attendance-card {
              max-width: 98vw !important;
              padding: 12vw 2vw !important;
              font-size: 15px !important;
            }
            .attendance-card .attendance-btn {
              font-size: 16px !important;
              padding: 10px 0 !important;
            }
            .attendance-card .attendance-title {
              font-size: 20px !important;
            }
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
          cursor: "pointer",
          width: "100%",
          maxWidth: 400
        }}
      >
        ← Back to Main Menu
      </button>

      <div
        className="attendance-card"
        style={{
          maxWidth: 400,
          margin: '40px auto',
          padding: 32,
          background: 'linear-gradient(135deg, #e3f0ff 0%, #f9fbfc 100%)',
          borderRadius: 18,
          boxShadow: '0 8px 32px #cfd8dc',
          fontFamily: 'Inter, Nunito, Segoe UI, Arial, sans-serif',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div className="attendance-title" style={{ fontSize: 28, fontWeight: 900, color: '#1976d2', marginBottom: 8, letterSpacing: 1 }}>
          Date: {today}
        </div>
        <div style={{ fontWeight: 700, color: '#222', marginBottom: 18 }}>
          <span style={{ color: '#888', fontWeight: 500 }}>Name:</span> {user.displayName || user.email}
        </div>
        {message && <div style={{ color: 'green', marginBottom: 12 }}>{message}</div>}
        {hasTimeIn && (
          <div style={{ marginBottom: 8, fontSize: 18 }}>
            <span style={{ color: '#1976d2', fontWeight: 700 }}>Time In:</span> <b>{formatTo12Hour(attendance.timeIn)}</b>
          </div>
        )}
        {hasTimeOut && (
          <div style={{ marginBottom: 18, fontSize: 18 }}>
            <span style={{ color: '#43a047', fontWeight: 700 }}>Time Out:</span> <b>{formatTo12Hour(attendance.timeOut)}</b>
          </div>
        )}
        {!hasTimeIn && (
          <button
            onClick={handleTimeIn}
            className="attendance-btn"
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(90deg, #4f8cff 0%, #6ed0fa 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #e3e3e3',
              marginBottom: 12,
              transition: 'background 0.2s, box-shadow 0.2s',
              width: "100%"
            }}
          >
            <span role="img" aria-label="in">🟢</span> Add Time In
          </button>
        )}
        {hasTimeIn && !hasTimeOut && (
          <button
            onClick={handleTimeOut}
            className="attendance-btn"
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(90deg, #43a047 0%, #a8e063 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #e3e3e3',
              marginBottom: 12,
              transition: 'background 0.2s, box-shadow 0.2s',
              width: "100%"
            }}
          >
            <span role="img" aria-label="out">🔴</span> Add Time Out
          </button>
        )}
        {hasTimeIn && hasTimeOut && (
          <div style={{
            color: '#43a047',
            marginTop: 18,
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: 1
          }}>
            <span role="img" aria-label="check">✅</span> Attendance Added
          </div>
        )}
      </div>
    </>
  );
}