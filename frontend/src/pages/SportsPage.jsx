/* ============================================================
   SportsPage.jsx — Full React port of sports.html + sports.js
   Features: Sports Squads & Teams, Practice Schedules, Coach Directory,
             House Championship Points, Add / Edit Team Modal
   ============================================================ */
import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const HOUSES = [
  { name: 'Agni (Fire)',    color: '#ef4444', points: 340, icon: '🔥' },
  { name: 'Vayu (Wind)',    color: '#3b82f6', points: 315, icon: '💨' },
  { name: 'Jal (Water)',    color: '#06b6d4', points: 290, icon: '💧' },
  { name: 'Prithvi (Earth)',color: '#10b981', points: 305, icon: '🌱' },
];

export default function SportsPage() {
  const { user } = useAuth();
  const canEdit = ['admin', 'principal', 'teacher', 'warden'].includes(user?.role);

  // States
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'houses' | 'schedule'
  const [toastMsg, setToastMsg] = useState(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [form, setForm] = useState({
    name: '',
    category: 'outdoor',
    coach: 'Mr. Ramesh (PET Coach)',
    schedule: 'Mon/Wed/Fri - 5:00 PM',
    members: []
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [spRes, stuRes] = await Promise.all([
        api.get('/sports'),
        api.get('/students').catch(() => ({ data: [] }))
      ]);
      setTeams(spRes.data || []);
      setStudents(stuRes.data || []);
    } catch {
      showToast('Could not load sports teams.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open modal
  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({
        name: item.name || '',
        category: item.category || 'outdoor',
        coach: item.coach || '',
        schedule: item.schedule || '',
        members: item.members || []
      });
    } else {
      setEditItem(null);
      setForm({
        name: '',
        category: 'outdoor',
        coach: 'Mr. Ramesh (PET Coach)',
        schedule: 'Mon/Wed/Fri - 5:00 PM',
        members: []
      });
    }
    setShowModal(true);
  };

  // Save team
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        const res = await api.put(`/sports/${editItem.id}`, form);
        setTeams(teams.map(t => t.id === editItem.id ? res.data : t));
        showToast('Sports squad updated!');
      } else {
        const res = await api.post('/sports', form);
        setTeams([res.data, ...teams]);
        showToast('New sports squad created!');
      }
      setShowModal(false);
    } catch {
      showToast('Failed to save sports team.');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sports squad?')) return;
    try {
      await api.delete(`/sports/${id}`);
      setTeams(teams.filter(t => t.id !== id));
      showToast('Sports squad removed.');
    } catch {
      showToast('Failed to delete squad.');
    }
  };

  return (
    <Layout pageTitle="🏋️ Sports & Physical Fitness">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--gold-500)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>🏋️</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            🏋️ Sports & Physical Education
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Outdoor Athletics • Indoor Arenas • House Points Championship & Daily Fitness Drills
          </div>
        </div>

        {canEdit && (
          <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
            + Add Sports Team
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 24
      }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>🏆</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#10b981' }}>{teams.length || 6}</div>
            <div className="stat-label">Active Sports Teams</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Cricket, Basketball, Kabaddi...</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>🏃</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--gold-400)' }}>85+</div>
            <div className="stat-label">Enrolled Athletes</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Daily Evening Practice</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>🛡️</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#3b82f6' }}>4 Houses</div>
            <div className="stat-label">Annual Championship</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Agni, Vayu, Jal, Prithvi</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>📅</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#8b5cf6' }}>15 Oct</div>
            <div className="stat-label">Annual Sports Day</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Track & Field Meets</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 10, borderBottom: '1px solid var(--border)',
        marginBottom: 20, paddingBottom: 2
      }}>
        <button
          className={`tab-btn${activeTab === 'teams' ? ' active' : ''}`}
          onClick={() => setActiveTab('teams')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'teams' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'teams' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem'
          }}
        >
          🏏 Sports Squads & Teams ({teams.length})
        </button>
        <button
          className={`tab-btn${activeTab === 'houses' ? ' active' : ''}`}
          onClick={() => setActiveTab('houses')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'houses' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'houses' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem'
          }}
        >
          🛡️ House Championship Points
        </button>
      </div>

      {/* Tab 1: Teams Grid */}
      {activeTab === 'teams' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {teams.map(team => (
            <div
              key={team.id}
              className="card"
              style={{
                padding: 22, display: 'flex', flexDirection: 'column', gap: 12,
                position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: team.category === 'indoor' ? '#3b82f6' : '#10b981'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                  {team.name}
                </h3>
                <span className={`badge ${team.category === 'indoor' ? 'badge-blue' : 'badge-teal'}`}>
                  {team.category?.toUpperCase()}
                </span>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.84rem'
              }}>
                <div><strong>👨‍🏫 Coach Incharge:</strong> <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{team.coach}</span></div>
                <div><strong>🕒 Practice Timing:</strong> <span style={{ color: 'var(--text-secondary)' }}>{team.schedule}</span></div>
                <div><strong>🏃 Squad Members:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{(team.members || []).length} Athletes</span></div>
              </div>

              {canEdit && (
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8, justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => openModal(team)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleDelete(team.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: House Championship Standings */}
      {activeTab === 'houses' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {HOUSES.map((h, idx) => (
            <div
              key={h.name}
              className="card"
              style={{
                padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', gap: 12, position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute', top: 12, right: 12, fontSize: '0.75rem',
                background: idx === 0 ? 'var(--gold-500)' : 'rgba(255,255,255,0.08)',
                color: idx === 0 ? '#000' : 'var(--text-muted)', fontWeight: 900,
                padding: '2px 8px', borderRadius: 10
              }}>
                Rank #{idx + 1}
              </div>

              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: `${h.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                border: `2px solid ${h.color}`
              }}>
                {h.icon}
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                  {h.name}
                </h3>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: h.color, marginTop: 4 }}>
                  {h.points} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>pts</span>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Track & field, Kabaddi tournaments & inter-house academic quiz scores combined.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add / Edit Team */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? '✏️ Edit Sports Team' : '🏏 Add Sports Squad'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Team / Sport Name *</label>
                  <input
                    type="text" className="form-control" placeholder="e.g. Gurukul Cricket XI, Basketball Team"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
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
                      <option value="outdoor">Outdoor Field Sport</option>
                      <option value="indoor">Indoor Arena Sport</option>
                      <option value="athletics">Athletics & Track</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Coach Incharge *</label>
                    <input
                      type="text" className="form-control"
                      value={form.coach}
                      onChange={e => setForm({ ...form, coach: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Practice Schedule *</label>
                  <input
                    type="text" className="form-control" placeholder="e.g. Mon/Wed/Fri - 5:00 PM to 6:30 PM"
                    value={form.schedule}
                    onChange={e => setForm({ ...form, schedule: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
