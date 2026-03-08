import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

const Icons = {
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  finance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  projects: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  habits: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  logo: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c6fcd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  notes: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h12a2 2 0 0 1 2 2v12l-4 4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><polyline points="14 17 14 21 18 21"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, generateNotifications, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs]     = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  useEffect(() => {
    if (user) generateNotifications();
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { path: '/dashboard', label: 'Home',     icon: Icons.home     },
    { path: '/finance',   label: 'Finance',  icon: Icons.finance  },
    { path: '/projects',  label: 'Projects', icon: Icons.projects },
    { path: '/habits',    label: 'Habits',   icon: Icons.habits   },
    { path: '/notes',     label: 'Notes',    icon: Icons.notes    },
  ];

  const notifColors = { warning: '#ff6b6b', info: '#f0a500', reminder: '#7c6fcd', success: '#4caf50', tip: '#00bcd4' };
  const glassBg = theme.isDark ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)';

  return (
    <>
      <style>{`
        .nav-link { transition: all 0.2s ease; }
        .nav-link:hover { color: #7c6fcd !important; background: rgba(124,111,205,0.1) !important; border-radius: 8px; }
        .icon-btn { transition: all 0.2s ease; }
        .icon-btn:hover { background: rgba(124,111,205,0.15) !important; transform: scale(1.05); }
        .notif-item:hover { background: rgba(124,111,205,0.08) !important; }
        .user-menu-item:hover { background: rgba(124,111,205,0.1) !important; }
        .logout-item:hover { background: rgba(255,107,107,0.1) !important; color: #ff6b6b !important; }
        .mobile-menu { animation: slideDown 0.25s ease; }
        .mobile-link:hover { background: rgba(124,111,205,0.1) !important; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Main Navbar ── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 20px', height: 64, position: 'sticky', top: 0, zIndex: 100,
        background: glassBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.isDark ? 'rgba(124,111,205,0.2)' : 'rgba(124,111,205,0.15)'}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>

        {/* Left: Logo + Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginRight: 12 }}
            onClick={() => navigate('/dashboard')}>
            {Icons.logo}
            <span style={{ color: '#7c6fcd', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>LifeOS</span>
          </div>

          {/* Desktop Nav Links */}
          {!isMobile && navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <button key={link.path} className="nav-link"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', borderRadius: 8, cursor: 'pointer',
                  background: isActive ? 'rgba(124,111,205,0.15)' : 'transparent',
                  color: isActive ? '#7c6fcd' : theme.subtext,
                  fontWeight: isActive ? '600' : '400', fontSize: '0.9rem', position: 'relative' }}
                onClick={() => navigate(link.path)}>
                <span style={{ color: isActive ? '#7c6fcd' : theme.subtext }}>{link.icon}</span>
                {link.label}
                {isActive && <span style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, background: '#7c6fcd', borderRadius: 2 }} />}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Theme Toggle */}
          <button className="icon-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: 'none', borderRadius: 10, cursor: 'pointer', background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.text }}
            onClick={toggleTheme}>
            {theme.isDark ? Icons.sun : Icons.moon}
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button className="icon-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: 'none', borderRadius: 10, cursor: 'pointer',
                background: showNotifs ? 'rgba(124,111,205,0.15)' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.text, position: 'relative' }}
              onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}>
              {Icons.bell}
              {unreadCount > 0 && <span style={{ position: 'absolute', top: 6, right: 6, background: '#ff6b6b', borderRadius: '50%', width: 8, height: 8, border: '2px solid ' + (theme.isDark ? '#0f0f1a' : '#fff') }} />}
            </button>

            {showNotifs && (
              <div className="scale-in" style={{ position: 'absolute', right: 0, top: 48, width: isMobile ? 300 : 360, background: theme.isDark ? 'rgba(26,26,46,0.97)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderRadius: 16, boxShadow: '0 16px 40px rgba(0,0,0,0.2)', border: `1px solid ${theme.isDark ? 'rgba(124,111,205,0.2)' : 'rgba(124,111,205,0.15)'}`, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: theme.text }}>{Icons.bell}</span>
                    <h3 style={{ color: theme.text, margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>Notifications</h3>
                    {unreadCount > 0 && <span style={{ background: '#ff6b6b', color: '#fff', borderRadius: 12, padding: '1px 7px', fontSize: '0.75rem', fontWeight: 'bold' }}>{unreadCount}</span>}
                  </div>
                  {unreadCount > 0 && <button style={{ background: 'none', border: 'none', color: '#7c6fcd', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }} onClick={markAllRead}>Mark all read</button>}
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0
                    ? <p style={{ color: theme.subtext, textAlign: 'center', padding: 28, margin: 0 }}>All caught up! ✨</p>
                    : notifications.map(n => (
                      <div key={n.id} className="notif-item"
                        style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, background: n.read ? 'transparent' : notifColors[n.type] + '0d', cursor: 'pointer' }}
                        onClick={() => { markRead(n.id); setShowNotifs(false); navigate(n.link); }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: notifColors[n.type] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{n.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <p style={{ color: theme.text, margin: 0, fontWeight: n.read ? '400' : '600', fontSize: '0.88rem' }}>{n.title}</p>
                              {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: notifColors[n.type], flexShrink: 0, marginLeft: 8 }} />}
                            </div>
                            <p style={{ color: theme.subtext, margin: '2px 0', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                            <span style={{ fontSize: '0.72rem', color: notifColors[n.type], fontWeight: '600' }}>{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div style={{ padding: '10px 16px', borderTop: `1px solid ${theme.border}`, textAlign: 'center' }}>
                  <span style={{ color: theme.subtext, fontSize: '0.78rem' }}>{unreadCount} unread · {notifications.length} total</span>
                </div>
              </div>
            )}
          </div>

          {/* User Menu — Desktop only */}
          {!isMobile && (
            <div style={{ position: 'relative' }} ref={userRef}>
              <button className="icon-btn"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: 'none', borderRadius: 10, cursor: 'pointer', background: showUserMenu ? 'rgba(124,111,205,0.15)' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.text }}
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6fcd, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: '500', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showUserMenu && (
                <div className="scale-in" style={{ position: 'absolute', right: 0, top: 48, width: 200, background: theme.isDark ? 'rgba(26,26,46,0.97)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.2)', border: `1px solid ${theme.isDark ? 'rgba(124,111,205,0.2)' : 'rgba(124,111,205,0.15)'}`, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <p style={{ color: theme.text, margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{user?.name}</p>
                    <p style={{ color: theme.subtext, margin: 0, fontSize: '0.78rem' }}>Member</p>
                  </div>
                  <div style={{ padding: 6 }}>
                    <button className="user-menu-item"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent', color: theme.text, fontSize: '0.88rem' }}
                      onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                      {Icons.user} Profile Settings
                    </button>
                    <button className="logout-item"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent', color: theme.subtext, fontSize: '0.88rem' }}
                      onClick={() => { logoutUser(); navigate('/login'); }}>
                      {Icons.logout} Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hamburger — Mobile only */}
          {isMobile && (
            <button className="icon-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: 'none', borderRadius: 10, cursor: 'pointer', background: mobileOpen ? 'rgba(124,111,205,0.15)' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.text }}
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? Icons.close : Icons.menu}
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {isMobile && mobileOpen && (
        <div className="mobile-menu" style={{ position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, zIndex: 99, background: glassBg, backdropFilter: 'blur(12px)', borderTop: `1px solid ${theme.border}`, overflowY: 'auto' }}>

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px', borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6fcd, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ color: theme.text, margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>{user?.name}</p>
              <p style={{ color: theme.subtext, margin: 0, fontSize: '0.78rem' }}>{user?.email}</p>
            </div>
          </div>

          {/* Nav Links */}
          <div style={{ padding: '12px 12px' }}>
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <button key={link.path} className="mobile-link"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', border: 'none', borderRadius: 12, cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s',
                    background: isActive ? 'rgba(124,111,205,0.15)' : 'transparent',
                    color: isActive ? '#7c6fcd' : theme.text, fontWeight: isActive ? '700' : '500', fontSize: '1rem' }}
                  onClick={() => navigate(link.path)}>
                  <span style={{ color: isActive ? '#7c6fcd' : theme.subtext }}>{link.icon}</span>
                  {link.label}
                  {isActive && <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#7c6fcd' }} />}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: theme.border, margin: '4px 20px' }} />

          {/* Settings */}
          <div style={{ padding: '12px 12px' }}>
            <button className="mobile-link"
              style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', border: 'none', borderRadius: 12, cursor: 'pointer', marginBottom: 4, background: 'transparent', color: theme.text, fontWeight: '500', fontSize: '1rem', transition: 'all 0.2s' }}
              onClick={() => { navigate('/profile'); }}>
              {Icons.user} Profile Settings
            </button>
            <button className="mobile-link"
              style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', border: 'none', borderRadius: 12, cursor: 'pointer', marginBottom: 4, background: 'transparent', color: theme.text, fontWeight: '500', fontSize: '1rem', transition: 'all 0.2s' }}
              onClick={toggleTheme}>
              {theme.isDark ? Icons.sun : Icons.moon}
              {theme.isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button className="mobile-link"
              style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', border: 'none', borderRadius: 12, cursor: 'pointer', background: 'transparent', color: '#ff6b6b', fontWeight: '500', fontSize: '1rem', transition: 'all 0.2s' }}
              onClick={() => { logoutUser(); navigate('/login'); }}>
              {Icons.logout} Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}