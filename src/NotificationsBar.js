import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { FaBullhorn } from "react-icons/fa";
import "./NotificationsBar.css"; // Import the CSS file for styling
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  deleteDoc,
} from "firebase/firestore";

export default function NotificationsBar({ user, setShowAnnouncementModal }) {
  const [notifications, setNotifications] = useState([]);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [activeNotif, setActiveNotif] = useState(null);

  // Real-time notifications
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", user.uid),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, "notifications", notifId), { read: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const removeNotification = async (notifId) => {
    try {
      await deleteDoc(doc(db, "notifications", notifId));
      setActiveNotif(null);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
    return (
    <>
      <style>{`
        .notif-bar {
          position: fixed;
          top: 52px;
          right: 0;
          width: 280px;
          height: calc(100vh - 52px);
          background: #415256;
          color: #fff;
          box-shadow: -4px 0 32px #b3bfb6;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 0 18px 0;
          overflow-y: auto;
        }
        .notif-item {
          background: #fff;
          color: #222;
          border-radius: 10px;
          margin: 10px 0;
          padding: 12px 16px;
          width: 220px;
          box-shadow: 0 2px 8px #d7d7d7;
          font-size: 1rem;
          cursor: pointer;
          border-left: 6px solid #1976d2;
          transition: background 0.18s, box-shadow 0.18s;
          position: relative;
          outline: none;
        }
        .notif-item.unread {
          background: #e3f0ff;
          border-left: 6px solid #43a047;
        }
        .notif-item:hover, .notif-item:focus, .notif-item.active {
          background: #e3f0ff;
          box-shadow: 0 4px 16px #b0bec5;
        }
        .notif-title {
          font-weight: 700;
          color: #1976d2;
        }
        .notif-close-btn {
          position: absolute;
          top: 8px;
          right: 10px;
          background: rgba(30,30,30,0.18);
          border: none;
          color: #fff;
          font-size: 1.5rem;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s, background 0.2s;
          z-index: 2;
        }
        .notif-item.active .notif-close-btn,
        .notif-item:focus .notif-close-btn {
          opacity: 1;
          pointer-events: auto;
          background: rgba(30,30,30,0.38);
        }
        .notif-close-btn:hover {
          background: rgba(229,57,53,0.8);
          color: #fff;
        }
        .notif-bell {
          position: fixed;
          bottom: 90px;
          right: 24px;
          background: #1976d2;
          color: #fff;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px #b0bec5;
          z-index: 100;
          cursor: pointer;
          border: none;
          outline: none;
        }
        .notif-bell-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #e53935;
          color: #fff;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 2px 8px #b0bec5;
        }
        .notif-mobile-drawer {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100vw;
          max-height: 70vh;
          background: #415256;
          color: #fff;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          box-shadow: 0 -4px 32px #b3bfb6;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 18px 0 12px 0;
          overflow-y: auto;
          animation: notifDrawerIn 0.2s;
        }
        @keyframes notifDrawerIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .notif-mobile-close {
          position: absolute;
          top: 10px;
          right: 18px;
          background: none;
          border: none;
          color: #fff;
          font-size: 2rem;
          cursor: pointer;
        }
        @media (max-width: 899px) {
          .notif-bar {
            display: none;
          }
          .notif-bell {
            display: flex;
          }
          .notif-item {
            width: 90vw;
            min-width: 0;
            max-width: 98vw;
            font-size: 1.05rem;
          }
        }
        @media (min-width: 900px) {
          .notif-bell, .notif-mobile-drawer {
            display: none !important;
          }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="notif-bar">
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10, color: "#fff" }}>
          Notifications
        </div>
        {notifications.length === 0 && (
          <div style={{ color: "#b0bec5", fontSize: 15, marginTop: 20 }}>No notifications yet.</div>
        )}
        {notifications.map(notif => (
  <div
    key={notif.id}
    className={`notif-item${notif.read ? "" : " unread"}${activeNotif === notif.id ? " active" : ""}`}
    onClick={() => {
      setActiveNotif(notif.id);
      markAsRead(notif.id);
    }}
    title={notif.read ? "Read" : "Unread"}
    // REMOVE onBlur
  >
    <div className="notif-title">
      {notif.type === "announcement" && "Announcement"}
      {notif.type === "exam_assigned" && "New Exam Assigned"}
      {notif.type === "exam_submitted" && "Exam Submitted"}
    </div>
    <div>
      {notif.type === "announcement" && (
    <>{notif.message}</>
  )}
      {notif.type === "exam_assigned" && (
        <>You have been assigned <b>{notif.examTitle}</b>.</>
      )}
      {notif.type === "exam_submitted" && (
        <><b>{notif.fromUserName}</b> submitted <b>{notif.examTitle}</b>.</>
      )}
    </div>
    <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
      {notif.timestamp?.toDate?.().toLocaleString?.() || ""}
    </div>
    {activeNotif === notif.id && (
      <button
        className="notif-close-btn"
        onClick={e => {
          e.stopPropagation(); // Prevent parent click
          removeNotification(notif.id);
        }}
        aria-label="Remove notification"
      >
        ×
      </button>
    )}
  </div>
))}
      </div>
      {/* Only show megaphone for admins */}
{user?.role === "admin" && (
  <div className="mobile-announcement-bell-wrapper">
    <button
      className="mobile-announcement-btn"
      onClick={() => setShowAnnouncementModal(true)}
      aria-label="Make Announcement"
      type="button"
    >
      <FaBullhorn size={26} color="#1976d2" />
    </button>
  </div>
)}

{/* Always show bell for all users */}
<div className="mobile-bell-wrapper">
  <button className="notif-bell" onClick={() => setShowMobileDrawer(true)}>
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 2a6 6 0 0 0-6 6v3.278c0 .456-.186.893-.516 1.212A3.003 3.003 0 0 0 4 15v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-.828-.336-1.578-.884-2.11a1.75 1.75 0 0 1-.516-1.212V8a6 6 0 0 0-6-6Zm0 18a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z"/>
    </svg>
    {unreadCount > 0 && (
      <span className="notif-bell-badge">{unreadCount}</span>
    )}
  </button>
</div>
      {/* Mobile notification drawer */}
      {showMobileDrawer && (
        <div className="notif-mobile-drawer">
          <button className="notif-mobile-close" onClick={() => setShowMobileDrawer(false)}>&times;</button>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10, color: "#fff" }}>
            Notifications
          </div>
          {notifications.length === 0 && (
            <div style={{ color: "#b0bec5", fontSize: 15, marginTop: 20 }}>No notifications yet.</div>
          )}
          {notifications.map(notif => (
  <div
    key={notif.id}
    className={`notif-item${notif.read ? "" : " unread"}${activeNotif === notif.id ? " active" : ""}`}
    onClick={() => {
      setActiveNotif(notif.id);
      markAsRead(notif.id);
    }}
    title={notif.read ? "Read" : "Unread"}
    // REMOVE onBlur
  >
    <div className="notif-title">
  {notif.type === "announcement" && "Announcement"}
  {notif.type === "exam_assigned" && "New Exam Assigned"}
  {notif.type === "exam_submitted" && "Exam Submitted"}
</div>
<div>
  {notif.type === "announcement" && (
    <>{notif.message}</>
  )}
  {notif.type === "exam_assigned" && (
    <>You have been assigned <b>{notif.examTitle}</b>.</>
  )}
  {notif.type === "exam_submitted" && (
    <><b>{notif.fromUserName}</b> submitted <b>{notif.examTitle}</b>.</>
  )}
</div>
    <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
      {notif.timestamp?.toDate?.().toLocaleString?.() || ""}
    </div>
    {activeNotif === notif.id && (
      <button
        className="notif-close-btn"
        onClick={e => {
          e.stopPropagation();
          removeNotification(notif.id);
        }}
        aria-label="Remove notification"
      >
        ×
      </button>
    )}
  </div>
))}
        </div>
      )}
    </>
  );
}