import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

export default function AnnouncementBar({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Query for announcements for this user
    const q1 = query(
      collection(db, "announcements"),
      where("recipients", "array-contains", user.uid)
    );
    // Query for global announcements
    const q2 = query(
      collection(db, "announcements"),
      where("toAll", "==", true)
    );

    // Listen to both queries and merge results
    const unsub1 = onSnapshot(q1, (snap) => {
      setAnnouncements((prev) => {
        const newAnns = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Remove duplicates by id
        const ids = new Set(newAnns.map(a => a.id));
        return [...newAnns, ...prev.filter(a => !ids.has(a.id))];
      });
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      setAnnouncements((prev) => {
        const newAnns = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Remove duplicates by id
        const ids = new Set(newAnns.map(a => a.id));
        return [...newAnns, ...prev.filter(a => !ids.has(a.id))];
      });
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);
    // Optionally, sort announcements by createdAt descending
  const sortedAnnouncements = announcements
    .filter(a => !dismissed.includes(a.id))
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.seconds - a.createdAt.seconds;
    });

  if (!user || sortedAnnouncements.length === 0) return null;

  // Show the latest, not dismissed
  const latest = sortedAnnouncements[0];
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