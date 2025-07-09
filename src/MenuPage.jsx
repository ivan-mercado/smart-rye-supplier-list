import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import NotificationsBar from "./NotificationsBar";
import AnnouncementModal from "./AnnouncementModal";
import "./MenuPage.css"; // Import the CSS file for styling

export default function MenuPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  // State to control the Announcement modal
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

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
        menuItems[5], // Announcement button
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
            style={{ marginTop: 10 }}
            onClick={() => setShowAnnouncementModal(true)}
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

      {/* Announcement Modal */}
      <AnnouncementModal
        open={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        user={user}
      />
    </div>
  );
}