import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";

export default function NotificationsBar({ user }) {
  const [notifications, setNotifications] = useState([]);
  const isMobile = window.innerWidth < 900;

  useEffect(() => {
  if (!user) return;
  const q = query(
    collection(db, "notifications"),
    where("toUserId", "==", user.uid),
    orderBy("timestamp", "desc")
  );
  const unsub = onSnapshot(q, (snap) => {
    setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
  return () => unsub();
}, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", user.uid),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const markAsRead = async (notifId) => {
    await updateDoc(doc(db, "notifications", notifId), { read: true });
  };

  // Styles for sidebar and mobile drawer
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
          border-top-left-radius: 28px;
          border-bottom-left-radius: 28px;
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
          transition: background 0.18s;
        }
        .notif-item.unread {
          background: #e3f0ff;
          border-left: 6px solid #43a047;
        }
        .notif-title {
          font-weight: 700;
          color: #1976d2;
        }
        @media (max-width: 899px) {
          .notif-bar {
            display: none;
          }
        }
      `}</style>
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
            className={`notif-item${notif.read ? "" : " unread"}`}
            onClick={() => markAsRead(notif.id)}
            title={notif.read ? "Read" : "Unread"}
          >
            <div className="notif-title">
              {notif.type === "exam_assigned" && "New Exam Assigned"}
              {notif.type === "exam_submitted" && "Exam Submitted"}
            </div>
            <div>
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
          </div>
        ))}
      </div>
    </>
  );
}