/* ============================================================
   StudentsPage.jsx — Full React port of students.html + students.js
   Features: Search/Filter, Paginated table, Add/Edit modal,
             View profile modal, CSV Export, Role-based actions
   ============================================================ */
import { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';

/* ── Constants ── */
const PAGE_SIZE = 20;
const CLASSES   = ['5','6','7','8','9','10'];
const SECTIONS  = ['A'];

function classLabel(c) {
  const map = {'5':'5th','6':'6th','7':'7th','8':'8th','9':'9th','10':'10th'};
  return (map[c] || c) + ' Std';
}

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

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

/* ── Empty form state ── */
const EMPTY_FORM = {
  id:'', rollNo:'', name:'', class:'', section:'', gender:'',
  dob:'', type:'day', admissionDate: new Date().toISOString().slice(0,10),
  bloodGroup:'', category:'General', academicYear:'2026-27',
  aadhar:'', prevSchool:'', parentName:'', contact:'', altContact:'', address:'',
  photo: null,
};

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function StudentsPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAdmin  = user?.role === 'admin';
  const canEdit  = ['admin','principal'].includes(user?.role);

  const { toasts, show: toast } = useToast();

  /* State */
  const [students,   setStudents]   = useState([]);
  const [stats,      setStats]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [query,      setQuery]      = useState('');
  const [filterCls,  setFilterCls]  = useState('all');
  const [filterSec,  setFilterSec]  = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [page,       setPage]       = useState(1);

  /* Modals */
  const [showForm,   setShowForm]   = useState(false);
  const [showView,   setShowView]   = useState(false);
  const [viewData,   setViewData]   = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [dobAge,     setDobAge]     = useState('');
  const photoRef = useRef();

  /* Fetch */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, stRes] = await Promise.all([
        api.get('/students'),
        api.get('/students/stats'),
      ]);
      setStudents(sRes.data);
      setStats(stRes.data);
    } catch { toast('Failed to load students', 'error'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* Filtered + paginated list */
  const filtered = students.filter(s => {
    const q = query.toLowerCase();
    const matchQ = !q || s.name?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q) || s.rollNo?.toLowerCase().includes(q);
    const matchC = filterCls  === 'all' || s.class  == filterCls;
    const matchS = filterSec  === 'all' || s.section === filterSec;
    const matchT = filterType === 'all' || s.type   === filterType;
    return matchQ && matchC && matchS && matchT;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageList   = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  /* Reset page on filter change */
  useEffect(() => setPage(1), [query, filterCls, filterSec, filterType]);

  /* ── Form helpers ── */
  function openAdd() {
    setForm({ ...EMPTY_FORM, admissionDate: new Date().toISOString().slice(0,10) });
    setDobAge('');
    setShowForm(true);
  }

  function openEdit(s) {
    setForm({
      id: s.id, rollNo: s.rollNo || s.id, name: s.name || '',
      class: s.class || '', section: s.section || '', gender: s.gender || '',
      dob: s.dob || '', type: s.type || 'day',
      admissionDate: s.admissionDate || '', bloodGroup: s.bloodGroup || '',
      category: s.category || 'General', academicYear: s.academicYear || '2026-27',
      aadhar: s.aadhar || '', prevSchool: s.prevSchool || '',
      parentName: s.parentName || '', contact: s.contact || '',
      altContact: s.altContact || '', address: s.address || '',
      photo: s.photo || null,
    });
    calcAge(s.dob || '');
    setShowForm(true);
  }

  function calcAge(dob) {
    if (!dob) { setDobAge(''); return; }
    const d = new Date(dob);
    if (isNaN(d)) { setDobAge(''); return; }
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    setDobAge(age >= 0 ? `(Age: ${age} yrs)` : '');
  }

  function autoRoll() {
    const cls = form.class; const sec = form.section;
    if (cls && sec) {
      const cnt = students.filter(s => String(s.class) === String(cls) && s.section === sec).length + 1;
      setForm(f => ({ ...f, rollNo: `${cls}${sec}-${String(cnt).padStart(2,'0')}` }));
    } else {
      const year = new Date().getFullYear();
      setForm(f => ({ ...f, rollNo: `STU-${year}-${String(students.length+1).padStart(3,'0')}` }));
    }
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setForm(f => ({ ...f, photo: dataUrl }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function saveStudent() {
    if (!form.name || !form.class || !form.section || !form.gender || !form.parentName || !form.contact) {
      toast('Please fill all required (*) fields', 'error'); return;
    }
    if (form.contact.length !== 10) { toast('Contact must be 10 digits', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, id: form.id || undefined };
      if (form.id) await api.put(`/students/${form.id}`, payload);
      else         await api.post('/students', payload);
      toast(form.id ? `✅ "${form.name}" updated!` : `✅ "${form.name}" added!`);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast(err.response?.data?.error || 'Save failed', 'error');
    } finally { setSaving(false); }
  }

  async function deleteStudent(id, name) {
    if (!window.confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/students/${id}`);
      toast(`🗑️ "${name}" deleted`);
      fetchAll();
    } catch { toast('Delete failed', 'error'); }
  }

  /* ── View Profile ── */
  async function openView(s) {
    setViewData(null);
    setShowView(true);
    try {
      const [feeRes, attRes] = await Promise.all([
        api.get(`/fees/status/${s.id}`),
        api.get(`/attendance/student/${s.id}/percent`),
      ]);
      setViewData({ student: s, fee: feeRes.data, att: attRes.data.percentage || 88.5 });
    } catch {
      setViewData({ student: s, fee: { total:0, paid:0, pending:0 }, att: 88.5 });
    }
  }

  /* ── CSV Export ── */
  function exportCSV() {
    const list = filtered.length ? filtered : students;
    const headers = ['Roll No','Name','Class','Section','Gender','Type','Blood Group','Category','Academic Year','Aadhar','DOB','Parent Name','Contact','Alt Contact','Address','Admission Date','Prev School'];
    const rows = list.map(s =>
      [s.rollNo||s.id, s.name, s.class, s.section, s.gender, s.type,
       s.bloodGroup, s.category, s.academicYear, s.aadhar,
       s.dob, s.parentName, s.contact, s.altContact, s.address, s.admissionDate, s.prevSchool]
       .map(v => `"${(v||'').toString().replace(/"/g,'""')}"`)
       .join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'students_shanti_gurukul.csv';
    a.click();
    toast('📥 Exported as CSV', 'info');
  }

  /* ── Print ID Card ── */
  function printIdCard(s) {
    const w = window.open('', '_blank', 'width=420,height=620');
    w.document.write(`<html><head><title>ID Card — ${s.name}</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;padding:24px;background:#fff;display:flex;justify-content:center}
      .card{width:330px;border:2px solid #0a1628;border-radius:14px;overflow:hidden;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,0.15)}
      .hdr{background:linear-gradient(135deg,#0a1628,#1e3a6e);color:white;padding:14px 16px;display:flex;align-items:center;gap:12px}
      .hdr img{width:40px;height:40px;border-radius:50%;border:2px solid #f59e0b}
      .hdr .name{font-size:15px;font-weight:800;color:#f59e0b;letter-spacing:.5px}
      .hdr .sub{font-size:10px;color:#94a3b8}
      .body{padding:16px;display:flex;gap:14px}
      .photo{width:80px;height:90px;border:2px solid #0a1628;border-radius:6px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:32px;overflow:hidden;flex-shrink:0}
      .photo img{width:100%;height:100%;object-fit:cover}
      .info .row{margin-bottom:6px}
      .info .label{font-size:9px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.5px;display:block}
      .info .val{font-size:12px;font-weight:600;color:#111827}
      .badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:9px;font-weight:700;background:#dbeafe;color:#1e40af;text-transform:uppercase}
      .footer{background:#f9fafb;padding:10px 16px;border-top:1px solid #e5e7eb;font-size:9px;color:#9ca3af;text-align:center}
    </style></head><body>
    <div class="card">
      <div class="hdr">
        <img src="/assets/logo.jpg" onerror="this.style.display='none'">
        <div><div class="name">SHANTI GURUKUL</div><div class="sub">Bachani • Student ID Card</div></div>
      </div>
      <div class="body">
        <div class="photo">${s.photo ? `<img src="${s.photo}">` : s.name?.charAt(0).toUpperCase()}</div>
        <div class="info">
          <div class="row"><span class="label">Full Name</span><span class="val">${s.name}</span></div>
          <div class="row"><span class="label">Roll No.</span><span class="val">${s.rollNo||s.id}</span></div>
          <div class="row"><span class="label">Class</span><span class="val">${classLabel(s.class)} – ${s.section}</span></div>
          <div class="row"><span class="label">Type</span><span class="badge">${s.type==='residential'?'Residential':'Day Scholar'}</span></div>
          <div class="row"><span class="label">Parent</span><span class="val">${s.parentName||'—'}</span></div>
          <div class="row"><span class="label">Contact</span><span class="val">${s.contact||'—'}</span></div>
        </div>
      </div>
      <div class="footer">Shanti Gurukul, Bachani | Academic Year 2026–27</div>
    </div>
    <script>window.onload=()=>{window.print()}<\/script>
    </body></html>`);
    w.document.close();
  }

  /* ══════════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════════ */
  return (
    <Layout pageTitle={`👨‍🎓 ${t('nav_students')}`}>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title"><span>👨‍🎓</span> {t('nav_students')}</div>
          <div className="page-subtitle" style={{ marginTop:4 }}>
            {t('totalStudents')}: {stats.total||0} &nbsp;|&nbsp; {t('residential')}: {stats.residential||0} &nbsp;|&nbsp; {t('dayScholar')}: {stats.day||0} &nbsp;|&nbsp; {t('showing')}: {filtered.length}
          </div>
        </div>
        <div className="flex-gap">
          {canEdit && (
            <button className="btn btn-ghost" onClick={exportCSV}>{t('exportCSV')}</button>
          )}
          {isAdmin && (
            <button className="btn btn-primary" onClick={openAdd}>{t('addStudent')}</button>
          )}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1', minWidth:200 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}>🔍</span>
          <input
            className="form-control"
            style={{ paddingLeft:36 }}
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width:130 }} value={filterCls} onChange={e => setFilterCls(e.target.value)}>
          <option value="all">{t('allClasses')}</option>
          {CLASSES.map(c => <option key={c} value={c}>{classLabel(c)}</option>)}
        </select>
        <select className="form-control" style={{ width:120 }} value={filterSec} onChange={e => setFilterSec(e.target.value)}>
          <option value="all">{t('allSections')}</option>
          {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
        <select className="form-control" style={{ width:140 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">{t('allTypes')}</option>
          <option value="residential">{t('residential')}</option>
          <option value="day">{t('dayScholar')}</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => { setQuery(''); setFilterCls('all'); setFilterSec('all'); setFilterType('all'); }}>{t('clear')}</button>
      </div>

      {/* ── Table ── */}
      <div className="card">
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
                  <th>{t('rollNo')}</th>
                  <th>{t('name')}</th>
                  <th>{t('class')}</th>
                  <th>{t('section')}</th>
                  <th>{t('type')}</th>
                  <th>{t('parent')}</th>
                  <th>{t('contact')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {pageList.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <div className="icon">👨‍🎓</div>
                        <p>No students found. Try changing filters or add a new student.</p>
                      </div>
                    </td>
                  </tr>
                ) : pageList.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color:'var(--text-muted)' }}>{(page-1)*PAGE_SIZE + i + 1}</td>
                    <td><strong style={{ color:'var(--gold-400)' }}>{s.rollNo || s.id || '—'}</strong></td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:32, height:32, borderRadius:'50%', flexShrink:0, overflow:'hidden',
                          background:'linear-gradient(135deg,var(--blue-500),var(--navy-400))',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:700, color:'white', fontSize:'0.82rem',
                        }}>
                          {s.photo
                            ? <img src={s.photo} alt={s.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : s.name?.charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{s.name || '—'}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{s.gender ? s.gender.charAt(0).toUpperCase()+s.gender.slice(1) : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{classLabel(s.class)}</span></td>
                    <td><span className="badge badge-gray">Sec {s.section || '—'}</span></td>
                    <td>
                      <span className={`badge ${s.type === 'residential' ? 'badge-purple' : 'badge-green'}`}>
                        {s.type === 'residential' ? `🏠 ${t('residential')}` : `🚌 ${t('dayScholar')}`}
                      </span>
                    </td>
                    <td style={{ color:'var(--text-secondary)' }}>{s.parentName || '—'}</td>
                    <td style={{ color:'var(--text-secondary)' }}>{s.contact || '—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="View Profile"
                          onClick={() => openView(s)}
                          style={{ padding:'5px 8px' }}
                        >👁️</button>
                        {canEdit && (
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                            onClick={() => openEdit(s)}
                            style={{ padding:'5px 8px' }}
                          >✏️</button>
                        )}
                        {isAdmin && (
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Delete"
                            onClick={() => deleteStudent(s.id, s.name)}
                            style={{ padding:'5px 8px', color:'#f87171' }}
                          >🗑️</button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Print ID Card"
                          onClick={() => printIdCard(s)}
                          style={{ padding:'5px 8px' }}
                        >🎫</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderTop:'1px solid var(--border)', flexWrap:'wrap', gap:8 }}>
          <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
            {pageList.length > 0
              ? `Showing ${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE, filtered.length)} of ${filtered.length} students`
              : 'No results'}
          </span>
          {totalPages > 1 && (
            <div style={{ display:'flex', gap:4 }}>
              <PaginationBtn onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>‹</PaginationBtn>
              {Array.from({ length: totalPages }, (_, i) => i+1).map(p => {
                if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
                  if (p === 2 || p === totalPages-1) return <PaginationBtn key={p} disabled>…</PaginationBtn>;
                  return null;
                }
                return (
                  <PaginationBtn key={p} active={p===page} onClick={() => setPage(p)}>{p}</PaginationBtn>
                );
              })}
              <PaginationBtn onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}>›</PaginationBtn>
            </div>
          )}
        </div>
      </div>

      {/* ══ Add / Edit Modal ══ */}
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth:680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{form.id ? t('modalEditTitle') : t('modalAddTitle')}</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight:'75vh', overflowY:'auto' }}>
              {/* Photo + Basic Info */}
              <div style={{ display:'flex', gap:20, alignItems:'flex-start', marginBottom:20 }}>
                {/* Photo Upload */}
                <div>
                  <label className="form-label">{t('photoUpload')}</label>
                  <div
                    onClick={() => photoRef.current?.click()}
                    style={{
                      width:80, height:90, borderRadius:8, border:'2px dashed var(--border)',
                      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                      gap:4, cursor:'pointer', background:'var(--bg-input)', marginTop:6,
                      overflow:'hidden', transition:'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='var(--gold-500)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
                  >
                    {form.photo
                      ? <img src={form.photo} alt="Photo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <><span style={{ fontSize:'1.6rem' }}>📷</span><span style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{t('photoClick')}</span></>
                    }
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
                </div>
                {/* Name + Roll + Class + Section + Gender */}
                <div style={{ flex:1 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <FormGroup label={t('fullName')}>
                      <input className="form-control" placeholder="Full name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
                    </FormGroup>
                    <FormGroup label={t('rollNo')}>
                      <div style={{ display:'flex', gap:6 }}>
                        <input className="form-control" placeholder="e.g. 10A-01 or auto" value={form.rollNo} onChange={e => setForm(f=>({...f,rollNo:e.target.value}))} />
                        <button type="button" className="btn btn-ghost btn-sm" onClick={autoRoll} style={{ whiteSpace:'nowrap' }}>{t('autoRoll')}</button>
                      </div>
                    </FormGroup>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                    <FormGroup label={`${t('class')} *`}>
                      <select className="form-control" value={form.class} onChange={e => { setForm(f=>({...f,class:e.target.value})); }}>
                        <option value="">{t('select')}</option>
                        {CLASSES.map(c => <option key={c} value={c}>{classLabel(c)}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label={`${t('section')} *`}>
                      <select className="form-control" value={form.section} onChange={e => { setForm(f=>({...f,section:e.target.value})); }}>
                        <option value="">{t('select')}</option>
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label={`${t('gender')} *`}>
                      <select className="form-control" value={form.gender} onChange={e => setForm(f=>({...f,gender:e.target.value}))}>
                        <option value="">{t('select')}</option>
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                        <option value="other">{t('other')}</option>
                      </select>
                    </FormGroup>
                  </div>
                </div>
              </div>

              <SectionTitle>{t('personalDetails')}</SectionTitle>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <FormGroup label={<span>{t('dob')} <span style={{ fontSize:'0.72rem', color:'var(--blue-400)', fontWeight:600 }}>{dobAge}</span></span>}>
                  <input
                    type="date"
                    className="form-control"
                    value={form.dob}
                    onChange={e => { setForm(f=>({...f,dob:e.target.value})); calcAge(e.target.value); }}
                  />
                </FormGroup>
                <FormGroup label={`${t('type')} *`}>
                  <select className="form-control" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                    <option value="day">{t('dayScholar')}</option>
                    <option value="residential">{t('residential')}</option>
                  </select>
                </FormGroup>
                <FormGroup label={t('admissionDate')}>
                  <input type="date" className="form-control" value={form.admissionDate} onChange={e => setForm(f=>({...f,admissionDate:e.target.value}))} />
                </FormGroup>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <FormGroup label={t('bloodGroup')}>
                  <select className="form-control" value={form.bloodGroup} onChange={e => setForm(f=>({...f,bloodGroup:e.target.value}))}>
                    <option value="">{t('select')}</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label={t('category')}>
                  <select className="form-control" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                    {['General','SC','ST','OBC','NT','VJNT','SBC'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label={t('academicYear')}>
                  <select className="form-control" value={form.academicYear} onChange={e => setForm(f=>({...f,academicYear:e.target.value}))}>
                    {['2024-25','2025-26','2026-27','2027-28','2028-29'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </FormGroup>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FormGroup label={t('aadharNumber')}>
                  <input className="form-control" maxLength={12} placeholder="12-digit Aadhar" value={form.aadhar} onChange={e => setForm(f=>({...f,aadhar:e.target.value}))} />
                </FormGroup>
                <FormGroup label={t('previousSchool')}>
                  <input className="form-control" placeholder="Previous school name" value={form.prevSchool} onChange={e => setForm(f=>({...f,prevSchool:e.target.value}))} />
                </FormGroup>
              </div>

              <SectionTitle>{t('parentDetails')}</SectionTitle>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FormGroup label={t('parentName')}>
                  <input className="form-control" placeholder="Father / Mother / Guardian name" value={form.parentName} onChange={e => setForm(f=>({...f,parentName:e.target.value}))} />
                </FormGroup>
                <FormGroup label={t('contactNumber')}>
                  <input className="form-control" type="tel" maxLength={10} placeholder="10-digit mobile" value={form.contact} onChange={e => setForm(f=>({...f,contact:e.target.value}))} />
                </FormGroup>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FormGroup label={t('altContact')}>
                  <input className="form-control" type="tel" maxLength={10} placeholder="Optional" value={form.altContact} onChange={e => setForm(f=>({...f,altContact:e.target.value}))} />
                </FormGroup>
                <FormGroup label={t('address')}>
                  <input className="form-control" placeholder="Village / Town, District" value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} />
                </FormGroup>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" onClick={saveStudent} disabled={saving}>
                {saving ? <><span className="spinner" style={{ borderTopColor:'#1a0a00', width:14, height:14 }} /> {t('saving')}</> : (form.id ? t('saveChanges') : t('saveStudent'))}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ══ View Profile Modal ══ */}
      {showView && (
        <ModalOverlay onClose={() => setShowView(false)}>
          <div className="modal" style={{ maxWidth:620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">👤 Student Profile</div>
              <button className="modal-close" onClick={() => setShowView(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight:'75vh', overflowY:'auto' }}>
              {!viewData ? (
                <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
                  <div className="spinner" style={{ width:32, height:32 }} />
                </div>
              ) : (
                <ViewProfile data={viewData} />
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowView(false)}>Close</button>
              {viewData && (
                <button className="btn btn-blue" onClick={() => printIdCard(viewData.student)}>🎫 Print ID Card</button>
              )}
            </div>
          </div>
        </ModalOverlay>
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

/* ── View Profile Component ── */
function ViewProfile({ data }) {
  const { student: s, fee, att } = data;
  const attColor = att >= 75 ? 'var(--success)' : att >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <>
      {/* Header */}
      <div style={{ display:'flex', gap:20, marginBottom:20, alignItems:'flex-start' }}>
        <div style={{
          width:80, height:80, borderRadius:'50%', border:'3px solid var(--gold-500)',
          background:'linear-gradient(135deg,var(--blue-500),var(--navy-400))',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'2rem', fontWeight:700, color:'white', flexShrink:0, overflow:'hidden',
        }}>
          {s.photo ? <img src={s.photo} alt={s.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : s.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 style={{ color:'var(--text-primary)', marginBottom:6, fontSize:'1.1rem' }}>{s.name}</h3>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <span className="badge badge-blue">{classLabel(s.class)} – {s.section}</span>
            <span className={`badge ${s.type==='residential'?'badge-purple':'badge-green'}`}>
              {s.type==='residential'?'🏠 Residential':'🚌 Day Scholar'}
            </span>
            {s.gender && <span className="badge badge-gray">{s.gender}</span>}
          </div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:6 }}>
            Roll: <strong style={{ color:'var(--text-secondary)' }}>{s.rollNo || s.id}</strong>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Personal */}
        <InfoCard title="Personal">
          <InfoRow label="DOB"          value={formatDate(s.dob)} />
          <InfoRow label="Admitted"     value={formatDate(s.admissionDate)} />
          <InfoRow label="Academic Yr"  value={s.academicYear || '—'} />
          <InfoRow label="Category"     value={s.category || '—'} />
          <InfoRow label="Blood Group"  value={s.bloodGroup || '—'} highlight={s.bloodGroup ? 'var(--danger)' : null} />
          {s.aadhar && <InfoRow label="Aadhar" value={s.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')} />}
          {s.address && <InfoRow label="Address" value={s.address} />}
        </InfoCard>

        {/* Parent */}
        <InfoCard title="Parent / Guardian">
          <InfoRow label="Name"        value={s.parentName || '—'} />
          <InfoRow label="Contact"     value={s.contact || '—'} />
          {s.altContact && <InfoRow label="Alt. Contact" value={s.altContact} />}
        </InfoCard>

        {/* Attendance */}
        <InfoCard title="Attendance (This Month)">
          <div style={{ fontSize:'2rem', fontWeight:800, color: attColor }}>{att}%</div>
          <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.1)', marginTop:8, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${att}%`, background: attColor, borderRadius:3, transition:'width 0.6s' }} />
          </div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:6 }}>
            {att >= 75 ? '✅ Good' : att >= 50 ? '⚠️ Low' : '❌ Critical'}
          </div>
        </InfoCard>

        {/* Fee Status */}
        <InfoCard title="Fee Status">
          <InfoRow label="Total Fee" value={`₹${Number(fee.total||0).toLocaleString('en-IN')}`} />
          <InfoRow label="Paid"      value={`₹${Number(fee.paid||0).toLocaleString('en-IN')}`} highlight="var(--success)" />
          <InfoRow label="Balance"   value={`₹${Number(fee.pending||0).toLocaleString('en-IN')}`} highlight={fee.pending > 0 ? 'var(--danger)' : null} />
          <span className={`badge mt-1 ${fee.pending <= 0 ? 'badge-green' : fee.paid > 0 ? 'badge-gold' : 'badge-red'}`} style={{ marginTop:8 }}>
            {fee.pending <= 0 ? '✅ Paid' : fee.paid > 0 ? '🟡 Partial' : '❌ Pending'}
          </span>
        </InfoCard>
      </div>
    </>
  );
}

/* ── Small helper components ── */
function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="modal-overlay active"
      onClick={onClose}
    >
      {children}
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="form-group" style={{ marginBottom:0 }}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)',
      textTransform:'uppercase', letterSpacing:'0.8px',
      margin:'16px 0 10px', paddingBottom:6,
      borderBottom:'1px solid var(--border)',
    }}>
      {children}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div style={{ background:'var(--glass)', borderRadius:10, padding:14, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>{title}</div>
      <div style={{ fontSize:'0.82rem', display:'grid', gap:5 }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div>
      <span style={{ color:'var(--text-muted)' }}>{label}: </span>
      <strong style={{ color: highlight || 'var(--text-secondary)' }}>{value}</strong>
    </div>
  );
}

function PaginationBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:32, height:32, borderRadius:6, border:'1px solid var(--border)',
        background: active ? 'rgba(245,158,11,0.15)' : 'transparent',
        color: active ? 'var(--gold-400)' : disabled ? 'var(--text-disabled)' : 'var(--text-muted)',
        fontSize:'0.82rem', fontWeight: active ? 700 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition:'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
