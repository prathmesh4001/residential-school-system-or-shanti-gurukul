/* ============================================================
   StaffPage.jsx — Full React port of staff.html + staff.js
   Features: Staff table with search/filter, Add/Edit modal,
             Subject–Teacher assignment summary, role-based actions
   ============================================================ */
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

/* ── Constants ── */
const SUBJECTS = [
  'English',
  'Marathi',
  'Hindi',
  'Mathematics',
  'Algebra',
  'Geometry',
  'Science',
  'History',
  'Geography',
  'Physical Education',
];

const CLASS_TEACHER_OPTIONS = ['5','6','7','8','9','10'].map(c => `${c}-A`);

const ROLE_META = {
  teacher:   { badge:'badge-blue',   icon:'👩‍🏫', label:'Teacher'            },
  principal: { badge:'badge-purple', icon:'🎓',  label:'Principal'          },
  mentor:    { badge:'badge-green',  icon:'👥',  label:'Residential Mentor' },
  warden:    { badge:'badge-green',  icon:'👥',  label:'Residential Mentor' },
  admin:     { badge:'badge-gold',   icon:'🛡️',  label:'Admin / Clerk'      },
  support:   { badge:'badge-gray',   icon:'🔧',  label:'Support Staff'      },
  peon:      { badge:'badge-gold',   icon:'🧹',  label:'Peon'               },
  clerk:     { badge:'badge-gray',   icon:'📋',  label:'Clerk'              },
};

const EMPTY_FORM = {
  id:'', name:'', role:'teacher', subject:'', classTeacherOf:'',
  contact:'', email:'', qualification:'', joiningDate: new Date().toISOString().slice(0,10),
};

