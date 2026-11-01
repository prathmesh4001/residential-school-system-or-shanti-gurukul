/* ============================================================
   LoginPage.jsx — Shanti Gurukul, Bachani
   High-Fidelity Modern Glassmorphism Login UI matching Design
   ============================================================ */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  {
    key: 'admin',
    label: 'Admin',
    authRole: 'admin',
    defaultUser: 'admin',
    defaultPass: 'admin123',
    icon: (isActive) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          fill="url(#shield-grad)"
        />
        <path
          d="M12 4.18l7 3.89v4.93c0 4.63-3.21 8.95-7 10-3.79-1.05-7-5.37-7-10V8.07l7-3.89z"
          fill="none"
          stroke={isActive ? '#F59E0B' : '#60a5fa'}
          strokeWidth="1.2"
        />
        <defs>
          <linearGradient id="shield-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor={isActive ? '#60a5fa' : '#38bdf8'} />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    key: 'principal',
    label: 'Principal',
    authRole: 'principal',
    defaultUser: 'principal',
    defaultPass: 'admin123',
    icon: (isActive) => (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isActive ? '#F59E0B' : '#bfdbfe'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z" />
      </svg>
    ),
  },
  {
    key: 'teacher',
    label: 'Teacher',
    authRole: 'teacher',
    defaultUser: 'teacher1',
    defaultPass: 'teacher123',
    icon: (isActive) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill={isActive ? '#F59E0B' : '#fbbf24'} />
        <path
          d="M5 13.18v4c0 2.5 3.13 4.5 7 4.5s7-2 7-4.5v-4L12 17l-7-3.82z"
          fill={isActive ? '#d97706' : '#f59e0b'}
          opacity="0.85"
        />
      </svg>
    ),
  },
  {
    key: 'mentor',
    label: 'Mentor',
    authRole: 'mentor',
    defaultUser: 'mentor@gmail.com',
    defaultPass: 'mentor@123',
    icon: (isActive) => (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isActive ? '#F59E0B' : '#38bdf8'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'parent',
    label: 'Parent / Guardian',
    authRole: 'parent',
    defaultUser: 'parent1',
    defaultPass: 'parent123',
    icon: (isActive) => (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isActive ? '#F59E0B' : '#c084fc'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M23 21v-1.5a2.5 2.5 0 0 0-2-2.45" />
        <circle cx="19" cy="8" r="2.5" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleRoleSelect(role) {
    setSelectedRole(role.key);
    setUsername(role.defaultUser);
    setPassword(role.defaultPass);
    setError('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate(result.role === 'parent' ? '/parent' : '/dashboard');
    } else {
      setError(result.error || 'Invalid username or password.');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #040915 0%, #071329 45%, #050d1e 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .login-container-card {
            flex-direction: column !important;
            max-width: 520px !important;
          }
          .login-left-hero {
            padding: 32px 20px 20px 20px !important;
            min-height: 420px !important;
          }
          .login-right-panel {
            width: 100% !important;
            border-left: none !important;
            border-top: 1px solid rgba(59, 130, 246, 0.22) !important;
            padding: 32px 24px !important;
          }
        }
      `}</style>
      {/* ── Ambient Glowing Light Effects in Background ── */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.04) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -150,
          right: -120,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0.03) 55%, transparent 75%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -80,
          left: -60,
          width: 440,
          height: 440,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, transparent 65%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative Golden Light Waves / Swooshes */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.45,
        }}
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M-100 200 C 300 150, 400 450, 750 350 C 1100 250, 1300 500, 1600 420"
          stroke="url(#ambient-gold-line-1)"
          strokeWidth="2.5"
          filter="blur(1px)"
        />
        <path
          d="M-50 850 C 250 820, 350 650, 650 720 C 950 790, 1200 600, 1500 700"
          stroke="url(#ambient-gold-line-2)"
          strokeWidth="3.5"
          filter="blur(2px)"
        />
        <defs>
          <linearGradient id="ambient-gold-line-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="20%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ambient-gold-line-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Decorative Dot Matrix on Left and Right Edges */}
      <div
        style={{
          position: 'absolute',
          left: '28px',
          top: '36%',
          transform: 'translateY(-50%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: '#f59e0b',
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          right: '28px',
          top: '36%',
          transform: 'translateY(-50%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: '#f59e0b',
            }}
          />
        ))}
      </div>

      {/* ── Main High-Fidelity Floating Card ── */}
      <div
        className="login-container-card"
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1040px',
          minHeight: '580px',
          borderRadius: '26px',
          overflow: 'hidden',
          background: 'rgba(9, 19, 39, 0.85)',
          border: '1.2px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.85), 0 0 50px rgba(14, 165, 233, 0.12)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ── Left Hero / Branding Panel ── */}
        <div
          className="login-left-hero"
          style={{
            flex: 1.15,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '38px 30px 24px 30px',
          }}
        >
          {/* Background Image with Twilight Gradient Blend */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "linear-gradient(180deg, rgba(7, 18, 38, 0.94) 0%, rgba(9, 23, 49, 0.72) 42%, rgba(6, 14, 30, 0.3) 64%, rgba(6, 14, 30, 0.88) 100%), url('/assets/campus-banner.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              backgroundRepeat: 'no-repeat',
              zIndex: 1,
            }}
          />

          {/* Radial Ambient Sunburst behind Logo */}
          <div
            style={{
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.42) 0%, rgba(245, 158, 11, 0.12) 45%, transparent 72%)',
              filter: 'blur(16px)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />

          {/* Top Branding Section */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              paddingTop: '6px',
            }}
          >
            {/* Circular Medallion with Thick Glowing Golden Ring */}
            <div
              style={{
                width: 126,
                height: 126,
                borderRadius: '50%',
                background: '#000000',
                border: '3.5px solid #F59E0B',
                boxShadow:
                  '0 0 35px rgba(245, 158, 11, 0.85), 0 0 70px rgba(245, 158, 11, 0.4), inset 0 0 8px rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                overflow: 'hidden',
              }}
            >
              <img
                src="/assets/shanti-logo.jpg"
                alt="Shanti Gurukul Emblem"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  transform: 'scale(1.05)',
                }}
                onError={(e) => {
                  e.target.src = '/assets/logo.jpg';
                }}
              />
            </div>

            {/* School Title */}
            <h1
              style={{
                margin: 0,
                fontSize: '2.05rem',
                fontWeight: 800,
                color: '#F59E0B',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                textShadow: '0 2px 14px rgba(245, 158, 11, 0.45)',
              }}
            >
              SHANTI GURUKUL
            </h1>

            {/* Subtitle Location */}
            <div
              style={{
                fontSize: '1.02rem',
                fontWeight: 500,
                color: '#e2e8f0',
                marginTop: '4px',
                letterSpacing: '0.4px',
              }}
            >
              Bachani, Kagal, Kolhapur
            </div>

            {/* Sanskrit Motto */}
            <div
              style={{
                fontSize: '0.94rem',
                fontWeight: 500,
                fontStyle: 'italic',
                color: '#cbd5e1',
                marginTop: '8px',
                opacity: 0.9,
                fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif",
                letterSpacing: '0.5px',
              }}
            >
              ज्ञानं परमं बलम्
            </div>
          </div>

          {/* Bottom Floating Stats Cards */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              gap: '12px',
              marginTop: '40px',
            }}
          >
            {/* Stat 1: Total Students */}
            <div
              style={{
                flex: 1,
                background: 'rgba(9, 20, 40, 0.68)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '14px',
                padding: '14px 8px',
                textAlign: 'center',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '6px',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#F59E0B',
                  lineHeight: 1.15,
                }}
              >
                120
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  marginTop: '3px',
                }}
              >
                Total Students
              </div>
            </div>

            {/* Stat 2: Residential */}
            <div
              style={{
                flex: 1,
                background: 'rgba(9, 20, 40, 0.68)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '14px',
                padding: '14px 8px',
                textAlign: 'center',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '6px',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#F59E0B',
                  lineHeight: 1.15,
                }}
              >
                60
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  marginTop: '3px',
                }}
              >
                Residential
              </div>
            </div>

            {/* Stat 3: Classes 5 - 10 */}
            <div
              style={{
                flex: 1,
                background: 'rgba(9, 20, 40, 0.68)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '14px',
                padding: '14px 8px',
                textAlign: 'center',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '6px',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#F59E0B',
                  lineHeight: 1.15,
                }}
              >
                6
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  marginTop: '3px',
                }}
              >
                Classes 5 - 10
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Login Card / Form Panel ── */}
        <div
          className="login-right-panel"
          style={{
            flex: 0.95,
            width: '440px',
            background: 'rgba(11, 22, 44, 0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(59, 130, 246, 0.22)',
            padding: '40px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Welcome Header */}
          <div style={{ marginBottom: '22px' }}>
            <h2
              style={{
                margin: '0 0 6px 0',
                fontSize: '1.8rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Welcome Back <span>👋</span>
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.88rem',
                color: '#94a3b8',
                fontWeight: 400,
              }}
            >
              Sign in to your account to continue
            </p>
          </div>

          {/* Role Selector Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '22px',
            }}
          >
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.key;
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 6px',
                    borderRadius: '12px',
                    gridColumn: role.key === 'parent' ? 'span 2' : 'span 1',
                    border: isSelected
                      ? '1.5px solid #F59E0B'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isSelected
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'rgba(15, 26, 48, 0.65)',
                    boxShadow: isSelected
                      ? '0 0 16px rgba(245, 158, 11, 0.28)'
                      : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(22, 38, 70, 0.8)';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(15, 26, 48, 0.65)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  <div
                    style={{
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    {role.icon(isSelected)}
                  </div>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#F59E0B' : '#94a3b8',
                      letterSpacing: '0.2px',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {role.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  marginBottom: '6px',
                }}
              >
                Username
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  style={{
                    width: '100%',
                    height: '46px',
                    background: 'rgba(13, 23, 42, 0.85)',
                    border: '1px solid rgba(59, 130, 246, 0.28)',
                    borderRadius: '10px',
                    padding: '0 14px 0 42px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.18)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.28)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: '46px',
                    background: 'rgba(13, 23, 42, 0.85)',
                    border: '1px solid rgba(59, 130, 246, 0.28)',
                    borderRadius: '10px',
                    padding: '0 42px 0 42px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.18)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.28)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    padding: 0,
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Vibrant Amber/Orange Gradient Sign In Button */}
            <button
              id="loginBtn"
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(90deg, #F97316 0%, #F59E0B 100%)',
                boxShadow: '0 5px 22px rgba(245, 158, 11, 0.42)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1.5px)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(245, 158, 11, 0.55)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 5px 22px rgba(245, 158, 11, 0.42)';
                }
              }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner"
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* NOTE: Secure School Management System footer below sign in was intentionally REMOVED per user instructions */}
        </div>
      </div>
    </div>
  );
}
