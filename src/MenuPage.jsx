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
      <NotificationsBar user={user} setShowAnnouncementModal={setShowAnnouncementModal} />

      <div className="menu-banner-container">
  {/* Replace the src with your actual banner GIF path */}
  <img
    src="/banner.gif"
    alt="Banner"
    className="menu-banner-gif"
  />
</div>
            {/* Main Centered Content */}
      <div className="menu-main-content">
  <div className="menu-main-content-inner">
    <div style={{ fontWeight: 800, fontSize: 28, color: '#1976d2', marginBottom: 16 }}>
      Website Under Development
    </div>
    <div style={{ fontSize: 20, color: '#222', marginBottom: 24 }}>
      This site is currently a work in progress.<br />
      Features and content are being added by the developer.
    </div>
    <div style={{ fontSize: 17, color: '#888', marginBottom: 32 }}>
      Thank you for your patience!
    </div>
    {/* New containers below */}
    <div className="menu-extra-container">
      <h3>Upcoming Features</h3>
      <ul>
        <li>Supplier Management</li>
        <li>Exam Results Dashboard</li>
        <li>Attendance Tracking</li>
      </ul>
    </div>
    <div className="menu-extra-container">
      <h3>Contact & Support</h3>
      <p>For questions, email <a href="mailto:support@example.com">support@example.com</a></p>
    </div>
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
      {/* <footer className="menu-footer">
  <span>© {new Date().getFullYear()} SmartRye Automatics. All Rights Reserved. &mdash; Web Design by Ivan Mercado</span>
</footer> */}
    </div>
  );
}