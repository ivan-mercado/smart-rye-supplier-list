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
          { label: "Add Supplier", to: "/add", icon: "➕" },
          { label: "Supplier List", to: "/list", icon: "📦" },
          { label: "Online Exam", to: "/exams", icon: "📝" },
          { label: "Results", to: "/results", icon: "📊" },
        ]
      : [
          { label: "Online Exam", to: "/exams", icon: "📝" },
        ];

  // For bottom nav, only show 3 main actions (customize as needed)
  const bottomNavItems = menuItems.slice(0, 3);

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
          background: rgba(255,255,255,0.95);
          box-shadow: 0 2px 12px #b0bec533;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 64px;
        }
        .menu-appbar-title {
          font-size: 1.7rem;
          font-weight: 900;
          color: #1976d2;
          letter-spacing: 1.5px;
          text-shadow: 0 2px 8px #b0bec5;
        }
        .menu-logout-btn {
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(90deg, #e53935 60%, #ff7043 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 2px 8px #e3e3e3;
          transition: background 0.2s, transform 0.15s;
        }
        .menu-logout-btn:active {
          background: #b71c1c;
          transform: scale(0.97);
        }
        .menu-center-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100vw;
          padding-top: 80px;
          padding-bottom: 90px;
        }
        .menu-welcome-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 8px 32px #cfd8dc;
          padding: 40px 28px 32px 28px;
          max-width: 420px;
          width: 95vw;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .menu-welcome-title {
          font-size: 2rem;
          font-weight: 900;
          color: #1976d2;
          margin-bottom: 12px;
          text-align: center;
          letter-spacing: 1.2px;
        }
        .menu-welcome-desc {
          font-size: 1.1rem;
          color: #22223b;
          margin-bottom: 28px;
          text-align: center;
          font-weight: 500;
        }
        .menu-welcome-svg {
          margin-bottom: 24px;
        }
        .menu-welcome-footer {
          color: #888;
          font-size: 1rem;
          text-align: center;
          margin-top: 8px;
        }
        .menu-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100vw;
          max-width: 100%;
          background: rgba(255,255,255,0.98);
          box-shadow: 0 -2px 12px #b0bec533;
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 64px;
          z-index: 20;
        }
        .menu-bottom-nav-link {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #1976d2;
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 700;
          padding: 6px 0 0 0;
          border: none;
          background: none;
          transition: color 0.18s;
        }
        .menu-bottom-nav-link.active {
          color: #43a047;
        }
        .menu-bottom-nav-link span {
          font-size: 1.5rem;
          margin-bottom: 2px;
        }
        /* Desktop sidebar for large screens */
        @media (min-width: 900px) {
          .menu-bottom-nav {
            display: none;
          }
          .menu-sidebar {
            position: fixed;
            top: 64px;
            left: 0;
            width: 220px;
            height: calc(100vh - 64px);
            background: rgba(255,255,255,0.18);
            box-shadow: 4px 0 32px #b0bec5;
            border-top-right-radius: 36px;
            border-bottom-right-radius: 36px;
            backdrop-filter: blur(18px);
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 32px 0 24px 0;
          }
          .menu-sidebar-link {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px 24px;
            color: #1976d2;
            text-decoration: none;
            font-weight: 700;
            font-size: 1.1rem;
            border-radius: 12px;
            margin: 8px 0;
            background: rgba(255,255,255,0.85);
            box-shadow: 0 2px 12px #b0bec533;
            transition: background 0.2s, color 0.2s, transform 0.15s;
            cursor: pointer;
            width: 180px;
            justify-content: flex-start;
          }
          .menu-sidebar-link.active, .menu-sidebar-link:hover {
            background: #1976d2;
            color: #fff;
            transform: translateY(-2px) scale(1.04);
          }
        }
        /* Hide sidebar on mobile */
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
        <button className="menu-logout-btn" onClick={handleLogout}>
          Logout
        </button>
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
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Main Centered Content */}
      <div className="menu-center-content">
        <div className="menu-welcome-card">
          <div className="menu-welcome-title">
            Welcome to Smart Rye Automatics
          </div>
          <div className="menu-welcome-desc">
            Manage your suppliers, track your business, and grow with confidence.
          </div>
          <div className="menu-welcome-svg">
            <svg width="80" height="80" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="56" fill="#e3f0ff" stroke="#1976d2" strokeWidth="4"/>
              <rect x="35" y="70" width="50" height="18" rx="9" fill="#43a047"/>
              <rect x="50" y="35" width="20" height="40" rx="10" fill="#1976d2"/>
              <circle cx="60" cy="30" r="12" fill="#43a047" stroke="#1976d2" strokeWidth="3"/>
              <ellipse cx="60" cy="30" rx="5" ry="7" fill="#fff" opacity="0.7"/>
            </svg>
          </div>
          <div className="menu-welcome-footer">
            Get started by choosing an option from the menu.
          </div>
        </div>
      </div>
            {/* Bottom Navigation for Mobile */}
      <nav className="menu-bottom-nav">
        {bottomNavItems.map((item, idx) => (
          <Link
            key={item.label + idx}
            to={item.to}
            className={
              "menu-bottom-nav-link" +
              (location.pathname === item.to ? " active" : "")
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <button
          className="menu-bottom-nav-link"
          style={{ color: "#e53935", fontWeight: 800, border: "none", background: "none" }}
          onClick={handleLogout}
        >
          <span>🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
}