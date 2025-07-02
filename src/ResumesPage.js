import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "resumes"), orderBy("uploadedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setResumes(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return () => unsub();
  }, []);
    return (
    <div className="resumes-list-root">
      <style>
        {`
        .resumes-list-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e3f0ff 0%, #f9fbfc 100%);
        }
        .resumes-list-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px #cfd8dc;
          padding: 32px 20px 24px 20px;
          max-width: 600px;
          width: 98vw;
        }
        .resume-back-btn {
          background: #1976d2;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 18px;
          box-shadow: 0 2px 8px #e3e3e3;
          transition: background 0.18s;
        }
        .resume-back-btn:active {
          background: #1251a3;
        }
        .resumes-list-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1976d2;
          margin-bottom: 18px;
          text-align: center;
        }
        .resumes-list-table {
          width: 100%;
          border-collapse: collapse;
        }
        .resumes-list-table th, .resumes-list-table td {
          padding: 8px 6px;
          text-align: left;
          font-size: 0.98rem;
        }
        .resumes-list-table th {
          color: #1976d2;
          font-weight: 700;
          border-bottom: 1px solid #e3e3e3;
        }
        .resumes-list-table tr:nth-child(even) {
          background: #f5f7fa;
        }
        .resumes-list-link {
          color: #43a047;
          text-decoration: underline;
          font-weight: 600;
        }
        @media (max-width: 600px) {
          .resumes-list-card {
            padding: 12px 2vw 10px 2vw;
            max-width: 99vw;
          }
          .resume-back-btn {
            width: 100%;
            margin-bottom: 14px;
          }
          .resumes-list-table th, .resumes-list-table td {
            font-size: 0.92rem;
            padding: 6px 2px;
          }
        }
        `}
      </style>
            <div className="resumes-list-card">
        <button
          type="button"
          className="resume-back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Main Menu
        </button>
        <div className="resumes-list-title">Uploaded Resumes</div>
        <table className="resumes-list-table">
          <thead>
            <tr>
              <th>User</th>
              <th>File</th>
              <th>Date</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {resumes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>
                  No resumes uploaded yet.
                </td>
              </tr>
            ) : (
              resumes.map((r) => (
                <tr key={r.id}>
                  <td>{r.userEmail || r.userId}</td>
                  <td>{r.fileName}</td>
                  <td>
                    {r.uploadedAt?.toDate
                      ? r.uploadedAt.toDate().toLocaleString()
                      : ""}
                  </td>
                  <td>
                    <a
                      className="resumes-list-link"
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}