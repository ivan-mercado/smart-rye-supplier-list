import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

export default function MenuPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

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
      <style>
        {`
        .menu-modern-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #e3f0ff 0%, #f9fbfc 100%);
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .menu-appbar {
          width: 100vw;
          max-width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10;
          background: rgba(255,255,255,0.97);
          box-shadow: 0 2px 12px #b0bec533;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 52px;
        }
        .menu-appbar-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1976d2;
          letter-spacing: 1.2px;
          text-shadow: 0 2px 8px #b3bfb6;
          flex: 1;
          text-align: center;
        }
        .menu-sidebar {
          position: fixed;
          top: 52px;
          left: 0;
          width: 180px;
          height: calc(100vh - 52px);
          background: #415256;
          box-shadow: 4px 0 32px #b3bfb6;
          border-top-right-radius: 28px;
          border-bottom-right-radius: 28px;
          backdrop-filter: blur(18px);
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 0 18px 0;
        }
        .menu-sidebar-link {
          display: block;
          width: 150px;
          padding: 14px 0;
          margin: 10px 0;
          background: #fff;
          color: #415256;
          font-weight: 700;
          font-size: 1.08rem;
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 8px #d7d7d7;
          text-align: center;
          letter-spacing: 0.5px;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
          text-decoration: none;
          cursor: pointer;
        }
        .menu-sidebar-link:focus,
        .menu-sidebar-link:hover,
        .menu-sidebar-link.active {
          background: #1588fc !important;
          color: #fff !important;
          box-shadow: 0 4px 16px #b3bfb6;
          outline: none;
        }
        .menu-sidebar-logout {
          display: block;
          width: 150px;
          padding: 14px 0;
          margin: 24px 0 56px 0;
          background: #e53935;
          color: #fff;
          font-weight: 700;
          font-size: 1.08rem;
          border: none;
          border-radius: 12px;
          text-align: center;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px #d7d7d7;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }
        .menu-sidebar-logout:focus,
        .menu-sidebar-logout:hover {
          background: #b71c1c;
          color: #fff;
        }
        .menu-sidebar-email {
          color: #1588fc;
          font-weight: 600;
          font-size: 1rem;
          opacity: 0.95;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
          word-break: break-all;
          text-align: center;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .menu-bottom-nav-email {
          color: #1588fc;
          font-weight: 600;
          font-size: 0.98rem;
          opacity: 0.95;
          letter-spacing: 0.5px;
          width: 100vw;
          text-align: center;
          padding: 4px 0 0 0;
          background: none;
          word-break: break-all;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 900px) {
          .menu-bottom-nav {
            display: none;
          }
        }
        @media (max-width: 899px) {
          .menu-sidebar {
            display: none;
          }
        }
        `}
      </style>
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
      {/* Main Centered Content */}
      <div style={{ textAlign: 'center', padding: 24 }}>
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
            style={{
              color: "#e53935",
              fontWeight: 700,
              background: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 0",
              margin: "0 8px",
              fontSize: "1rem"
            }}
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}