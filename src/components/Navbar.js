import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DESIGNATION_LABELS = {
  fresher: 'Fresher', junior_developer: 'Junior Dev', mid_developer: 'Mid Dev',
  senior_developer: 'Senior Dev', lead: 'Lead', manager: 'Manager',
  director: 'Director', executive: 'Executive', designer: 'Designer',
  data_scientist: 'Data Scientist', devops: 'DevOps', qa_engineer: 'QA Engineer', product_manager: 'PM'
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'recruiter';
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => { logout(); navigate('/login'); setMobileMenuOpen(false); };

  const navLinks = isAdmin ? [
    { to: '/admin', label: 'Dashboard', active: location.pathname === '/admin' },
    { to: '/admin/post-job', label: 'Post Job', active: isActive('/admin/post-job') }
  ] : [
    { to: '/jobs', label: 'Browse Jobs', active: location.pathname === '/jobs' },
    { to: '/my-applications', label: 'My Applications', active: isActive('/my-applications') }
  ];

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        {/* Mobile: Hamburger */}
        <button 
          className={`hamburger mobile-only ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>

        {/* Logo */}
        <Link to={isAdmin ? '/admin' : '/jobs'} style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span>Hire<b>Bridge</b></span>
        </Link>

        {/* Desktop Links */}
        <div className="desktop-only" style={styles.links}>
          {navLinks.map(link => (
            <NavLink key={link.to} {...link} />
          ))}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          <div style={styles.userChip} onClick={() => setMenuOpen(!menuOpen)}>
            <div style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
            <div className="desktop-only" style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userRole}>
                {isAdmin ? (user.role === 'admin' ? '⚡ Admin' : '🏢 Recruiter') : `${DESIGNATION_LABELS[user.designation] || user.designation}`}
              </span>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', marginLeft: 4 }}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {menuOpen && (
            <div style={styles.dropdown} onClick={() => setMenuOpen(false)}>
              <Link to="/profile" style={styles.dropItem}>
                <span>👤</span> Profile
              </Link>
              <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <button onClick={handleLogout} style={styles.dropItemBtn}>
                <span>🚪</span> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-nav-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Link to="/" style={styles.logo} onClick={() => setMobileMenuOpen(false)}>
                <span style={styles.logoIcon}>◈</span>
                <span>Hire<b>Bridge</b></span>
              </Link>
              <button 
                className="hamburger open"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span></span><span></span><span></span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Navigation</p>
              {navLinks.map(link => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  style={{ 
                    ...styles.navLink, 
                    ...(link.active ? styles.navLinkActive : {}),
                    padding: '12px 14px',
                    fontSize: 16
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 'auto', padding: '20px', background: 'var(--surface)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ ...styles.avatar, width: 44, height: 44, fontSize: 18 }}>{user.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email}</div>
                </div>
              </div>
              <Link to="/profile" className="btn btn-outline" style={{ width: '100%', marginBottom: 10 }} onClick={() => setMobileMenuOpen(false)}>View Profile</Link>
              <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>Sign Out</button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} style={{ ...styles.navLink, ...(active ? styles.navLinkActive : {}) }}>
      {label}
      {active && <span style={styles.activeDot} />}
    </Link>
  );
}

const styles = {
  nav: {
    background: 'rgba(255, 255, 255, 0.8)', borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  inner: { display: 'flex', alignItems: 'center', height: 64, gap: 32, position: 'relative' },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700,
    color: 'var(--ink)', flexShrink: 0,
  },
  logoIcon: { fontSize: 22, color: 'var(--accent)' },
  links: { display: 'flex', gap: 4, flex: 1 },
  navLink: {
    padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6,
    position: 'relative', transition: 'all 0.2s',
  },
  navLinkActive: { color: 'var(--ink)', background: 'var(--surface-2)' },
  activeDot: {
    width: 4, height: 4, borderRadius: '50%',
    background: 'var(--accent)', display: 'inline-block',
  },
  right: { marginLeft: 'auto', position: 'relative' },
  userChip: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '6px 6px 6px 12px', borderRadius: 40,
    border: '1px solid var(--border)', cursor: 'pointer',
    transition: 'all 0.2s', background: 'var(--surface)',
  },
  avatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'var(--accent)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, flexShrink: 0,
  },
  userInfo: { display: 'flex', flexDirection: 'column', lineHeight: 1.3 },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--ink)' },
  userRole: { fontSize: 11, color: 'var(--muted)' },
  dropdown: {
    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
    background: 'white', borderRadius: 12,
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
    padding: '6px', minWidth: 180, zIndex: 200,
    animation: 'fadeUp 0.15s ease',
  },
  dropItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 14px', borderRadius: 8, fontSize: 14,
    color: 'var(--ink)', transition: 'background 0.15s',
  },
  dropItemBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 14px', borderRadius: 8, fontSize: 14,
    color: 'var(--danger)', background: 'none', border: 'none',
    width: '100%', cursor: 'pointer', transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
};
