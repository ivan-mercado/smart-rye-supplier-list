import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";

export default function MenuPage({ user }) {
  const navigate = useNavigate();
  const menuItems = [
    ...(user?.role === "admin"
      ? [
          { label: 'Add Supplier', to: '/add', icon: '➕', active: true },
          { label: 'Supplier List', to: '/list', icon: '📦', active: true },
          { label: 'Online Examination', to: '/exams', icon: '📝', active: true },
          { label: 'Examination Results', to: '/results', icon: '📊', active: true },
        ]
      : user?.role === "user"
      ? [
          { label: 'Online Examination', to: '/exams', icon: '📝', active: true },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await signOut(getAuth());
    navigate('/');
  };

  return (
    <div className="menu-root">
      <style>
        {`
        .menu-root {
          min-height: 100vh;
          height: 100vh;
          display: flex;
          background: linear-gradient(120deg, #e3f0ff 0%, #f9fbfc 100%);
          font-family: 'Segoe UI', Arial, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .menu-bg1, .menu-bg2 {
          position: absolute;
          z-index: 0;
          filter: blur(30px);
          opacity: 0.18;
        }
        .menu-bg1 {
          top: -100px; left: -100px; width: 400px; height: 400px;
          background: radial-gradient(circle at 30% 30%, #1976d2 0%, transparent 70%);
        }
        .menu-bg2 {
          bottom: -120px; right: -120px; width: 400px; height: 400px;
          background: radial-gradient(circle at 70% 70%, #43a047 0%, transparent 70%);
        }
        .menu-sidebar {
          width: 290px;
          background: rgba(255,255,255,0.18);
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 0 32px 0;
          box-shadow: 4px 0 32px #b0bec5;
          border-top-right-radius: 36px;
          border-bottom-right-radius: 36px;
          backdrop-filter: blur(18px);
          z-index: 1;
          position: relative;
        }
        .menu-logo {
          font-weight: 900;
          font-size: 32px;
          letter-spacing: 2px;
          margin-bottom: 48px;
          text-shadow: 0 2px 12px #1565c0;
          color: #1976d2;
          background: rgba(255,255,255,0.7);
          border-radius: 16px;
          padding: 12px 24px;
          box-shadow: 0 2px 8px #b0bec5;
          text-align: center;
        }
        .menu-nav {
          width: 100%;
        }
        .menu-link, .menu-link-inactive {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 16px 32px;
          font-weight: 700;
          font-size: 19px;
          border-radius: 14px;
          margin: 10px 22px;
          box-shadow: 0 2px 12px #b0bec533;
          position: relative;
          overflow: hidden;
        }
        .menu-link {
          color: #1976d2;
          background: rgba(255,255,255,0.85);
          text-decoration: none;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          cursor: pointer;
        }
        .menu-link:hover {
          background: #1976d2;
          color: #fff;
          transform: translateY(-2px) scale(1.04);
        }
        .menu-link-inactive {
          color: #b0bec5;
          background: rgba(255,255,255,0.45);
          opacity: 0.7;
          cursor: not-allowed;
          user-select: none;
        }
        .menu-logout-btn {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 16px 32px;
          color: #fff;
          background: linear-gradient(90deg, #e53935 60%, #ff7043 100%);
          border: none;
          border-radius: 14px;
          margin: 18px 22px 0 22px;
          font-weight: 700;
          font-size: 19px;
          cursor: pointer;
          box-shadow: 0 2px 12px #b0bec533;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          text-align: left;
          outline: none;
        }
        .menu-logout-btn:hover {
          background: #b71c1c;
          transform: translateY(-2px) scale(1.04);
        }
        .menu-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 0;
          z-index: 1;
        }
        .menu-hero {
          background: rgba(255,255,255,0.92);
          border-radius: 36px;
          box-shadow: 0 8px 32px #cfd8dc;
          padding: 64px 56px;
          max-width: 650px;
          text-align: center;
        }
        .menu-hero-title {
          font-size: 48px;
          font-weight: 900;
          color: #1976d2;
          margin-bottom: 16px;
          letter-spacing: 2px;
          text-shadow: 0 2px 8px #b0bec5;
        }
        .menu-hero-desc {
          font-size: 24px;
          color: #22223b;
          margin-bottom: 36px;
          font-weight: 500;
          text-shadow: 0 1px 4px #e3e3e3;
        }
        .menu-hero-svg {
          margin: 0 auto 32px auto;
          width: 130px;
          height: 130px;
        }
        .menu-hero-footer {
          font-size: 20px;
          color: #555;
          margin-bottom: 8px;
          font-weight: 500;
          opacity: 0.85;
        }

        /* Responsive styles */
        @media (max-width: 900px) {
          .menu-root {
            flex-direction: column;
          }
          .menu-sidebar {
            width: 100%;
            min-width: 0;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            border-radius: 0 0 24px 24px;
            padding: 18px 10px;
            box-shadow: none;
            margin-bottom: 18px;
          }
          .menu-main {
            border-radius: 24px;
            padding: 24px 8vw;
          }
        }
        @media (max-width: 600px) {
          .menu-root {
            flex-direction: column;
          }
          .menu-sidebar {
            width: 100%;
            min-width: 0;
            flex-direction: column;
            align-items: center;
            border-radius: 0 0 18px 18px;
            padding: 12px 4vw;
            box-shadow: none;
            margin-bottom: 12px;
          }
          .menu-logo {
            font-size: 1.3rem;
            margin-bottom: 18px;
            padding: 8px 10px;
          }
          .menu-hero {
            border-radius: 14px;
            padding: 18px 2vw;
          }
          .menu-hero-title {
            font-size: 1.3rem;
            margin-bottom: 10px;
          }
          .menu-hero-desc {
            font-size: 1rem;
            margin-bottom: 18px;
          }
          .menu-hero-footer {
            font-size: 1rem;
          }
          .menu-link, .menu-link-inactive, .menu-logout-btn {
            font-size: 1rem;
            padding: 10px 0;
            border-radius: 8px;
            margin: 8px 8px;
          }
        }
        `}
      </style>
            {/* Optional animated background shapes */}
      <div className="menu-bg1" />
      <div className="menu-bg2" />

      {/* Sidebar Menu */}
      <aside className="menu-sidebar">
        <div className="menu-logo">
          Smart Rye<br />Automatics
        </div>
        <nav className="menu-nav">
          {menuItems.map((item, idx) =>
            item.active ? (
              <Link
                key={item.label + idx}
                to={item.to}
                className="menu-link"
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                {item.label}
              </Link>
            ) : (
              <div
                key={item.label + idx}
                className="menu-link-inactive"
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                {item.label}
              </div>
            )
          )}
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="menu-logout-btn"
          >
            <span style={{ fontSize: 24 }}>🚪</span>
            Logout
          </button>
        </nav>
      </aside>
            {/* Hero Section */}
      <main className="menu-main">
        <div className="menu-hero">
          <div className="menu-hero-title">
            Welcome to Smart Rye Automatics
          </div>
          <div className="menu-hero-desc">
            Manage your suppliers, track your business, and grow with confidence.
          </div>
          {/* Unique SVG Illustration */}
          <div className="menu-hero-svg">
            <svg width="130" height="130" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="56" fill="#e3f0ff" stroke="#1976d2" strokeWidth="4"/>
              <rect x="35" y="70" width="50" height="18" rx="9" fill="#43a047"/>
              <rect x="50" y="35" width="20" height="40" rx="10" fill="#1976d2"/>
              <circle cx="60" cy="30" r="12" fill="#43a047" stroke="#1976d2" strokeWidth="3"/>
              <ellipse cx="60" cy="30" rx="5" ry="7" fill="#fff" opacity="0.7"/>
            </svg>
          </div>
          <div className="menu-hero-footer">
            Get started by choosing an option from the menu.
          </div>
        </div>
      </main>
    </div>
  );
}