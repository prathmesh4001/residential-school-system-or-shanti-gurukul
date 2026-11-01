/* ============================================================
   AchievementsPage.jsx — Full React port of achievements.html + achievements.js
   Features: Student Awards, Medals & Honors, Categories (Academic, Sports, Cultural),
             Competition Levels (School to National), Add / Edit Modal
   ============================================================ */
import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const CATEGORIES = ['All', 'Academic', 'Sports', 'Cultural', 'Leadership', 'Science & Tech'];
const LEVELS = ['All', 'School', 'Taluka', 'District', 'State', 'National'];

export default function AchievementsPage() {
  const { user } = useAuth();
  const canEdit = ['admin', 'principal', 'teacher'].includes(user?.role);

  // States
  const [achievements, setAchievements] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [toastMsg, setToastMsg] = useState(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    studentId: '',
    name: '',
    category: 'Academic',
    title: '',
    date: new Date().toISOString().slice(0, 10),
    level: 'District',
    award: 'Gold Medal',
    description: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [achRes, stuRes] = await Promise.all([
        api.get('/achievements'),
        api.get('/students').catch(() => ({ data: [] }))
      ]);
      setAchievements(achRes.data || []);
      setStudents(stuRes.data || []);
    } catch {
      showToast('Could not load achievements data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Statistics
  const stats = useMemo(() => {
    const total = achievements.length;
    const gold = achievements.filter(a => a.award?.toLowerCase().includes('gold') || a.award?.toLowerCase().includes('1st')).length;
    const stateNat = achievements.filter(a => a.level === 'State' || a.level === 'National').length;
    const academic = achievements.filter(a => a.category === 'Academic').length;
    return { total, gold, stateNat, academic };
  }, [achievements]);

  // Filtered
  const filtered = useMemo(() => {
    return achievements.filter(a => {
      const q = query.toLowerCase();
      const matchQ = !q ||
        a.name?.toLowerCase().includes(q) ||
        a.title?.toLowerCase().includes(q) ||
        a.award?.toLowerCase().includes(q) ||
        a.studentId?.toLowerCase().includes(q);
      const matchCat = selectedCat === 'All' || a.category === selectedCat;
      const matchLevel = selectedLevel === 'All' || a.level === selectedLevel;
      return matchQ && matchCat && matchLevel;
    });
  }, [achievements, query, selectedCat, selectedLevel]);

  // Open add / edit modal
  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({ ...item });
    } else {
      setEditItem(null);
      setForm({
        studentId: students[0]?.id || '',
        name: students[0]?.name || '',
        category: 'Academic',
        title: '',
        date: new Date().toISOString().slice(0, 10),
        level: 'District',
        award: 'Gold Medal / 1st Place',
        description: ''
      });
    }
    setShowModal(true);
  };

  // Save achievement
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const stu = students.find(s => s.id === form.studentId);
    const payload = {
      ...form,
      name: stu ? stu.name : form.name
    };

    try {
      if (editItem) {
        const res = await api.put(`/achievements/${editItem.id}`, payload);
        setAchievements(achievements.map(a => a.id === editItem.id ? res.data : a));
        showToast('Achievement updated!');
      } else {
        const res = await api.post('/achievements', payload);
        setAchievements([res.data, ...achievements]);
        showToast('New achievement recorded & honored!');
      }
      setShowModal(false);
    } catch {
      showToast('Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement entry?')) return;
    try {
      await api.delete(`/achievements/${id}`);
      setAchievements(achievements.filter(a => a.id !== id));
      showToast('Achievement record deleted.');
    } catch {
      showToast('Failed to delete achievement.');
    }
  };

  return (
    <Layout pageTitle="🏆 Student Honors & Achievements">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--gold-500)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>🏆</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            🏆 Student Honors & Hall of Fame
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Recognizing Excellence in Academics, Olympiads, Sports & Cultural Endeavors
          </div>
        </div>

        {canEdit && (
          <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
            + Record Honor / Award
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 24
      }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>🏆</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--gold-400)' }}>{stats.total}</div>
            <div className="stat-label">Total Honors Logged</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>School Hall of Fame</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>🥇</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.gold}</div>
            <div className="stat-label">Gold Medals & 1st Places</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Top Podium Finishes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>🇮🇳</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.stateNat}</div>
            <div className="stat-label">State / National Level</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Representing Gurukul</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>📚</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats.academic}</div>
            <div className="stat-label">Academic Olympiads</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Math, Science & Tech</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text" className="form-control" placeholder="🔍 Search award, student, title..."
            value={query} onChange={e => setQuery(e.target.value)} style={{ maxWidth: 280 }}
          />

          <select
            className="form-control" value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ maxWidth: 180 }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>

          <select
            className="form-control" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} style={{ maxWidth: 160 }}
          >
            {LEVELS.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : `${l} Level`}</option>)}
          </select>

          <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {achievements.length} awards
          </div>
        </div>
      </div>

      {/* Grid of Achievement Cards */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading achievements...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No achievements found matching your filters.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {filtered.map(item => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: 22, display: 'flex', flexDirection: 'column', gap: 12,
                position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: item.award?.toLowerCase().includes('gold') ? 'var(--gold-500)' : '#3b82f6'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '0.72rem', textTransform: 'uppercase', background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--gold-400)', fontWeight: 800, padding: '3px 8px', borderRadius: 4
                }}>
                  {item.category} • {item.level} Level
                </span>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  📅 {item.date}
                </span>
              </div>

              <div>
                <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                  {item.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>🥇</span>
                  <strong style={{ color: 'var(--gold-400)', fontSize: '0.95rem' }}>{item.award}</strong>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8,
                border: '1px solid var(--border)', fontSize: '0.84rem'
              }}>
                <strong>Student:</strong> <span style={{ color: 'var(--text-primary)' }}>{item.name}</span> &nbsp;
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({item.studentId})</span>
              </div>

              {item.description && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.description}
                </div>
              )}

              {canEdit && (
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => openModal(item)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleDelete(item.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add / Edit Achievement */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? '✏️ Edit Achievement' : '🏆 Record Student Achievement'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Select Student *</label>
                  <select
                    className="form-control"
                    value={form.studentId}
                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id}) — Class {s.class}-{s.section}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Competition / Event Title *</label>
                  <input
                    type="text" className="form-control" placeholder="e.g. State Science Olympiad, District Basketball Meet"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-control"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="Academic">Academic</option>
                      <option value="Sports">Sports & Athletics</option>
                      <option value="Cultural">Cultural & Performing Arts</option>
                      <option value="Leadership">Leadership & Social Service</option>
                      <option value="Science & Tech">Science & Technology</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level *</label>
                    <select
                      className="form-control"
                      value={form.level}
                      onChange={e => setForm({ ...form, level: e.target.value })}
                    >
                      <option value="School">School</option>
                      <option value="Taluka">Taluka</option>
                      <option value="District">District</option>
                      <option value="State">State</option>
                      <option value="National">National</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Award / Position *</label>
                    <input
                      type="text" className="form-control" placeholder="e.g. Gold Medal, 1st Place, Trophy"
                      value={form.award}
                      onChange={e => setForm({ ...form, award: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date" className="form-control"
                      value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Honor Description / Citation</label>
                  <textarea
                    rows={2} className="form-control" placeholder="Brief description of the student's performance..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Award Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
