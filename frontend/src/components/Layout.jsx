/* ============================================================
   Layout.jsx — Sidebar + Topbar wrapper matching Shanti Gurukul UI
   ============================================================ */
import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const NAV_ITEMS = [
  { key: 'dashboard',    transKey: 'nav_dashboard',     icon: '🏠', label: 'Dashboard',                to: '/dashboard',     module: 'dashboard' },
  { key: 'students',     transKey: 'nav_students',      icon: '👥', label: 'Students',                 to: '/students',      module: 'students',      hasChevron: true },
  { key: 'teachers',     transKey: 'nav_staff',         icon: '🎓', label: 'Teachers & Staff',         to: '/staff',         module: 'staff',         hasChevron: true },
  { key: 'attendance',   transKey: 'nav_attendance',    icon: '📅', label: 'Attendance',               to: '/attendance',    module: 'attendance',    hasChevron: true },
  { key: 'timetable',    transKey: 'nav_timetable',     icon: '🕒', label: 'Timetable',                to: '/timetable',     module: 'timetable',     hasChevron: true },
  { key: 'exams',        transKey: 'nav_results',       icon: '📝', label: 'Exams & Marks',            to: '/results',       module: 'results',       hasChevron: true },
  { key: 'hostel',       transKey: 'nav_hostel',        icon: '🏨', label: 'Hostel Management',        to: '/hostel',        module: 'hostel',        hasChevron: true },
  { key: 'mess',         transKey: 'nav_mess',          icon: '🍱', label: 'Mess & Food Menu',         to: '/mess',          module: 'mess',          hasChevron: true },
  { key: 'mentor',       transKey: 'nav_mentor',        icon: '👥', label: 'Mentor Management',        to: '/mentor',        module: 'mentor',        hasChevron: true },
  { key: 'leave',        transKey: 'nav_teacher_leave', icon: '📋', label: 'Leave & Substitution',     to: '/teacher-leave', module: 'teacher-leave', hasChevron: true },
  { key: 'money',        transKey: 'nav_fees',          icon: '💰', label: 'Fee Management',           to: '/fees',          module: 'fees',          hasChevron: true },
  { key: 'medical',      transKey: 'nav_medical',       icon: '🩺', label: 'Medical & Sickbay',        to: '/medical',       module: 'medical',       hasChevron: true },
  { key: 'achievements', transKey: 'nav_achievements',  icon: '🏆', label: 'Achievements & Honors',    to: '/achievements',  module: 'achievements',  hasChevron: true },
  { key: 'expenses',     transKey: 'nav_expenses',      icon: '💳', label: 'Student Pocket Money',     to: '/expenses',      module: 'expenses',      hasChevron: true },
  { key: 'notices',      transKey: 'nav_notices',       icon: '📢', label: 'Notices & Circulars',      to: '/notices',       module: 'notices',       hasChevron: true },
  { key: 'parent',       transKey: 'nav_parent',        icon: '👨‍👩‍👧', label: 'Parent Portal',           to: '/parent',        module: 'parent',        hasChevron: true },
];

