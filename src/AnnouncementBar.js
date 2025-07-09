import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

export default function AnnouncementBar({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    if (!user) return;
    // Listen for announcements where this user is a recipient
    const q = query(
      collection(db, "announcements"),
      where("recipients", "array-contains", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setAnnouncements(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
    return () => unsub();
  }, [user]);

  // Optionally, also show announcements sent to all users (if you want to support role-based)
  // You can add another query for role-based if needed

  if (!user || announcements.length === 0) return null;

  // Show the latest, not dismissed
  const latest = announcements.find(a => !dismissed.includes(a.id));
  if (!latest) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 52,
        left: 0,
        width: "100vw",
        background: "#1976d2",
        color: "#fff",
        zIndex: 2000,
        padding: "16px 0",
        textAlign: "center",
        fontWeight: 600,
        fontSize: 18,
        boxShadow: "0 2px 12px #b0bec5"
      }}
    >
      <span>{latest.message}</span>
      <button
        style={{
          marginLeft: 24,
          background: "rgba(255,255,255,0.15)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 32,
          height: 32,
          fontSize: 20,
          cursor: "pointer",
          fontWeight: 700,
          verticalAlign: "middle"
        }}
        onClick={() => setDismissed([...dismissed, latest.id])}
        aria-label="Dismiss announcement"
      >
        ×
      </button>
    </div>
  );
}