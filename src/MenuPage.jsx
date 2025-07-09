import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import NotificationsBar from "./NotificationsBar";
import { db } from "./firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import "./MenuPage.css"; // Import the CSS file for styling

export default function MenuPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Announcement modal and form state
  const [showAnnouncementModal, setShowAnnouncementModal] = React.useState(false);
  const [announcementMsg, setAnnouncementMsg] = React.useState("");
  const [recipientType, setRecipientType] = React.useState("all"); // "all", "admins", "selected"
  const [allUsers, setAllUsers] = React.useState([]);
  const [selectedRecipients, setSelectedRecipients] = React.useState([]);
  const [sending, setSending] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  const openAnnouncementModal = () => setShowAnnouncementModal(true);
  const closeAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setAnnouncementMsg("");
    setRecipientType("all");
    setSelectedRecipients([]);
    setSuccessMsg("");
    setErrorMsg("");
    setSending(false);
  };

  // Fetch all users for recipient selection when modal opens
  React.useEffect(() => {
    if (showAnnouncementModal && user?.role === "admin") {
      getDocs(collection(db, "users")).then(snapshot => {
        setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [showAnnouncementModal, user]);
    // Menu items for both roles
  const menuItems =
    user?.role === "admin"
      ? [
          { label: "Add", to: "/add" },
          { label: "Suppliers", to: "/list" },
          { label: "Exam", to: "/exams" },
          { label: "Results", to: "/results" },
          { label: "Attendance", to: "/attendance" },
        ]
      : [
          { label: "Exam", to: "/exams" },
          { label: "Attendance", to: "/attendance" },
        ];

  // For bottom nav, only show up to 3 main actions
  const bottomNavItems = user?.role === "admin"
    ? [
        menuItems[2], // Exam
        menuItems[3], // Results
        menuItems[4], // Attendance
      ]
    : menuItems.slice(0, 3);

  const handleLogout = async () => {
    await signOut(getAuth());
    navigate("/");
  };

  return (
    <div className="menu-modern-root">
      {/* Top App Bar */}
      <div className="menu-appbar">
        <div className="menu-appbar-title">Smart Rye Automatics</div>
      </div>

      {/* Sidebar for desktop */}
      <div className="menu-sidebar">
        {menuItems.map((item, idx) => (
          <Link
            key={item.label + idx}
            to={item.to}
            className={
              "menu-sidebar-link" +
              (location.pathname === item.to ? " active" : "")
            }
          >
            {item.label}
          </Link>
        ))}
        {/* Announcement button for admins */}
        {user?.role === "admin" && (
          <button
            className="menu-sidebar-link"
            style={{ background: "#1976d2", color: "#fff", marginTop: 0 }}
            onClick={openAnnouncementModal}
          >
            Announcement
          </button>
        )}
        <div style={{ flexGrow: 1 }} />
        {user?.department && (
          <div className="menu-sidebar-department" style={{
            color: "#1588fc",
            fontWeight: 700,
            fontSize: "1.05rem",
            marginBottom: 2,
            textAlign: "center"
          }}>
            {user.department}
          </div>
        )}
        {user?.email && (
          <div className="menu-sidebar-email" title={user.email}>
            {user.email}
          </div>
        )}
        <button
          className="menu-sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <NotificationsBar user={user} />
            {/* Main Centered Content */}
      <div
        style={{
          textAlign: 'center',
          padding: window.innerWidth < 900 ? 16 : 24,
          marginTop: window.innerWidth < 900 ? 60 : 0,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 22, color: '#1976d2', marginBottom: 10 }}>
          Website Under Development
        </div>
        <div style={{ fontSize: 17, color: '#222', marginBottom: 18 }}>
          This site is currently a work in progress.<br />
          Features and content are being added by the developer.
        </div>
        <div style={{ fontSize: 15, color: '#888' }}>
          Thank you for your patience!
        </div>
      </div>
      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999
          }}
          onClick={closeAnnouncementModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 340,
              maxWidth: 400,
              boxShadow: "0 4px 32px #b3bfb6"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, color: "#1976d2" }}>
              Send Announcement
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setSending(true);
                setErrorMsg("");
                setSuccessMsg("");
                let recipients = [];
                let toAll = false;
                if (recipientType === "all") {
                  recipients = allUsers.map(u => u.id);
                  toAll = true; // <-- Mark as global
                } else if (recipientType === "admins") {
                  recipients = allUsers.filter(u => u.role === "admin").map(u => u.id);
                } else {
                  recipients = selectedRecipients;
                }
                try {
                  await addDoc(collection(db, "announcements"), {
                    message: announcementMsg,
                    createdAt: serverTimestamp(),
                    fromUserId: user.uid,
                    recipients,
                    toAll, // <-- Add this field
                  });
                  setSuccessMsg("Announcement sent!");
                  setAnnouncementMsg("");
                  setRecipientType("all");
                  setSelectedRecipients([]);
                  setTimeout(() => {
                    setSuccessMsg("");
                    closeAnnouncementModal();
                  }, 1200);
                } catch (err) {
                  setErrorMsg("Failed to send announcement.");
                }
                setSending(false);
              }}
            >
              <textarea
                value={announcementMsg}
                onChange={e => setAnnouncementMsg(e.target.value)}
                placeholder="Enter announcement message"
                required
                style={{
                  width: "100%",
                  minHeight: 60,
                  borderRadius: 8,
                  border: "1px solid #b3bfb6",
                  padding: 8,
                  marginBottom: 14,
                  fontSize: 16,
                  resize: "vertical"
                }}
              />
              <div style={{ marginBottom: 10 }}>
                <label>
                  <input
                    type="radio"
                    name="recipientType"
                    value="all"
                    checked={recipientType === "all"}
                    onChange={() => setRecipientType("all")}
                  />{" "}
                  All Users
                </label>
                {"  "}
                <label>
                  <input
                    type="radio"
                    name="recipientType"
                    value="admins"
                    checked={recipientType === "admins"}
                    onChange={() => setRecipientType("admins")}
                  />{" "}
                  All Admins
                </label>
                {"  "}
                <label>
                  <input
                    type="radio"
                    name="recipientType"
                    value="selected"
                    checked={recipientType === "selected"}
                    onChange={() => setRecipientType("selected")}
                  />{" "}
                  Select...
                </label>
              </div>
              {recipientType === "selected" && (
                <div style={{
                  maxHeight: 100, overflowY: "auto", border: "1px solid #eee", borderRadius: 6, marginBottom: 10, padding: 6
                }}>
                  {allUsers.map(u => (
                    <label key={u.id} style={{ display: "block", fontSize: 15 }}>
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(u.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedRecipients([...selectedRecipients, u.id]);
                          } else {
                            setSelectedRecipients(selectedRecipients.filter(id => id !== u.id));
                          }
                        }}
                      />{" "}
                      {u.email} {u.role === "admin" && <span style={{ color: "#1976d2" }}>(admin)</span>}
                    </label>
                  ))}
                </div>
              )}
              {errorMsg && <div style={{ color: "#e53935", marginBottom: 8 }}>{errorMsg}</div>}
              {successMsg && <div style={{ color: "#43a047", marginBottom: 8 }}>{successMsg}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={closeAnnouncementModal}
                  style={{
                    background: "#eee",
                    color: "#222",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 20px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 20px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <nav className="menu-bottom-nav">
        {/* Email above logout in mobile nav */}
        {user?.email && (
          <div className="menu-bottom-nav-email" title={user.email}>
            {user.email}
          </div>
        )}
        <div className="menu-bottom-nav-links">
          {bottomNavItems.map((item, idx) => (
            <Link
              key={item.label + idx}
              to={item.to}
              className={
                "menu-bottom-nav-link" +
                (location.pathname === item.to ? " active" : "")
              }
            >
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>{item.label}</div>
            </Link>
          ))}
          <button
            className="menu-bottom-nav-link menu-bottom-nav-logout"
            onClick={handleLogout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}