export default function Layout({ children, pageTitle, title, currentModule }) {
  const { user, logout, canAccess } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleSearch(e) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/students?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  // Close sidebar on route change (mobile)
  useEffect(() => { 
    setSidebarOpen(false); 
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="sg-layout-container">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sg-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sg-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Top RangBharti Badge Logo */}
        <div className="sg-sidebar-badge-wrap">
          <NavLink to="/dashboard" className="sg-sidebar-badge-link">
            <img
              src="/assets/rangbharti-logo.svg"
              alt="RangBharti's Shanti Gurukul Bachani"
              className="sg-sidebar-badge-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/logo.jpg';
              }}
            />
          </NavLink>
        </div>

        {/* Navigation list */}
        <nav className="sg-sidebar-nav">
          {NAV_ITEMS.filter(item => canAccess(item.module)).map(item => {
            const isActive = location.pathname === item.to && (item.key !== 'classes' || location.search.includes('class'));
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive: exactActive }) =>
                  `sg-nav-link ${exactActive || (item.key === 'dashboard' && location.pathname === '/dashboard') ? 'active' : ''}`
                }
              >
                <span className="sg-nav-icon">{item.icon}</span>
                <span className="sg-nav-text">{t(item.transKey, item.label)}</span>
                {item.hasChevron && <span className="sg-nav-chevron">›</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Bottom / Account actions */}
        <div className="sg-sidebar-bottom">
          <button 
            type="button" 
            className="sg-nav-link" 
            onClick={() => navigate('/settings')}
          >
            <span className="sg-nav-icon">⚙️</span>
            <span className="sg-nav-text">{t('settings') || 'Settings'}</span>
          </button>
          <button 
            type="button" 
            className="sg-nav-link sg-nav-logout" 
            onClick={handleLogout}
          >
            <span className="sg-nav-icon">🚪</span>
            <span className="sg-nav-text">{t('logout') || 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Section ── */}
      <div className="sg-main-wrapper">
        {/* Top Navbar */}
        <header className="sg-topbar">
          <div className="sg-topbar-left">
            <button
              type="button"
              className="sg-menu-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>

            {/* School identity */}
            <div className="sg-topbar-brand">
              <img
                src="/assets/logo.jpg"
                alt="Shanti Gurukul"
                className="sg-topbar-logo"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="sg-topbar-info">
                <div className="sg-topbar-school-name">{t('appName')}</div>
                <div className="sg-topbar-sub">{t('appSub')}</div>
                <div className="sg-topbar-slogan">{t('slogan')}</div>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="sg-topbar-center">
            <div className="sg-search-bar">
              <span className="sg-search-icon">🔍</span>
              <input
                type="text"
                placeholder={t('searchGlobalPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          {/* Topbar Right Icons */}
          <div className="sg-topbar-right">
            {/* Language toggle pill */}
            <div className="sg-lang-picker">
              {['en', 'mr', 'hi'].map(l => (
                <button
                  key={l}
                  type="button"
                  className={`sg-lang-pill ${lang === l ? 'active' : ''}`}
                  onClick={() => setLang(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Notification bell with badge 5 */}
            <button 
              type="button" 
              className="sg-notif-button" 
              onClick={() => navigate('/notices')}
              title="5 New Notifications"
            >
              🔔
              <span className="sg-notif-badge">5</span>
            </button>

            {/* User Profile dropdown */}
            <div className="sg-user-profile-menu">
              <button 
                type="button"
                className="sg-user-badge"
                onClick={() => setUserMenuOpen(o => !o)}
              >
                <div className="sg-user-avatar">
                  👤
                </div>
                <div className="sg-user-text">
                  <div className="sg-user-title">{user?.username === 'admin' ? 'Admin' : (user?.name || 'Admin')}</div>
                  <div className="sg-user-sub">
                    {user?.role === 'admin' ? 'System Administrator' : user?.role === 'mentor' ? 'Residential Mentor' : (user?.role || 'Staff')}
                  </div>
                </div>
                <span className="sg-user-caret">⌵</span>
              </button>

              {userMenuOpen && (
                <div className="sg-dropdown-card">
                  <div className="sg-dropdown-header">
                    <strong>{user?.name || 'Administrator'}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.email || 'admin@gurukul.in'}</div>
                  </div>
                  <button type="button" className="sg-dropdown-item" onClick={() => navigate('/dashboard')}>
                    📊 Dashboard
                  </button>
                  <button type="button" className="sg-dropdown-item" onClick={() => navigate('/students')}>
                    👥 Student Directory
                  </button>
                  <button type="button" className="sg-dropdown-item sg-dropdown-danger" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="sg-page-viewport">
          {children}
        </main>
      </div>
    </div>
  );
}
