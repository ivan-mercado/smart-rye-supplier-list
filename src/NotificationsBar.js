import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { FaBullhorn } from "react-icons/fa";
import "./NotificationsBar.css";
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
  const [removingNotif, setRemovingNotif] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  


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

  // Animated remove
  const removeNotification = async (notifId) => {
    setRemovingNotif(notifId);
    setActiveNotif(null);
    setTimeout(async () => {
      try {
        await deleteDoc(doc(db, "notifications", notifId));
        setRemovingNotif(null);
      } catch (err) {
        console.error("Failed to delete notification:", err);
        setRemovingNotif(null);
      }
    }, 350); // Match animation duration
  };

  const clearAllNotifications = async () => {
  const promises = notifications.map((notif) =>
    deleteDoc(doc(db, "notifications", notif.id))
  );
  try {
    await Promise.all(promises);
    setActiveNotif(null);
    setRemovingNotif(null);
  } catch (err) {
    console.error("Failed to clear all notifications:", err);
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
          width: 180px;
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
          padding: 12px 8px 12px 16px;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-shadow: 0 2px 8px #d7d7d7;
          font-size: 1rem;
          cursor: pointer;
          border-left: 6px solid #1976d2;
          transition: background 0.18s, box-shadow 0.18s;
          position: relative;
          outline: none;
          box-sizing: border-box;
        }
        .notif-item.unread {
          background: #e3f0ff;
          border-left: 6px solid #43a047;
        }
        .notif-item:hover, .notif-item:focus, .notif-item.active {
          background: #e3f0ff;
          box-shadow: 0 4px 16px #b0bec5;
        }
        .notif-item.removing {
          opacity: 0;
          transform: translateY(-30px) scale(0.95);
          transition: opacity 0.35s, transform 0.35s;
          pointer-events: none;
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
        /* Projector styles */
        .notif-projector-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(30,40,60,0.25);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: notifProjectorFadeIn 0.25s;
        }
        @keyframes notifProjectorFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .notif-projector-card {
          background: #fff;
          color: #222;
          border-radius: 18px;
          box-shadow: 0 8px 32px #b0bec5cc;
          min-width: 320px;
          max-width: 95vw;
          min-height: 120px;
          padding: 32px 28px 24px 28px;
          position: relative;
          animation: notifProjectorPopIn 0.33s cubic-bezier(0.23, 1, 0.32, 1);
          transform: scale(1);
        }
        @keyframes notifProjectorPopIn {
          0% { opacity: 0; transform: scale(0.85) translateY(40px);}
          100% { opacity: 1; transform: scale(1) translateY(0);}
        }
        .notif-projector-card-close {
          position: absolute;
          top: 12px;
          right: 18px;
          background: #e53935;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 2px 8px #b0bec5;
          transition: background 0.18s;
        }
        .notif-projector-card-close:hover {
          background: #b71c1c;
        }
        /* Mobile bell and drawer */
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
        .notif-mobile-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(30,40,60,0.25);
          z-index: 2000;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }
        .notif-mobile-drawer {
          position: relative;
          width: 100vw;
          max-height: 70vh;
          background: #415256;
          color: #fff;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          box-shadow: 0 -4px 32px #b3bfb6;
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
          .notif-bell, .notif-mobile-backdrop {
            display: none !important;
          }
        }
        .mobile-announcement-bell-wrapper {
          position: fixed;
          right: 24px;
          bottom: 150px;
          z-index: 101;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }
        .mobile-announcement-btn {
          background: #1976d2;
          border: none;
          border-radius: 50%;
          box-shadow: 0 2px 8px #b3bfb6;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          cursor: pointer;
          transition: background 0.18s;
          font-size: 1.5rem;
          margin-bottom: 10px;
          padding: 0;
        }
        .mobile-announcement-btn:active,
        .mobile-announcement-btn:focus {
          background: #1565c0;
        }
        @media (min-width: 900px) {
          .mobile-announcement-bell-wrapper {
            display: none !important;
          }
        }
      `}</style>
            {/* Desktop notification bar */}
      <div className="notif-bar">
        <div style={{ 
  fontWeight: 800, fontSize: 18, marginBottom: 10, color: "#fff", 
  display: "flex", justifyContent: "space-between", alignItems: "center", width: "90%"
}}>
  <span>Notifications</span>
  {notifications.length > 0 && (
    <button
  onClick={() => {
    setShowConfirmClear(true);

  }}
  title="Clear all notifications"
  style={{
    background: "none",
    border: "none",
    color: "#ff9999",
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    lineHeight: "1",
    padding: 0,
    marginLeft: 8
  }}
>
  ×
</button>

  )}
</div>

        {notifications.length === 0 && (
          <div style={{ color: "#b0bec5", fontSize: 15, marginTop: 20 }}>No notifications yet.</div>
        )}
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`notif-item${notif.read ? "" : " unread"}${activeNotif === notif.id ? " active" : ""}${removingNotif === notif.id ? " removing" : ""}`}
            onClick={() => {
              setActiveNotif(notif.id);
              markAsRead(notif.id);
            }}
            title={notif.read ? "Read" : "Unread"}
          >
            <div className="notif-title">
              {notif.type === "announcement" && "Announcement"}
              {notif.type === "exam_assigned" && "New Exam Assigned"}
              {notif.type === "exam_submitted" && "Exam Submitted"}
            </div>
            <div>
              {notif.type === "announcement" && (<>{notif.message}</>)}
              {notif.type === "exam_assigned" && (<>You have been assigned <b>{notif.examTitle}</b>.</>)}
              {notif.type === "exam_submitted" && (<><b>{notif.fromUserName}</b> submitted <b>{notif.examTitle}</b>.</>)}
            </div>
            <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
              {notif.timestamp?.toDate?.().toLocaleString?.() || ""}
            </div>
            {/* {activeNotif === notif.id && (
              <button
                className="notif-close-btn"
                onClick={e => {
                  e.stopPropagation();
                  if (!removingNotif) removeNotification(notif.id);
                }}
                aria-label="Remove notification"
                disabled={removingNotif === notif.id}
              >
                ×
              </button>
            )} */}
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
            <FaBullhorn size={24} color="#fff" />
          </button>
        </div>
      )}

      {/* Mobile bell (only on mobile, not desktop) */}
      {!showMobileDrawer && (
        <button className="notif-bell" onClick={() => setShowMobileDrawer(true)}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2a6 6 0 0 0-6 6v3.278c0 .456-.186.893-.516 1.212A3.003 3.003 0 0 0 4 15v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-.828-.336-1.578-.884-2.11a1.75 1.75 0 0 1-.516-1.212V8a6 6 0 0 0-6-6Zm0 18a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z"/>
          </svg>
          {unreadCount > 0 && (
            <span className="notif-bell-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {/* Mobile notification drawer with backdrop */}
      {showMobileDrawer && (
        <div className="notif-mobile-backdrop" onClick={() => setShowMobileDrawer(false)}>
          <div className="notif-mobile-drawer" onClick={e => e.stopPropagation()}>
            {/* <button className="notif-mobile-close" onClick={() => setShowMobileDrawer(false)}>&times;</button> */}
            <div style={{
  fontWeight: 800, fontSize: 18, marginBottom: 10, color: "#fff",
  display: "flex", justifyContent: "space-between", alignItems: "center",
  width: "90%"
}}>
  <span>Notifications</span>
  {notifications.length > 0 && (
    <button
  onClick={() => {
    setShowConfirmClear(true);

  }}
  title="Clear all notifications"
  style={{
    background: "none",
    border: "none",
    color: "#ff9999",
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    lineHeight: "1",
    padding: 0,
    marginLeft: 8
  }}
>
  Clear All
</button>

  )}
</div>

            {notifications.length === 0 && (
              <div style={{ color: "#b0bec5", fontSize: 15, marginTop: 20 }}>No notifications yet.</div>
            )}
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`notif-item${notif.read ? "" : " unread"}${activeNotif === notif.id ? " active" : ""}${removingNotif === notif.id ? " removing" : ""}`}
                onClick={() => {
                  setActiveNotif(notif.id);
                  markAsRead(notif.id);
                }}
                title={notif.read ? "Read" : "Unread"}
              >
                <div className="notif-title">
                  {notif.type === "announcement" && "Announcement"}
                  {notif.type === "exam_assigned" && "New Exam Assigned"}
                  {notif.type === "exam_submitted" && "Exam Submitted"}
                </div>
                <div>
                  {notif.type === "announcement" && (<>{notif.message}</>)}
                  {notif.type === "exam_assigned" && (<>You have been assigned <b>{notif.examTitle}</b>.</>)}
                  {notif.type === "exam_submitted" && (<><b>{notif.fromUserName}</b> submitted <b>{notif.examTitle}</b>.</>)}
                </div>
                <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                  {notif.timestamp?.toDate?.().toLocaleString?.() || ""}
                </div>
                {/* {activeNotif === notif.id && (
                  <button
                    className="notif-close-btn"
                    onClick={e => {
                      e.stopPropagation();
                      if (!removingNotif) removeNotification(notif.id);
                    }}
                    aria-label="Remove notification"
                    disabled={removingNotif === notif.id}
                  >
                    ×
                  </button>
                )} */}
              </div>
            ))}
          </div>
        </div>
      )}
            {/* Projector Modal */}
      {activeNotif && (
        <div
          className="notif-projector-backdrop"
          onClick={() => setActiveNotif(null)}
        >
          <div
            className="notif-projector-card"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
          >
            <button
  className="notif-projector-card-close"
  onClick={() => {
    if (!removingNotif) removeNotification(activeNotif);
  }}
  aria-label="Delete notification"
  disabled={removingNotif === activeNotif}
>
  ×
</button>
            <div className="notif-title" style={{ fontSize: 22, marginBottom: 10 }}>
              {notifications.find(n => n.id === activeNotif)?.type === "announcement" && "Announcement"}
              {notifications.find(n => n.id === activeNotif)?.type === "exam_assigned" && "New Exam Assigned"}
              {notifications.find(n => n.id === activeNotif)?.type === "exam_submitted" && "Exam Submitted"}
            </div>
            <div style={{ fontSize: 17, marginBottom: 10 }}>
              {notifications.find(n => n.id === activeNotif)?.type === "announcement" && (
                <>{notifications.find(n => n.id === activeNotif)?.message}</>
              )}
              {notifications.find(n => n.id === activeNotif)?.type === "exam_assigned" && (
                <>You have been assigned <b>{notifications.find(n => n.id === activeNotif)?.examTitle}</b>.</>
              )}
              {notifications.find(n => n.id === activeNotif)?.type === "exam_submitted" && (
                <><b>{notifications.find(n => n.id === activeNotif)?.fromUserName}</b> submitted <b>{notifications.find(n => n.id === activeNotif)?.examTitle}</b>.</>
              )}
            </div>
            <div style={{ color: "#888", fontSize: 14, marginTop: 8 }}>
              {notifications.find(n => n.id === activeNotif)?.timestamp?.toDate?.().toLocaleString?.() || ""}
            </div>
          </div>
        </div>
      )}
      {showConfirmClear && (
  <div className="notif-projector-backdrop" onClick={() => setShowConfirmClear(false)}>
    <div
  className="notif-projector-card"
  onClick={(e) => e.stopPropagation()}
  style={{
    padding: "24px 28px",
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    position: "relative",
    margin: "0 16px",
  }}
>

      <h3 style={{ marginBottom: 20 }}>Clear All Notifications?</h3>
      <p style={{ marginBottom: 24 }}>
        Are you sure you want to delete all your notifications? This action cannot be undone.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button
          style={{
            padding: "8px 16px",
            background: "#e0e0e0",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600
          }}
          onClick={() => setShowConfirmClear(false)}
        >
          Cancel
        </button>
        <button
          style={{
            padding: "8px 16px",
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600
          }}
          onClick={async () => {
            await clearAllNotifications();
            setShowConfirmClear(false);
          }}
        >
          Yes, Clear All
        </button>
      </div>
    </div>
  </div>
)}


    </>
  );
}