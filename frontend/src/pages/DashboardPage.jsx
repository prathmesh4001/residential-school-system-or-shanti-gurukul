/* ============================================================
   DashboardPage.jsx — Shanti Gurukul Executive Overview
   ============================================================ */
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(err => {
        console.error('Failed to load dashboard data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Standard defaults matching the exact target UI (120 students, 60 residential boys, 4 residential mentors)
  const stats = data?.students || {
    total: 120,
    boys: 60,
    girls: 60,
    residential: 60,
    day: 60,
    growth: '+6 this term',
  };

  const staff = data?.staff || {
    teachers: 11,
    teachersGrowth: '11 Working Faculty',
    mentors: 4,
    mentorsSub: '4 Boys Wings (15 Rooms)',
    peons: 2,
    peonsSub: '2 Campus Support Staff',
    hostelRooms: 15,
    roomsSub: 'Rooms 201–215 (Boys)',
  };

  const classData = data?.classWiseStrength || [
    { standard: 'Std 5', boys: 10, girls: 10 },
    { standard: 'Std 6', boys: 10, girls: 10 },
    { standard: 'Std 7', boys: 10, girls: 10 },
    { standard: 'Std 8', boys: 10, girls: 10 },
    { standard: 'Std 9', boys: 10, girls: 10 },
    { standard: 'Std 10', boys: 10, girls: 10 },
  ];

  const noticesList = data?.notices || [
    { id: 'N-01', title: 'Unit Test Schedule (Std 5 – 10)', date: '24 Sep 2026', icon: '📝', color: '#3b82f6' },
    { id: 'N-02', title: 'Gandhi Jayanti Holiday',         date: '22 Sep 2026', icon: '🏛️', color: '#10b981' },
    { id: 'N-03', title: 'Hostel Parent Meeting',          date: '20 Sep 2026', icon: '👥', color: '#8b5cf6' },
    { id: 'N-04', title: 'Sports Day Selection',           date: '18 Sep 2026', icon: '🏆', color: '#ec4899' },
    { id: 'N-05', title: 'Mess Menu Update',               date: '17 Sep 2026', icon: '🍱', color: '#f59e0b' },
  ];

  const defaultQuickActions = [
    { label: 'Add Student',        icon: '➕',  to: '/students' },
    { label: 'Add Teacher',        icon: '👤+', to: '/staff' },
    { label: 'Mark Attendance',    icon: '📅',  to: '/attendance' },
    { label: 'Manage Timetable',   icon: '🕒',  to: '/timetable' },
    { label: 'Mentor Roll-Call',   icon: '👥',  to: '/mentor' },
    { label: 'Pocket Money',       icon: '💳',  to: '/expenses' },
  ];

  const mentorQuickActions = [
    { label: 'Hostel Roll-Call',       icon: '🌙',  to: '/mentor' },
    { label: 'Pocket Money Custody',   icon: '💳',  to: '/expenses' },
    { label: 'Medical & Clinic Logs',  icon: '🩺',  to: '/medical' },
    { label: 'Period Attendance',      icon: '📅',  to: '/attendance' },
    { label: 'Hostel Rooms (201-215)', icon: '🏨',  to: '/hostel' },
    { label: 'Mess & Food Menu',       icon: '🍱',  to: '/mess' },
  ];

  const quickActions = user?.role === 'mentor' ? mentorQuickActions : defaultQuickActions;

  return (
    <Layout currentModule="dashboard">
      <div className="sg-dashboard-wrap">
        {/* ── Top Hero / Greeting Row ── */}
        <section className="sg-hero-row">
          <div className="sg-hero-greeting">
            <h1 className="sg-hero-title">
              {t('welcomeBackUser')}, {user?.username === 'admin' ? 'Admin' : (user?.name || 'Mentor')}! 👋
            </h1>
            <p className="sg-hero-subtitle">
              {user?.role === 'mentor'
                ? 'Residential Student Care & Hostel Mentor Command Dashboard'
                : t('systemOverview')}
            </p>
          </div>

          <div className="sg-hero-banner-card">
            <div className="sg-hero-datetime-pill">
              <span>📅 Tue, 24 Sep 2026</span>
              <span className="sg-pill-divider">|</span>
              <span>🕒 10:45 AM</span>
            </div>
            <img
              src="/assets/campus-banner.jpg"
              alt="Shanti Gurukul Campus"
              className="sg-hero-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/logo.jpg';
              }}
            />
          </div>
        </section>

        {/* ── Residential Mentor Command Center (when logged in as mentor) ── */}
        {user?.role === 'mentor' && (
          <section style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.45) 50%, rgba(245, 158, 11, 0.12) 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '16px',
            padding: '22px 24px',
            marginBottom: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🛡️</span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
                      Residential Mentor Command Center
                    </h2>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      Active Duty: <strong style={{ color: '#F59E0B' }}>{user.name || 'Residential Mentor'}</strong> &nbsp;•&nbsp; Supervised: <strong style={{ color: '#38bdf8' }}>{user.wing || 'Junior & Senior Boys Wings (Rooms 201–215)'}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => navigate('/mentor')}
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #d97706 100%)',
                    border: 'none',
                    color: '#050c1e',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🌙</span> Conduct Night Roll-Call (60 Boys)
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/expenses')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>💳</span> Pocket Money Ledger
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/medical')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🩺</span> Clinic Escorts
                </button>
              </div>
            </div>

            {/* 4 Supervised Wings Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wing A (Std 5–6)</div>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>Mr. Sanjay Bhosale</div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Rooms 201–204 • 16 Boys</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wing B (Std 6–7)</div>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>Mr. Ramesh Shinde</div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Rooms 205–208 • 16 Boys</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wing C (Std 8–9)</div>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>Mr. Suresh Jadhav</div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Rooms 209–212 • 16 Boys</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wing D (Std 9–10)</div>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>Mr. Deepak Kadam</div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Rooms 213–215 • 12 Boys</div>
              </div>
            </div>
          </section>
        )}

        {/* ── KPI Row 1: Student Demographics (5 cards) ── */}
        <section className="sg-kpi-grid-5">
          {/* Total Students */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box orange">
              <span className="sg-kpi-icon">👥</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">{t('statTotalStudents')}</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{stats.total || 450}</span>
              </div>
              <span className="sg-stat-badge-positive">↑ +12 this month</span>
            </div>
          </div>

          {/* Boys */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box blue">
              <span className="sg-kpi-icon">🚹</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">{t('boys')}</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{stats.boys || 260}</span>
              </div>
              <span className="sg-stat-subtext">58% of total</span>
            </div>
          </div>

          {/* Girls */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box pink">
              <span className="sg-kpi-icon">🚺</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">{t('girls')}</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{stats.girls || 190}</span>
              </div>
              <span className="sg-stat-subtext">42% of total</span>
            </div>
          </div>

          {/* Residential */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box green">
              <span className="sg-kpi-icon">🏠</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">{t('residential')}</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{stats.residential || 60}</span>
              </div>
              <span className="sg-stat-subtext">50% of total</span>
            </div>
          </div>

          {/* Day Scholars */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box purple">
              <span className="sg-kpi-icon">👥</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">{t('dayScholar')}</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{stats.day || 60}</span>
              </div>
              <span className="sg-stat-subtext">50% of total</span>
            </div>
          </div>
        </section>

        {/* ── KPI Row 2: Staff & Infrastructure (5 cards) ── */}
        <section className="sg-kpi-grid-5">
          {/* Total Teachers */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box dark-navy">
              <span className="sg-kpi-icon">👤</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">Total Teachers</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{staff.teachers || 11}</span>
              </div>
              <span className="sg-stat-badge-positive">11 Working Faculty</span>
            </div>
          </div>

          {/* Residential Mentors */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box purple">
              <span className="sg-kpi-icon">👥</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">Residential Mentors</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{staff.mentors || 4}</span>
              </div>
              <span className="sg-stat-subtext">4 Boys Wings (A, B, C, D)</span>
            </div>
          </div>

          {/* Peons / Support Staff */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box orange">
              <span className="sg-kpi-icon">🧹</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">Peons / Support</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{staff.peons || 2}</span>
              </div>
              <span className="sg-stat-subtext">2 Campus Support Staff</span>
            </div>
          </div>

          {/* Residential Boarders */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box green">
              <span className="sg-kpi-icon">🏠</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">Residential Students</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{stats.residential || 60}</span>
              </div>
              <span className="sg-stat-subtext">All 60 Boys Under Care</span>
            </div>
          </div>

          {/* Hostel Rooms */}
          <div className="sg-stat-card">
            <div className="sg-stat-icon-box slate-navy">
              <span className="sg-kpi-icon">🛏️</span>
            </div>
            <div className="sg-stat-meta">
              <span className="sg-stat-label">Hostel Rooms</span>
              <div className="sg-stat-val-row">
                <span className="sg-stat-number">{staff.hostelRooms || 15}</span>
              </div>
              <span className="sg-stat-subtext">{staff.roomsSub || 'Rooms 201–215 (Boys)'}</span>
            </div>
          </div>
        </section>

        {/* ── Middle Row: Strength Chart, Distribution, Quick Actions ── */}
        <section className="sg-middle-grid">
          {/* Card 1: Class-wise Student Strength Bar Chart */}
          <div className="sg-panel sg-chart-panel">
            <div className="sg-panel-header">
              <div className="sg-panel-title">
                <span className="sg-panel-title-icon orange-txt">👥</span>
                {t('classWiseStrength')}
              </div>
              <div className="sg-chart-legend">
                <span className="sg-legend-item">
                  <span className="sg-dot blue" /> {t('boys')}
                </span>
                <span className="sg-legend-item">
                  <span className="sg-dot pink" /> {t('girls')}
                </span>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="sg-bar-chart-container">
              <svg viewBox="0 0 520 220" className="sg-bar-svg" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                {[0, 20, 40, 60, 80, 100].map(val => {
                  const y = 180 - (val / 100) * 150;
                  return (
                    <g key={val}>
                      <line x1="30" y1={y} x2="510" y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
                      <text x="24" y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Bars for Std 5 to Std 10 */}
                {classData.map((item, idx) => {
                  const groupX = 55 + idx * 75;
                  const boysHeight = (item.boys / 100) * 150;
                  const girlsHeight = (item.girls / 100) * 150;
                  const boysY = 180 - boysHeight;
                  const girlsY = 180 - girlsHeight;

                  return (
                    <g key={item.standard} className="sg-bar-group">
                      {/* Boys bar */}
                      <rect
                        x={groupX}
                        y={boysY}
                        width="20"
                        height={boysHeight}
                        rx="4"
                        fill="#3b82f6"
                        className="sg-bar-rect"
                      />
                      <text
                        x={groupX + 10}
                        y={boysY - 4}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="700"
                        fill="#93c5fd"
                      >
                        {item.boys}
                      </text>

                      {/* Girls bar */}
                      <rect
                        x={groupX + 24}
                        y={girlsY}
                        width="20"
                        height={girlsHeight}
                        rx="4"
                        fill="#ec4899"
                        className="sg-bar-rect"
                      />
                      <text
                        x={groupX + 34}
                        y={girlsY - 4}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="700"
                        fill="#f472b6"
                      >
                        {item.girls}
                      </text>

                      {/* Class Label */}
                      <text
                        x={groupX + 22}
                        y="198"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#cbd5e1"
                      >
                        {item.standard}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Card 2: Student Type Distribution Donut Chart */}
          <div className="sg-panel sg-donut-panel">
            <div className="sg-panel-header">
              <div className="sg-panel-title">
                <span className="sg-panel-title-icon orange-txt">☀️</span>
                {t('studentDistribution')}
              </div>
            </div>

            <div className="sg-donut-body">
              {/* Donut SVG: 50% Residential (60 Boys), 50% Day Scholars (60 Girls) */}
              <div className="sg-donut-chart-wrap">
                <svg viewBox="0 0 160 160" className="sg-donut-svg">
                  {/* Subtle dark track */}
                  <circle cx="80" cy="80" r="52" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="22" />

                  {/* Day Scholars Arc (50% = 163.35 of 326.7) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="52"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="22"
                    strokeDasharray="163.35 326.7"
                    strokeDashoffset="0"
                    transform="rotate(-90 80 80)"
                    strokeLinecap="butt"
                  />

                  {/* Residential Arc (50% = 163.35 of 326.7) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="52"
                    fill="none"
                    stroke="#ff7700"
                    strokeWidth="22"
                    strokeDasharray="163.35 326.7"
                    strokeDashoffset="-163.35"
                    transform="rotate(-90 80 80)"
                    strokeLinecap="butt"
                  />

                  {/* Percent badges on arcs */}
                  <text x="125" y="90" fontSize="10.5" fontWeight="800" fill="#ffffff" textAnchor="middle">
                    50%
                  </text>
                  <text x="35" y="90" fontSize="10.5" fontWeight="800" fill="#ffffff" textAnchor="middle">
                    50%
                  </text>

                  {/* Center Text */}
                  <text x="80" y="76" textAnchor="middle" fontSize="20" fontWeight="800" fill="#ffffff">
                    {stats.total || 120}
                  </text>
                  <text x="80" y="93" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#94a3b8">
                    {t('nav_students', 'Students')}
                  </text>
                </svg>
              </div>

              {/* Legend List */}
              <div className="sg-donut-legend">
                <div className="sg-donut-legend-item">
                  <span className="sg-dot orange" />
                  <div>
                    <span className="sg-d-label">Residential (50%)</span>
                    <strong className="sg-d-val">{stats.residential || 60}</strong>
                  </div>
                </div>
                <div className="sg-donut-legend-item">
                  <span className="sg-dot blue" />
                  <div>
                    <span className="sg-d-label">Day Scholars (50%)</span>
                    <strong className="sg-d-val">{stats.day || 60}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Actions (Dark Navy Theme) */}
          <div className="sg-panel sg-quick-actions-panel">
            <div className="sg-quick-header">
              <span className="sg-bolt-icon">⚡</span>
              <span className="sg-quick-title">{t('quickActions')}</span>
            </div>

            <div className="sg-quick-btn-grid">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  type="button"
                  className="sg-quick-tile-btn"
                  onClick={() => navigate(action.to)}
                >
                  <span className="sg-tile-icon">{action.icon}</span>
                  <span className="sg-tile-text">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom Row: Today's Attendance, Hostel Occupancy, Recent Notices ── */}
        <section className="sg-bottom-grid">
          {/* Card 1: Today's Attendance */}
          <div className="sg-panel">
            <div className="sg-panel-header">
              <div className="sg-panel-title">
                <span className="sg-panel-title-icon orange-txt">📅</span>
                {t('todayAttendance')}
              </div>
              <button
                type="button"
                className="sg-link-btn"
                onClick={() => navigate('/attendance')}
              >
                {t('viewAll')}
              </button>
            </div>

            <div className="sg-attendance-body">
              {/* Radial Donut Gauge */}
              <div className="sg-gauge-wrap">
                <svg viewBox="0 0 120 120" className="sg-gauge-svg">
                  <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="11" />
                  {/* 95% of 289 circumference = 274.55 */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="11"
                    strokeDasharray="274.55 289"
                    strokeDashoffset="0"
                    transform="rotate(-90 60 60)"
                    strokeLinecap="round"
                  />
                  <text x="60" y="52" textAnchor="middle" fontSize="20" fontWeight="800" fill="#ffffff">
                    95%
                  </text>
                  <text x="60" y="69" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#34d399">
                    Present
                  </text>
                  <text x="60" y="84" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#94a3b8">
                    114 / 120
                  </text>
                </svg>
              </div>

              {/* Status Breakdowns */}
              <div className="sg-attendance-stat-list">
                <div className="sg-att-status-row">
                  <span className="sg-status-badge green-badge">✔ Present</span>
                  <strong className="sg-att-num">114</strong>
                </div>
                <div className="sg-att-status-row">
                  <span className="sg-status-badge red-badge">✖ Absent</span>
                  <strong className="sg-att-num">5</strong>
                </div>
                <div className="sg-att-status-row">
                  <span className="sg-status-badge orange-badge">🕒 On Leave</span>
                  <strong className="sg-att-num">1</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Hostel Occupancy (Only Boys Hostel) */}
          <div className="sg-panel">
            <div className="sg-panel-header">
              <div className="sg-panel-title">
                <span className="sg-panel-title-icon orange-txt">🏠</span>
                {t('hostelOccupancy')}
              </div>
              <button
                type="button"
                className="sg-link-btn"
                onClick={() => navigate('/hostel')}
              >
                {t('viewAll')}
              </button>
            </div>

            <div className="sg-hostel-body">
              {/* Boys Hostel Rooms */}
              <div className="sg-hostel-item">
                <div className="sg-hostel-info-row">
                  <div className="sg-hostel-title-group">
                    <span className="sg-bed-icon blue-bg">🛏️</span>
                    <span className="sg-hostel-name">Boys Hostel Rooms (201–215)</span>
                    <span className="sg-hostel-count">15 / 15 Rooms</span>
                  </div>
                  <span className="sg-hostel-pct">100%</span>
                </div>
                <div className="sg-progress-bar-bg">
                  <div className="sg-progress-bar-fill" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Residential Boys Headcount */}
              <div className="sg-hostel-item">
                <div className="sg-hostel-info-row">
                  <div className="sg-hostel-title-group">
                    <span className="sg-bed-icon orange-bg" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>👥</span>
                    <span className="sg-hostel-name">Residential Boys (4 per Room)</span>
                    <span className="sg-hostel-count">60 / 60 Boys</span>
                  </div>
                  <span className="sg-hostel-pct">100%</span>
                </div>
                <div className="sg-progress-bar-bg">
                  <div className="sg-progress-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg, #F59E0B, #ea580c)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Recent Notices */}
          <div className="sg-panel">
            <div className="sg-panel-header">
              <div className="sg-panel-title">
                <span className="sg-panel-title-icon orange-txt">📢</span>
                Recent Notices
              </div>
              <button
                type="button"
                className="sg-link-btn"
                onClick={() => navigate('/notices')}
              >
                View All
              </button>
            </div>

            <div className="sg-notices-list">
              {noticesList.map(item => (
                <div key={item.id} className="sg-notice-item">
                  <div className="sg-notice-left">
                    <span className="sg-notice-icon-box" style={{ background: `${item.color || '#3b82f6'}15`, color: item.color || '#3b82f6' }}>
                      {item.icon}
                    </span>
                    <span className="sg-notice-title">{item.title}</span>
                  </div>
                  <span className="sg-notice-date">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
