/* ============================================================
   NoticesPage.jsx — Full React port of notices.html + notices.js
   Features: Cards grid, search/filter, Post modal, View modal,
             Print notice, delete, audience badges, priority color
   ============================================================ */
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

/* ── Constants ── */
const CATEGORIES = ['General','Exam','Fee','Holiday','Hostel','Meeting','Sports'];
const PRIORITIES  = ['normal','important','urgent','high','medium','low'];
const AUDIENCES   = ['All','Students','Teachers','Parents','Hostel Students','Staff'];

const PRIORITY_META = {
  urgent:    { badge:'badge-red',    label:'Urgent'    },
  high:      { badge:'badge-red',    label:'High'      },
  important: { badge:'badge-gold',   label:'Important' },
  medium:    { badge:'badge-gold',   label:'Medium'    },
  normal:    { badge:'badge-green',  label:'Normal'    },
  low:       { badge:'badge-green',  label:'Low'       },
};

const CAT_ICONS = {
  Exam:'📝', Fee:'💰', Holiday:'🌿', General:'📌',
  Hostel:'🏠', Meeting:'🤝', Sports:'🏆',
};

const EMPTY_FORM = {
  title:'', category:'General', priority:'normal',
  date: new Date().toISOString().slice(0,10),
  content:'', targetAudience:['All'],
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type='success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  return { toasts, show };
}

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function NoticesPage() {
  const { user, canWrite } = useAuth();
  const canPost   = canWrite('notices');
  const canDelete = canWrite('notices');

  const { toasts, show: toast } = useToast();

  const [notices,    setNotices]   = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [query,      setQuery]     = useState('');
  const [catFilter,  setCatFilter] = useState('');
  const [prioFilter, setPrioFilter]= useState('');
  const [showForm,   setShowForm]  = useState(false);
  const [showView,   setShowView]  = useState(false);
  const [viewNotice, setViewNotice]= useState(null);
  const [form,       setForm]      = useState(EMPTY_FORM);
  const [saving,     setSaving]    = useState(false);

  /* Fetch */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch { toast('Failed to load notices', 'error'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* Filtered */
  const filtered = notices.filter(n => {
    const q = query.toLowerCase();
    const matchQ = !q || n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    const matchC = !catFilter  || n.category === catFilter;
    const matchP = !prioFilter || n.priority === prioFilter;
    return matchQ && matchC && matchP;
  });

  /* Stats */
  const urgent    = notices.filter(n => ['urgent','high'].includes(n.priority)).length;
  const thisMonth = notices.filter(n => {
    const d = new Date(n.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  /* ── Form ── */
  function openPost() {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0,10) });
    setShowForm(true);
  }

  function toggleAudience(aud) {
    setForm(f => {
      const list = f.targetAudience.includes(aud)
        ? f.targetAudience.filter(a => a !== aud)
        : [...f.targetAudience, aud];
      return { ...f, targetAudience: list.length === 0 ? ['All'] : list };
    });
  }

  async function saveNotice() {
    if (!form.title || !form.content) {
      toast('Please fill in title and content', 'warning'); return;
    }
    setSaving(true);
    try {
      await api.post('/notices', { ...form, postedBy: user?.username || user?.name });
      toast('✅ Notice posted successfully!');
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to post notice', 'error');
    } finally { setSaving(false); }
  }

  async function deleteNotice(id) {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      toast('🗑️ Notice deleted', 'info');
      fetchAll();
    } catch { toast('Delete failed', 'error'); }
  }

  function openView(n) { setViewNotice(n); setShowView(true); }

  /* ── Print ── */
  function printNotice(n) {
    if (!n) return;
    const bodyText = n.content || n.body || '';
    const dateStr = formatDate(n.date);
    const category = n.category || 'General';
    const rawPriority = (n.priority || 'medium').toLowerCase();
    const priority = (n.priority || 'Medium').toUpperCase();
    const noticeNo = n.id ? (n.id.startsWith('N-') || n.id.startsWith('NOT-') ? n.id : `NOT-${n.id}`) : `SG/CIR/${new Date().getFullYear()}/01`;

    // Audience array or string
    let audienceStr = 'All Students, Staff & Parents';
    if (Array.isArray(n.targetAudience) && n.targetAudience.length > 0) {
      audienceStr = n.targetAudience.join(', ');
    } else if (typeof n.targetAudience === 'string' && n.targetAudience.trim()) {
      audienceStr = n.targetAudience;
    }

    const postedBy = n.postedBy || 'Principal';
    const isPrincipal = postedBy.toLowerCase().includes('principal') || postedBy.toLowerCase() === 'admin';
    const issuerRole = isPrincipal ? 'Principal' : 'Authorized Coordinator';

    // Remove any previous print frame if exists
    const existingFrame = document.getElementById('sg-notice-print-frame');
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'sg-notice-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      toast('Print service unavailable', 'error');
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Official Notice — ${n.title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    body {
      padding: 10px;
    }
    .print-sheet {
      position: relative;
      background: #ffffff;
      border: 2px solid #1e3a8a;
      border-radius: 6px;
      padding: 24px 28px 22px 28px;
      min-height: auto;
      overflow: hidden;
    }
    .inner-border {
      position: absolute;
      top: 3px;
      left: 3px;
      right: 3px;
      bottom: 3px;
      border: 1px solid rgba(245, 158, 11, 0.45);
      border-radius: 4px;
      pointer-events: none;
      z-index: 1;
    }

    /* Subtle School Emblem Watermark */
    .watermark-container {
      position: absolute;
      top: 52%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 290px;
      height: 290px;
      opacity: 0.045;
      pointer-events: none;
      z-index: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .watermark-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: grayscale(100%);
    }

    .content-wrapper {
      position: relative;
      z-index: 2;
    }

    /* ── Header ── */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: avoid;
    }
    .logo-td {
      width: 76px;
      vertical-align: middle;
      text-align: left;
    }
    .logo-img-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 2.5px solid #f59e0b;
      box-shadow: 0 0 0 1px #1e3a8a;
      overflow: hidden;
      background: #000;
      display: inline-block;
    }
    .logo-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .title-td {
      vertical-align: middle;
      text-align: center;
      padding: 0 8px;
    }
    .org-banner {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #ea580c;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .school-title {
      font-size: 24px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      line-height: 1.15;
      margin: 0;
    }
    .school-sub {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-top: 3px;
    }
    .school-motto {
      font-size: 12px;
      font-weight: 700;
      font-style: italic;
      color: #b45309;
      margin-top: 3px;
      letter-spacing: 0.5px;
    }
    .right-balance-td {
      width: 76px;
    }

    /* Decorative Divider Ribbon */
    .header-divider {
      height: 3px;
      background: linear-gradient(90deg, #1e3a8a 0%, #f59e0b 50%, #1e3a8a 100%);
      margin: 14px 0 16px 0;
      border-radius: 2px;
      page-break-inside: avoid;
    }

    /* ── Compact Metadata Strip ── */
    .meta-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #1e3a8a;
      border-radius: 4px;
      padding: 8px 14px;
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .meta-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px 14px;
      font-size: 12px;
      color: #334155;
    }
    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }
    .meta-label {
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      font-size: 10.5px;
      letter-spacing: 0.4px;
    }
    .meta-val {
      font-weight: 700;
      color: #0f172a;
    }
    .pill-badge {
      display: inline-flex;
      align-items: center;
      padding: 2.5px 8px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 10.5px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .priority-high {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #f87171;
    }
    .priority-medium {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fcd34d;
    }
    .priority-low {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
    }
    .cat-badge {
      background: #ede9fe;
      color: #6d28d9;
      border: 1px solid #c4b5fd;
    }

    /* ── Subject ── */
    .subject-section {
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e2e8f0;
      page-break-inside: avoid;
    }
    .subject-prefix {
      font-size: 11px;
      font-weight: 800;
      color: #ea580c;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: block;
      margin-bottom: 2px;
    }
    .subject-text {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.3;
      margin: 0;
    }

    /* ── Body ── */
    .body-content {
      font-size: 13.5px;
      line-height: 1.7;
      color: #1e293b;
      white-space: pre-wrap;
      word-break: break-word;
      padding: 4px 0 16px 0;
      page-break-inside: auto;
    }

    /* ── Audience Ribbon ── */
    .audience-box {
      background: #f1f5f9;
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      padding: 7px 12px;
      margin-top: 10px;
      margin-bottom: 24px;
      font-size: 11.5px;
      color: #334155;
      page-break-inside: avoid;
    }
    .audience-box strong {
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ── Signatures & Footer ── */
    .footer-signatures {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid #cbd5e1;
      page-break-inside: avoid;
    }
    .sig-table {
      width: 100%;
      border-collapse: collapse;
    }
    .sig-td {
      width: 50%;
      vertical-align: bottom;
    }
    .sig-left {
      text-align: left;
    }
    .sig-right {
      text-align: right;
    }
    .stamp-box {
      display: inline-block;
      border: 1.5px dashed #94a3b8;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }
    .sig-line {
      width: 150px;
      height: 1px;
      background: #475569;
      margin-bottom: 5px;
    }
    .sig-right .sig-line {
      margin-left: auto;
    }
    .sig-name {
      font-size: 12.5px;
      font-weight: 800;
      color: #0f172a;
    }
    .sig-role {
      font-size: 11.5px;
      font-weight: 600;
      color: #1e3a8a;
    }
    .sig-inst {
      font-size: 10.5px;
      color: #64748b;
    }

    .doc-footer-bar {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #94a3b8;
      page-break-inside: avoid;
    }

    @media print {
      body {
        padding: 0 !important;
      }
      .print-sheet {
        border-color: #1e3a8a !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-sheet">
    <div class="inner-border"></div>

    <!-- Background Emblem Watermark -->
    <div class="watermark-container">
      <img src="/assets/shanti-logo.jpg" onerror="this.src='/assets/logo.jpg'" alt="" />
    </div>

    <div class="content-wrapper">
      <!-- Official Header -->
      <table class="header-table">
        <tr>
          <td class="logo-td">
            <div class="logo-img-wrap">
              <img src="/assets/shanti-logo.jpg" onerror="this.src='/assets/logo.jpg'" alt="Logo" />
            </div>
          </td>
          <td class="title-td">
            <div class="org-banner">RangBharti's</div>
            <h1 class="school-title">SHANTI GURUKUL</h1>
            <div class="school-sub">Bachani, Tal. Kagal, Dist. Kolhapur, Maharashtra — 416234</div>
            <div class="school-motto">ज्ञानं परमं बलम् &bull; Residential &amp; Day Boarding School</div>
          </td>
          <td class="right-balance-td"></td>
        </tr>
      </table>

      <!-- Divider -->
      <div class="header-divider"></div>

      <!-- Compact Metadata Card -->
      <div class="meta-card">
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Notice Ref:</span>
            <span class="meta-val">${noticeNo}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date of Issue:</span>
            <span class="meta-val">${dateStr}</span>
          </div>
        </div>
      </div>

      <!-- Subject -->
      <div class="subject-section">
        <span class="subject-prefix">Official Circular</span>
        <h2 class="subject-text">Subject: ${n.title}</h2>
      </div>

      <!-- Notice Content -->
      <div class="body-content">${bodyText.replace(/</g, '&lt;')}</div>

      <!-- Circulation Audience -->
      <div class="audience-box">
        <strong>Circulated To:</strong> ${audienceStr}
      </div>

      <!-- Footer & Signatures -->
      <div class="footer-signatures">
        <table class="sig-table">
          <tr>
            <td class="sig-td sig-left">
              <div class="stamp-box">Institutional Seal</div>
              <div class="sig-name">Administrative Office</div>
              <div class="sig-role">Office Superintendent</div>
              <div class="sig-inst">Shanti Gurukul, Bachani</div>
            </td>
            <td class="sig-td sig-right">
              <div class="sig-line"></div>
              <div class="sig-name">${postedBy}</div>
              <div class="sig-role">${issuerRole}</div>
              <div class="sig-inst">Shanti Gurukul, Bachani</div>
            </td>
          </tr>
        </table>

        <div class="doc-footer-bar">
          <span>This is an official document of Shanti Gurukul School Management System.</span>
          <span>Printed on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`);
    doc.close();

    // Trigger print cleanly once styles and logo are loaded without popup blank tabs
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print execution failed:', err);
      }
    }, 280);
  }

  /* ══════════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════════ */
  return (
    <Layout pageTitle="📢 Notice Board">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title"><span>📢</span> Notice Board</div>
          <div className="page-subtitle" style={{ marginTop:4 }}>
            Total: {notices.length} &nbsp;|&nbsp; Urgent: {urgent} &nbsp;|&nbsp; This Month: {thisMonth}
          </div>
        </div>
        {canPost && (
          <button className="btn btn-primary" onClick={openPost}>📢 Post New Notice</button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-4 mb-3">
        {[
          { icon:'📋', label:'Total Notices',  value: notices.length,  color:'#3b82f6', bg:'rgba(59,130,246,0.12)'  },
          { icon:'🚨', label:'Urgent',         value: urgent,          color:'#ef4444', bg:'rgba(239,68,68,0.12)'   },
          { icon:'📅', label:'This Month',     value: thisMonth,       color:'#10b981', bg:'rgba(16,185,129,0.12)'  },
          { icon:'📂', label:'Categories',     value: [...new Set(notices.map(n=>n.category))].length, color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background:s.bg }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}>🔍</span>
          <input
            className="form-control"
            style={{ paddingLeft:36 }}
            placeholder="Search notices..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width:150 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]||'📌'} {c}</option>)}
        </select>
        <select className="form-control" style={{ width:150 }} value={prioFilter} onChange={e => setPrioFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="urgent">🚨 Urgent</option>
          <option value="high">🔴 High</option>
          <option value="important">⚠️ Important</option>
          <option value="medium">🟡 Medium</option>
          <option value="normal">🟢 Normal</option>
          <option value="low">🔵 Low</option>
        </select>
        {(query || catFilter || prioFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setQuery(''); setCatFilter(''); setPrioFilter(''); }}>✕ Clear</button>
        )}
      </div>

      {/* ── Notices Grid ── */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
          <div className="spinner" style={{ width:36, height:36 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="card-body">
          <div className="empty-state">
            <div className="icon">📢</div>
            <p>No notices found. {canPost ? 'Post one above!' : 'Check back later.'}</p>
          </div>
        </div></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
          {filtered.map(n => {
            const pMeta = PRIORITY_META[n.priority] || PRIORITY_META.normal;
            const bodyText = n.content || n.body || '';
            const audience = n.targetAudience || ['All'];
            return (
              <div
                key={n.id}
                style={{
                  background:'var(--navy-700)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius)', padding:20,
                  display:'flex', flexDirection:'column', justifyContent:'space-between',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.3)',
                  transition:'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor='var(--border-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor='var(--border)'; }}
              >
                <div>
                  {/* Priority + Date */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, gap:8 }}>
                    <span className={`badge ${pMeta.badge}`} style={{ textTransform:'uppercase', fontWeight:700, fontSize:'0.72rem' }}>
                      {pMeta.label}
                    </span>
                    <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>📅 {formatDate(n.date)}</span>
                  </div>

                  {/* Title */}
                  <div style={{ fontSize:'1rem', fontWeight:700, marginBottom:8, color:'var(--text-primary)', lineHeight:1.4 }}>
                    {n.title}
                  </div>

                  {/* Content preview (3 lines clamped) */}
                  <p style={{
                    fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.5, marginBottom:14,
                    display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden',
                  }}>
                    {bodyText}
                  </p>
                </div>

                <div>
                  {/* Category + Audience */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>
                    <span className="badge badge-blue" style={{ fontSize:'0.7rem' }}>
                      {CAT_ICONS[n.category]||'📌'} {n.category||'General'}
                    </span>
                    {audience.map(a => (
                      <span key={a} className="badge badge-gray" style={{ fontSize:'0.68rem' }}>{a}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px dashed var(--border)', paddingTop:12 }}>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                      By: <strong style={{ color:'var(--text-secondary)' }}>{n.postedBy || 'Admin'}</strong>
                    </span>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openView(n)} style={{ padding:'4px 10px' }}>👁️ View</button>
                      {canDelete && (
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteNotice(n.id)} style={{ padding:'4px 8px', color:'#f87171' }}>🗑️</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ Post Notice Modal ══ */}
      {showForm && (
        <div className="modal-overlay active" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth:580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📢 Post New Notice</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Title */}
              <div className="form-group">
                <label className="form-label">Notice Title *</label>
                <input className="form-control" placeholder="Enter notice title..." value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
              </div>

              {/* Category + Priority + Date */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Date</label>
                  <input className="form-control" type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
                </div>
              </div>

              {/* Content */}
              <div className="form-group">
                <label className="form-label">Notice Content *</label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Write the full notice content here..."
                  value={form.content}
                  onChange={e => setForm(f=>({...f,content:e.target.value}))}
                  style={{ resize:'vertical', lineHeight:1.6 }}
                />
              </div>

              {/* Target Audience */}
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Target Audience</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
                  {AUDIENCES.map(aud => (
                    <label key={aud} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', padding:'6px 12px', borderRadius:6, border:`1px solid ${form.targetAudience.includes(aud) ? 'var(--gold-500)' : 'var(--border)'}`, background: form.targetAudience.includes(aud) ? 'rgba(245,158,11,0.1)' : 'transparent', transition:'all 0.15s', fontSize:'0.8rem', fontWeight:500, color: form.targetAudience.includes(aud) ? 'var(--gold-400)' : 'var(--text-muted)' }}>
                      <input type="checkbox" style={{ display:'none' }} checked={form.targetAudience.includes(aud)} onChange={() => toggleAudience(aud)} />
                      {aud}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveNotice} disabled={saving}>
                {saving ? <><span className="spinner" style={{ borderTopColor:'#1a0a00', width:14, height:14 }} /> Posting…</> : '📢 Post Notice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ View Notice Modal ══ */}
      {showView && viewNotice && (
        <div className="modal-overlay active" onClick={() => setShowView(false)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📢 Notice</div>
              <button className="modal-close" onClick={() => setShowView(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Priority + Date */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span className={`badge ${(PRIORITY_META[viewNotice.priority]||PRIORITY_META.normal).badge}`} style={{ textTransform:'uppercase' }}>
                  {(PRIORITY_META[viewNotice.priority]||PRIORITY_META.normal).label}
                </span>
                <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>📅 {formatDate(viewNotice.date)}</span>
              </div>

              {/* Title */}
              <div style={{ fontSize:'1.25rem', fontWeight:700, color:'var(--text-primary)', marginBottom:8, lineHeight:1.3 }}>
                {viewNotice.title}
              </div>

              {/* Meta */}
              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:16, display:'flex', gap:8, flexWrap:'wrap' }}>
                <span>Category: <strong style={{ color:'var(--text-secondary)' }}>{viewNotice.category||'General'}</strong></span>
                <span>|</span>
                <span>By: <strong style={{ color:'var(--text-secondary)' }}>{viewNotice.postedBy||'Admin'}</strong></span>
              </div>

              {/* Body */}
              <div style={{ background:'var(--glass)', padding:'16px', borderRadius:'var(--radius-sm)', fontSize:'0.92rem', lineHeight:1.7, whiteSpace:'pre-wrap', marginBottom:14, color:'var(--text-primary)', border:'1px solid var(--border)' }}>
                {viewNotice.content || viewNotice.body || ''}
              </div>

              {/* Audience */}
              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                <strong>Target Audience:</strong>{' '}
                {(viewNotice.targetAudience||['All']).join(', ')}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowView(false)}>Close</button>
              <button className="btn btn-blue" onClick={() => printNotice(viewNotice)}>🖨️ Print</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type==='success'?'✅':t.type==='error'?'❌':t.type==='warning'?'⚠️':'ℹ️'}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}
