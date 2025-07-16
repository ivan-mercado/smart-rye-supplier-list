import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import NotificationsBar from "./NotificationsBar";
import { FaCheckCircle } from "react-icons/fa";
import AnnouncementModal from "./AnnouncementModal";
import "./MenuPage.css"; 

export default function MenuPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  // State to control the Announcement modal
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Animation state for main content
  const [animateIn, setAnimateIn] = useState(false);
  useEffect(() => {
    setAnimateIn(true);
  }, []);

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
        {/* Workers Attendance link for both roles */}
        {user?.role === "admin" ? (
          <Link
            to="/workers-attendance-admin"
            className="menu-sidebar-link"
            style={{ marginTop: 10 }}
          >
            Workers Attendance (Admin)
          </Link>
        ) : (
          <Link
            to="/workers-attendance"
            className="menu-sidebar-link"
            style={{ marginTop: 10 }}
          >
            Workers Attendance
          </Link>
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
            {/* Redesigned Welcome Card */}
      <div
        style={{
          margin: "32px auto 32px auto",
          maxWidth: 1200,
          borderRadius: 16,
          boxShadow: "0 2px 16px #b3bfb633",
          background: "#fff",
          padding: "0 0 24px 0",
          border: "1.5px solid #eee"
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 24,
            color: "#b71c1c",
            padding: "18px 32px 10px 32px",
            borderBottom: "1px solid #eee",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            background: "#fff"
          }}
        >
          Welcome to Smart Rye Business Management System
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            background: "#415256",
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            padding: "32px 24px",
            gap: 32,
            minHeight: 220,
            justifyContent: "space-between"
          }}
        >
          {/* Left: Button */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <a
              href="https://www.smartrye.com.ph/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "#fff",
                color: "#1976d2",
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 22,
                padding: "12px 32px",
                textDecoration: "none",
                boxShadow: "0 2px 8px #b0bec5",
                border: "none",
                transition: "background 0.18s, color 0.18s",
                outline: "none"
              }}
              onMouseOver={e => {
  e.currentTarget.style.background = "#1976d2";
  e.currentTarget.style.color = "#fff";
}}
onMouseOut={e => {
  e.currentTarget.style.background = "#fff";
  e.currentTarget.style.color = "#1976d2";
}}
            >
              SRA Website
            </a>
          </div>
          {/* Right: Banner */}
          <div style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src="/banner.gif"
              alt="Smart Rye Banner"
              style={{
                maxWidth: "100%",
                maxHeight: 105,
                borderRadius: 12,
                objectFit: "contain",
                background: "#fff",
                boxShadow: "0 2px 8px #b0bec5"
              }}
            />
          </div>
        </div>
      </div>
      {/* Three Info Containers Below Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: 32,
        margin: '32px 0 0 0',
        width: '100%',
        maxWidth: 1100,
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 12px #b0bec533',
          padding: '28px 20px',
          textAlign: 'center',
          border: '1.5px solid #e3e8f7'
        }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#1976d2', marginBottom: 8 }}>Quick Stats</div>
          <div style={{ fontSize: 16, color: '#444' }}>Exams: 2<br />Attendance: 100%</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 12px #b0bec533',
          padding: '28px 20px',
          textAlign: 'center',
          border: '1.5px solid #e3e8f7'
        }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#1976d2', marginBottom: 8 }}>Reminders</div>
          <div style={{ fontSize: 16, color: '#444' }}>Check your exam schedule regularly.</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 12px #b0bec533',
          padding: '28px 20px',
          textAlign: 'center',
          border: '1.5px solid #e3e8f7'
        }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#1976d2', marginBottom: 8 }}>Support</div>
          <div style={{ fontSize: 16, color: '#444' }}>Need help? <br />Contact support anytime.</div>
        </div>
      </div>
      {/* Floating Worker Attendance FAB (mobile only) */}
<div
  className="fab-worker-attendance"
  style={{
    position: "fixed",
    right: 24,
    bottom: 215, // adjust as needed to stack above other FABs
    zIndex: 100,
    display: "block"
  }}
>
  <button
  onClick={() => navigate(user?.role === "admin" ? "/workers-attendance-admin" : "/workers-attendance")}
  style={{
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    boxShadow: "0 2px 8px #b0bec5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    marginBottom: 16,
    cursor: "pointer"
  }}
  title="Workers Attendance"
>
  W 
</button>
</div>
      {/* Main Centered Content */}
      <div className="menu-main-content">
        <div className={`menu-main-content-inner${animateIn ? " menu-animate-in" : ""}`}>
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
            <p>For questions, email <a href="mailto:support@example.com">ivankr.mercado@gmail.com</a></p>
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