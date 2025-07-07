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
          { label: "Add", to: "/add", icon: "➕" },
          { label: "Suppliers", to: "/list", icon: "📦" },
          { label: "Exam", to: "/exams", icon: "📝" },
          { label: "Results", to: "/results", icon: "📊" },
          { label: "Attendance", to: "/attendance", icon: "⏰" },
          // { label: "Resumes", to: "/resumes", icon: "📄" },
        ]
      : [
          { label: "Exam", to: "/exams", icon: "📝" },
          { label: "Attendance", to: "/attendance", icon: "⏰" },
          // { label: "Upload Resume", to: "/upload-resume", icon: "📤" },
        ];

  // For bottom nav, only show up to 3 main actions
  const bottomNavItems = user?.role === "admin"
    ? [
        menuItems[2], // Exam
        menuItems[3], // Results
        // menuItems[4], // Resumes
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
          text-shadow: 0 2px 8px #b0bec5;
          flex: 1;
          text-align: center;
        }
        .menu-sidebar-email {
          color: #1976d2;
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
          color: #1976d2;
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
        .menu-logout-btn {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          color: #1976d2;
          border: none;
          border-radius: 50%;
          padding: 6px;
          font-size: 1.3rem;
          cursor: pointer;
          transition: background 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .menu-logout-btn:active, .menu-logout-btn:focus {
          background: #e3f0ff;
        }
        .menu-center-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100vw;
          padding-top: 70px;
          padding-bottom: 80px;
        }
        .menu-welcome-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px #cfd8dc;
          padding: 28px 12px 20px 12px;
          max-width: 370px;
          width: 94vw;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .menu-welcome-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: #1976d2;
          margin-bottom: 8px;
          text-align: center;
          letter-spacing: 1.1px;
        }
        .menu-welcome-desc {
          font-size: 1rem;
          color: #22223b;
          margin-bottom: 18px;
          text-align: center;
          font-weight: 500;
        }
        .menu-welcome-svg {
          margin-bottom: 16px;
        }
        .menu-welcome-footer {
          color: #888;
          font-size: 0.98rem;
          text-align: center;
          margin-top: 4px;
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
          flex-direction: column;
          align-items: center;
          height: auto;
          z-index: 20;
        }
        .menu-bottom-nav-links {
          width: 100vw;
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 56px;
        }
        .menu-bottom-nav-link {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #1976d2;
          text-decoration: none;
          font-size: 0.98rem;
          font-weight: 700;
          padding: 0;
          border: none;
          background: none;
          transition: color 0.18s;
          height: 100%;
        }
        .menu-bottom-nav-link.active {
          color: #43a047;
        }
        .menu-bottom-nav-link span {
          font-size: 1.3rem;
          margin-bottom: 1px;
        }
        .menu-bottom-nav-logout {
          color: #b71c1c;
          font-weight: 700;
        }
        /* Desktop sidebar for large screens */
        @media (min-width: 900px) {
          .menu-bottom-nav {
            display: none;
          }
          .menu-sidebar {
            position: fixed;
            top: 52px;
            left: 0;
            width: 180px;
            height: calc(100vh - 52px);
            background: rgba(255,255,255,0.18);
            box-shadow: 4px 0 32px #b0bec5;
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
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 18px;
            color: #1976d2;
            text-decoration: none;
            font-weight: 700;
            font-size: 1rem;
            border-radius: 10px;
            margin: 6px 0;
            background: rgba(255,255,255,0.85);
            box-shadow: 0 2px 12px #b0bec533;
            transition: background 0.2s, color 0.2s, transform 0.15s;
            cursor: pointer;
            width: 140px;
            justify-content: flex-start;
          }
          .menu-sidebar-link.active, .menu-sidebar-link:hover {
            background: #1976d2;
            color: #fff;
            transform: translateY(-2px) scale(1.04);
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
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {/* Spacer for separation */}
        <div style={{ flexGrow: 1 }} />
        {user?.department && (
  <div className="menu-sidebar-department" style={{
    color: "#1976d2",
    fontWeight: 700,
    fontSize: "1.05rem",
    marginBottom: 2,
    textAlign: "center"
  }}>
    {user.department}
  </div>
)}
        {/* Email above logout */}
        {user?.email && (
          <div className="menu-sidebar-email" title={user.email}>
            
            {user.email}
          </div>
        )}
        {/* Logout Button */}
        <button
          className="menu-sidebar-link"
          style={{
            color: "#b71c1c",
            fontWeight: 700,
            background: "rgba(255,255,255,0.85)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "140px",
            justifyContent: "flex-start",
            marginBottom: "56px",
            marginTop: "8px",
          }}
          onClick={handleLogout}
        >
          <span style={{ fontSize: 20 }}>🚪</span>
          Logout
        </button>
      </div>
            {/* Main Centered Content */}
      <div style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#1976d2', marginBottom: 10 }}>
          🚧 Website Under Development
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
              <span>{item.icon}</span>
              <div style={{ fontSize: "0.8rem", marginTop: 1 }}>{item.label}</div>
            </Link>
          ))}
          <button
            className="menu-bottom-nav-link menu-bottom-nav-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <span>🚪</span>
            <div style={{ fontSize: "0.8rem", marginTop: 1 }}>Logout</div>
          </button>
        </div>
      </nav>
    </div>
  );
}