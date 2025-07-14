import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

export default function AnnouncementModal({ open, onClose, user }) {
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all_users");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (recipientType === "specific") {
      getDocs(collection(db, "users")).then(snapshot => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [recipientType]);

  const sendAnnouncement = async () => {
    let recipients = [];
    if (recipientType === "all_users") {
      const snap = await getDocs(query(collection(db, "users"), where("role", "==", "user")));
      recipients = snap.docs.map(doc => doc.id);
    } else if (recipientType === "all_admins") {
      const snap = await getDocs(query(collection(db, "users"), where("role", "==", "admin")));
      recipients = snap.docs.map(doc => doc.id);
    } else if (recipientType === "everyone") {
      const snap = await getDocs(collection(db, "users"));
      recipients = snap.docs.map(doc => doc.id);
    } else if (recipientType === "specific") {
      recipients = selectedUsers;
    }

    await Promise.all(
      recipients.map(uid =>
        addDoc(collection(db, "notifications"), {
          toUserId: uid,
          type: "announcement",
          message,
          fromUserName: user.displayName || user.email,
          timestamp: serverTimestamp(),
          read: false,
        })
      )
    );
    setMessage("");
    setRecipientType("all_users");
    setSelectedUsers([]);
    setSearch("");
    onClose();
  };

  if (!open) return null;

  // Filter users by search
  const filteredUsers = users.filter(
    u =>
      (u.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="announcement-modal-backdrop">
      <div className="announcement-modal">
        <h2>Send Announcement</h2>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your announcement here..."
        />
        <div style={{ margin: "12px 0" }}>
          <label>
            <input
              type="radio"
              value="all_users"
              checked={recipientType === "all_users"}
              onChange={() => setRecipientType("all_users")}
            />
            All Users
          </label>
          <label>
            <input
              type="radio"
              value="all_admins"
              checked={recipientType === "all_admins"}
              onChange={() => setRecipientType("all_admins")}
            />
            All Admins
          </label>
          <label>
            <input
              type="radio"
              value="everyone"
              checked={recipientType === "everyone"}
              onChange={() => setRecipientType("everyone")}
            />
            Everyone
          </label>
          <label>
            <input
              type="radio"
              value="specific"
              checked={recipientType === "specific"}
              onChange={() => setRecipientType("specific")}
            />
            Specific Users
          </label>
        </div>
        {recipientType === "specific" && (
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "95%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid #b0bec5"
              }}
            />
            <div style={{ maxHeight: 160, overflowY: "auto", border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
              {filteredUsers.length === 0 && (
                <div style={{ color: "#888", fontSize: 14 }}>No users found.</div>
              )}
              {filteredUsers.map(u => (
                <label key={u.id} style={{ display: "block", marginBottom: 4, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={e => {
                      if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                      else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                    }}
                  />
                  {" "}{u.displayName || u.email}
                </label>
              ))}
            </div>
          </div>
        )}
        <button onClick={sendAnnouncement} disabled={!message.trim() || (recipientType === "specific" && selectedUsers.length === 0)} style={{ marginRight: 8 }}>
          Send
        </button>
        <button onClick={onClose} style={{ background: "#e53935", color: "#fff" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}