/* ── Toast hook ── */
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
export default function StaffPage() {
  const { user } = useAuth();
  const isAdmin  = ['admin', 'principal'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const { toasts, show: toast } = useToast();

  const [staff,      setStaff]    = useState([]);
  const [loading,    setLoading]  = useState(true);
  const [query,      setQuery]    = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showForm,   setShowForm] = useState(false);
  const [form,       setForm]     = useState(EMPTY_FORM);
  const [saving,     setSaving]   = useState(false);

  /* Fetch */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff');
      setStaff(res.data);
    } catch { toast('Failed to load staff', 'error'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* Filtered list */
  const filtered = staff.filter(s => {
    const q = query.toLowerCase();
    const matchQ = !q || s.name?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q);
    const matchR = roleFilter === 'all' || s.role === roleFilter;
    return matchQ && matchR;
  });

  /* Teachers for subject-assignment table */
  const teachers = staff.filter(s => s.role === 'teacher');

  /* ── Form ── */
  function openAdd() {
    setForm({ ...EMPTY_FORM, joiningDate: new Date().toISOString().slice(0,10) });
    setShowForm(true);
  }

  function openEdit(s) {
    setForm({
      id: s.id, name: s.name||'', role: s.role||'teacher',
      subject: s.subject||'', classTeacherOf: s.classTeacherOf||'',
      contact: s.contact||'', email: s.email||'',
      qualification: s.qualification||'', joiningDate: s.joiningDate||'',
    });
    setShowForm(true);
  }

  async function saveStaff() {
    if (!form.name || !form.role || !form.contact) {
      toast('Fill all required (*) fields', 'error'); return;
    }
    if (form.contact.length !== 10) { toast('Contact must be 10 digits', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, id: form.id || undefined };
      if (form.id) await api.put(`/staff/${form.id}`, payload);
      else         await api.post('/staff', payload);
      toast(form.id ? `✅ "${form.name}" updated!` : `✅ "${form.name}" added!`);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast(err.response?.data?.error || 'Save failed', 'error');
    } finally { setSaving(false); }
  }

  async function deleteStaff(id, name) {
    if (!window.confirm(`Delete staff "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/staff/${id}`);
      toast(`🗑️ "${name}" deleted`);
      fetchAll();
    } catch { toast('Delete failed', 'error'); }
  }

  /* ══════════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════════ */
  return (
    <Layout pageTitle="👩‍🏫 Staff Management">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title"><span>👩‍🏫</span> Staff Management</div>
          <div className="page-subtitle" style={{ marginTop: 4 }}>
            Total Staff: {staff.length} &nbsp;|&nbsp; Showing: {filtered.length}
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openAdd}>➕ Add Staff</button>
        )}
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-4 mb-3">
        {[
          { icon:'👩‍🏫', label:'Teachers',       value: staff.filter(s=>s.role==='teacher').length,   color:'#3b82f6', bg:'rgba(59,130,246,0.12)'  },
          { icon:'🏫',  label:'Class Teachers', value: staff.filter(s=>s.classTeacherOf).length,     color:'#10b981', bg:'rgba(16,185,129,0.12)' },
          { icon:'🧹',  label:'Peons',          value: staff.filter(s=>s.role==='peon').length,      color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
          { icon:'👥',  label:'Total Staff',    value: staff.length,                                 color:'#8b5cf6', bg:'rgba(139,92,246,0.12)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
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
            placeholder="Search staff by name or ID..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width:160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="teacher">Teachers</option>
          <option value="peon">Peons</option>
          <option value="principal">Principal</option>
          <option value="mentor">Residential Mentor</option>
          <option value="admin">Admin / Clerk</option>
          <option value="support">Support Staff</option>
        </select>
        {(query || roleFilter !== 'all') && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setQuery(''); setRoleFilter('all'); }}>✕ Clear</button>
        )}
      </div>

      {/* ── Staff Table ── */}
      <div className="card mb-3">
        <div className="table-wrap">
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
              <div className="spinner" style={{ width:36, height:36 }} />
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Subject / Dept.</th>
                  <th>Class Teacher Of</th>
                  <th>Contact</th>
                  <th>Qualification</th>
                  <th>Joining Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 10 : 9}>
                      <div className="empty-state">
                        <div className="icon">👩‍🏫</div>
                        <p>No staff found.</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((s, i) => {
                  const meta = ROLE_META[s.role] || { badge:'badge-gray', icon:'👤', label: s.role };
                  const initialLetter = s.role === 'teacher' ? 'T' : (s.role === 'peon' ? 'P' : (s.name?.charAt(0).toUpperCase() || 'S'));
                  const avatarBg = s.role === 'teacher'
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : (s.role === 'peon'
                        ? 'linear-gradient(135deg, #d97706, #b45309)'
                        : 'linear-gradient(135deg, var(--blue-500), var(--navy-400))');
                  return (
                    <tr key={s.id}>
                      <td style={{ color:'var(--text-muted)' }}>{i + 1}</td>
                      <td><strong style={{ color:'var(--gold-400)' }}>{s.id}</strong></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{
                            width:34, height:34, borderRadius:'50%', flexShrink:0,
                            background: avatarBg,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontWeight:800, color:'white', fontSize:'0.9rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                          }}>
                            {initialLetter}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{s.name}</div>
                            {s.email && <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{s.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${meta.badge}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td style={{ color:'var(--text-secondary)' }}>{s.subject || '—'}</td>
                      <td>
                        {s.classTeacherOf
                          ? <span className="badge badge-blue">Class {s.classTeacherOf}</span>
                          : <span style={{ color:'var(--text-disabled)' }}>—</span>}
                      </td>
                      <td style={{ color:'var(--text-secondary)' }}>{s.phone || s.contact || '—'}</td>
                      <td style={{ color:'var(--text-secondary)' }}>{s.qualification || '—'}</td>
                      <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>
                        {s.joinDate || s.joiningDate
                          ? new Date(s.joinDate || s.joiningDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
                          : '—'}
                      </td>
                      {isAdmin && (
                        <td>
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => openEdit(s)} style={{ padding:'5px 8px' }}>✏️</button>
                            {canDelete && (
                              <button className="btn btn-ghost btn-sm" title="Delete" onClick={() => deleteStaff(s.id, s.name)} style={{ padding:'5px 8px', color:'#f87171' }}>🗑️</button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Subject–Teacher Assignment ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📚 Subject – Teacher Assignment</div>
          <span className="badge badge-blue">{teachers.length} Teachers</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Assigned Teacher(s)</th>
                <th>Class Teacher Role</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map(sub => {
                const assigned = teachers.filter(t => t.subject === sub);
                return (
                  <tr key={sub}>
                    <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{sub}</td>
                    <td>
                      {assigned.length > 0
                        ? assigned.map(t => (
                            <span key={t.id} className="badge badge-blue" style={{ margin:'2px' }}>{t.name}</span>
                          ))
                        : <span style={{ color:'var(--text-disabled)' }}>Not assigned</span>}
                    </td>
                    <td>
                      {assigned.some(t => t.classTeacherOf)
                        ? assigned.filter(t => t.classTeacherOf).map(t => (
                            <span key={t.id} className="badge badge-green" style={{ margin:'2px', fontSize:'0.7rem' }}>
                              CT: {t.classTeacherOf}
                            </span>
                          ))
                        : <span style={{ color:'var(--text-disabled)' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ Add / Edit Modal ══ */}
      {showForm && (
        <div className="modal-overlay active" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{form.id ? '✏️ Edit Staff' : '➕ Add Staff'}</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Name + Role */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" placeholder="Staff full name" value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Role *</label>
                  <select className="form-control" value={form.role} onChange={e => setForm(f => ({...f, role:e.target.value, subject: e.target.value !== 'teacher' ? '' : f.subject, classTeacherOf: e.target.value !== 'teacher' ? '' : f.classTeacherOf}))}>
                    <option value="teacher">Teacher</option>
                    <option value="principal">Principal</option>
                    <option value="mentor">Residential Mentor</option>
                    <option value="admin">Admin / Clerk</option>
                    <option value="support">Support Staff</option>
                    <option value="peon">Peon</option>
                  </select>
                </div>
              </div>

              {/* Teacher-only fields */}
              {form.role === 'teacher' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12, padding:14, background:'rgba(59,130,246,0.05)', borderRadius:8, border:'1px solid rgba(59,130,246,0.2)' }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Subject</label>
                    <select className="form-control" value={form.subject} onChange={e => setForm(f => ({...f,subject:e.target.value}))}>
                      <option value="">None / Multiple</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Class Teacher Of</label>
                    <select className="form-control" value={form.classTeacherOf} onChange={e => setForm(f => ({...f,classTeacherOf:e.target.value}))}>
                      <option value="">Not a Class Teacher</option>
                      {CLASS_TEACHER_OPTIONS.map(opt => <option key={opt} value={opt}>Class {opt}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Contact + Email */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Contact Number *</label>
                  <input className="form-control" type="tel" maxLength={10} placeholder="10-digit mobile" value={form.contact} onChange={e => setForm(f => ({...f,contact:e.target.value}))} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({...f,email:e.target.value}))} />
                </div>
              </div>

              {/* Qualification + Joining */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Qualification</label>
                  <input className="form-control" placeholder="e.g. B.Ed, M.A." value={form.qualification} onChange={e => setForm(f => ({...f,qualification:e.target.value}))} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Joining Date</label>
                  <input className="form-control" type="date" value={form.joiningDate} onChange={e => setForm(f => ({...f,joiningDate:e.target.value}))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveStaff} disabled={saving}>
                {saving ? <><span className="spinner" style={{ borderTopColor:'#1a0a00', width:14, height:14 }} /> Saving…</> : '💾 Save Staff'}
              </button>
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
