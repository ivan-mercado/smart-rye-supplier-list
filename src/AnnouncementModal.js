import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

export default function AnnouncementModal({ open, onClose, user }) {
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all_users");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (recipientType === "specific") {
      // Fetch all users for selection
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

    // Send notification to each recipient
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
    onClose();
  };

  if (!open) return null;
  return (
    <div className="announcement-modal-backdrop">
      <div className="announcement-modal">
        <h2>Send Announcement</h2>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your announcement here..."
        />
        <div>
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
          <div>
            {users.map(u => (
              <label key={u.id}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                    else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                  }}
                />
                {u.displayName || u.email}
              </label>
            ))}
          </div>
        )}
        <button onClick={sendAnnouncement} disabled={!message.trim()}>Send</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}