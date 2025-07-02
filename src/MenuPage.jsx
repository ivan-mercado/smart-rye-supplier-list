import React from 'react';
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
  // Optionally, add coming soon or other items here
];
  const handleLogout = async () => {
    await signOut(getAuth());
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      display: 'flex',
      background: 'linear-gradient(120deg, #e3f0ff 0%, #f9fbfc 100%)',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Optional animated background shapes */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle at 30% 30%, #1976d2 0%, transparent 70%)',
        zIndex: 0,
        filter: 'blur(30px)',
        opacity: 0.18
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-120px',
        right: '-120px',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle at 70% 70%, #43a047 0%, transparent 70%)',
        zIndex: 0,
        filter: 'blur(30px)',
        opacity: 0.18
      }} />

      {/* Sidebar Menu */}
      <aside style={{
        width: 290,
        background: 'rgba(255,255,255,0.18)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 0 32px 0',
        boxShadow: '4px 0 32px #b0bec5',
        borderTopRightRadius: 36,
        borderBottomRightRadius: 36,
        backdropFilter: 'blur(18px)',
        zIndex: 1,
        position: 'relative'
      }}>
        <div style={{
          fontWeight: 900,
          fontSize: 32,
          letterSpacing: 2,
          marginBottom: 48,
          textShadow: '0 2px 12px #1565c0',
          color: '#1976d2',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: 16,
          padding: '12px 24px',
          boxShadow: '0 2px 8px #b0bec5',
        }}>
          Smart Rye<br />Automatics
        </div>
        <nav style={{ width: '100%' }}>
          {menuItems.map((item, idx) =>
            item.active ? (
              <Link
                key={item.label + idx}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '16px 32px',
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 19,
                  borderRadius: 14,
                  margin: '10px 22px',
                  background: 'rgba(255,255,255,0.85)',
                  boxShadow: '0 2px 12px #b0bec533',
                  transition: 'background 0.2s, color 0.2s, transform 0.15s',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#1976d2';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.85)';
                  e.currentTarget.style.color = '#1976d2';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                {item.label}
              </Link>
            ) : (
              <div
                key={item.label + idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '16px 32px',
                  color: '#b0bec5',
                  fontWeight: 700,
                  fontSize: 19,
                  borderRadius: 14,
                  margin: '10px 22px',
                  background: 'rgba(255,255,255,0.45)',
                  boxShadow: '0 2px 12px #b0bec533',
                  opacity: 0.7,
                  cursor: 'not-allowed',
                  userSelect: 'none'
                }}
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                {item.label}
              </div>
            )
          )}
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '16px 32px',
              color: '#fff',
              background: 'linear-gradient(90deg, #e53935 60%, #ff7043 100%)',
              border: 'none',
              borderRadius: 14,
              margin: '18px 22px 0 22px',
              fontWeight: 700,
              fontSize: 19,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #b0bec533',
              transition: 'background 0.2s, color 0.2s, transform 0.15s',
              textAlign: 'left',
              outline: 'none'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#b71c1c';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #e53935 60%, #ff7043 100%)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span style={{ fontSize: 24 }}>🚪</span>
            Logout
          </button>
        </nav>
      </aside>
      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 0,
        zIndex: 1
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 36,
          boxShadow: '0 8px 32px #cfd8dc',
          padding: '64px 56px',
          maxWidth: 650,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#1976d2',
            marginBottom: 16,
            letterSpacing: 2,
            textShadow: '0 2px 8px #b0bec5'
          }}>
            Welcome to Smart Rye Automatics
          </div>
          <div style={{
            fontSize: 24,
            color: '#22223b',
            marginBottom: 36,
            fontWeight: 500,
            textShadow: '0 1px 4px #e3e3e3'
          }}>
            Manage your suppliers, track your business, and grow with confidence.
          </div>
          {/* Unique SVG Illustration */}
          <div style={{ margin: '0 auto 32px auto', width: 130, height: 130 }}>
            <svg width="130" height="130" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="56" fill="#e3f0ff" stroke="#1976d2" strokeWidth="4"/>
              <rect x="35" y="70" width="50" height="18" rx="9" fill="#43a047"/>
              <rect x="50" y="35" width="20" height="40" rx="10" fill="#1976d2"/>
              <circle cx="60" cy="30" r="12" fill="#43a047" stroke="#1976d2" strokeWidth="3"/>
              <ellipse cx="60" cy="30" rx="5" ry="7" fill="#fff" opacity="0.7"/>
            </svg>
          </div>
          <div style={{
            fontSize: 20,
            color: '#555',
            marginBottom: 8,
            fontWeight: 500,
            opacity: 0.85
          }}>
            Get started by choosing an option from the menu.
          </div>
        </div>
      </main>
    </div>
  );
}