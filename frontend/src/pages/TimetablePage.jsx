/* ============================================================
   TimetablePage.jsx — Complete Shanti Gurukul School Timetable System
   Features:
     - 10:00 AM to 5:00 PM standard timings (9 periods + 2 recesses)
     - Classes 5th to 10th (5A, 6A, 7A, 8A, 9A, 10A)
     - Classes 5-8: Mathematics; Classes 9-10: Algebra & Geometry
     - Physical Education preferred in Period 9 (no teacher clashes)
     - Strict multi-class conflict prevention across all teachers
     - Admin Management: Class-wise, Teacher-wise, Subject-wise, Generator, Conflicts & Publication
     - Authenticated Teacher Dashboard: Personal today's & weekly schedule with free periods & workload
   ============================================================ */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';

/* ── Toast Hook ── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, show };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SUBJECT_COLORS = {
  English: '#3b82f6',
  Marathi: '#8b5cf6',
  Hindi: '#ec4899',
  Mathematics: '#f59e0b',
  Algebra: '#f59e0b',
  Geometry: '#d97706',
  Science: '#10b981',
  History: '#ef4444',
  Geography: '#06b6d4',
  'Physical Education': '#84cc16',
  'Self-Study': '#64748b',
  Library: '#0ea5e9'
};

const ALL_CLASSES = [
  { class: '5', section: 'A', label: 'Class 5-A', room: 'Room 101' },
  { class: '6', section: 'A', label: 'Class 6-A', room: 'Room 102' },
  { class: '7', section: 'A', label: 'Class 7-A', room: 'Room 103' },
  { class: '8', section: 'A', label: 'Class 8-A', room: 'Room 104' },
  { class: '9', section: 'A', label: 'Class 9-A', room: 'Room 201' },
  { class: '10', section: 'A', label: 'Class 10-A', room: 'Room 202' },
];

export default function TimetablePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toasts, show: toast } = useToast();

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin' || user?.role === 'principal';

  // Navigation tabs for Admin: 'class' | 'teacher' | 'subject' | 'generate' | 'timings'
  const [activeTab, setActiveTab] = useState(isTeacher ? 'my-schedule' : 'class');

  // Shared state
  const [isLoading, setIsLoading] = useState(true);
  const [timetableConfig, setTimetableConfig] = useState(null);
  const [publishedData, setPublishedData] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [teacherPersonalData, setTeacherPersonalData] = useState(null);

  // Admin filter controls
  const [selectedClassKey, setSelectedClassKey] = useState('10_A');
  const [selectedTeacherId, setSelectedTeacherId] = useState('ST-001');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');

  // Edit Period Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSlotData, setEditSlotData] = useState(null);
  const [modalSubject, setModalSubject] = useState('');
  const [modalTeacherId, setModalTeacherId] = useState('');
  const [modalRoom, setModalRoom] = useState('');
  const [isUpdatingSlot, setIsUpdatingSlot] = useState(false);
  const [clashError, setClashError] = useState('');

  // Generation & Conflict state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // ──────────────────────────────────────────────────────────
  // Data Fetching
  // ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isTeacher) {
        // Teacher view: fetch personal schedule
        const res = await api.get('/timetable/my-schedule');
        setTeacherPersonalData(res.data);
      } else {
        // Admin view: fetch config, published timetable, draft, and staff
        const [cfgRes, pubRes, draftRes, staffRes] = await Promise.all([
          api.get('/timetable/config'),
          api.get('/timetable/published'),
          api.get('/timetable/draft').catch(() => ({ data: null })),
          api.get('/staff')
        ]);
        setTimetableConfig(cfgRes.data);
        setPublishedData(pubRes.data);
        setDraftData(draftRes.data?.status === 'draft' ? draftRes.data : null);
        setStaffList(staffRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load timetable data:', err);
      toast('Failed to load timetable data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isTeacher, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current working timetable dataset (Draft takes precedence for admin edits)
  const currentTimetable = useMemo(() => {
    if (draftData && draftData.classes) return draftData;
    return publishedData || { classes: {} };
  }, [draftData, publishedData]);

  // List of teachers for dropdowns
  const teachers = useMemo(() => {
    return staffList.filter(s => s.role === 'teacher');
  }, [staffList]);

  // Available subjects for the currently selected class
  const classSubjects = useMemo(() => {
    const classNum = parseInt(selectedClassKey.split('_')[0] || '10');
    if (classNum >= 9) {
      return ['Marathi', 'English', 'Hindi', 'Algebra', 'Geometry', 'Science', 'History', 'Geography', 'Physical Education', 'Self-Study'];
    }
    return ['Marathi', 'English', 'Hindi', 'Mathematics', 'Science', 'History', 'Geography', 'Physical Education', 'Self-Study'];
  }, [selectedClassKey]);

  // ──────────────────────────────────────────────────────────
  // Handlers: Generate, Publish, Edit Slot
  // ──────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/timetable/generate');
      setDraftData(res.data.draft);
      toast('Conflict-free timetable generated successfully! Review below.', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await api.post('/timetable/publish');
      setPublishedData(res.data.published);
      setDraftData(null);
      toast('Timetable published live to all teachers and classes!', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Publication failed due to conflicts', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const openEditModal = (day, slot) => {
    if (slot.isBreak) return;
    setClashError('');
    setEditSlotData({ day, slot });
    setModalSubject(slot.subject || '');
    setModalTeacherId(slot.teacherId || '');
    setModalRoom(slot.room || '');
    setShowEditModal(true);
  };

  const handleSaveSlot = async () => {
    if (!editSlotData) return;
    setIsUpdatingSlot(true);
    setClashError('');
    try {
      const teacherObj = teachers.find(t => t.id === modalTeacherId);
      const res = await api.put('/timetable/draft/entry', {
        classKey: selectedClassKey,
        day: editSlotData.day,
        periodNumber: editSlotData.slot.periodNumber,
        subject: modalSubject,
        teacherId: modalTeacherId,
        teacherName: teacherObj ? teacherObj.name : (modalSubject === 'Self-Study' ? 'Class Mentor / Self-Study' : ''),
        room: modalRoom
      });

      // Update local draft dataset
      await loadData();
      setShowEditModal(false);
      toast(`Updated Period ${editSlotData.slot.periodNumber} successfully`, 'success');
    } catch (err) {
      const errMsg = err.response?.data?.conflicts?.[0]?.message || err.response?.data?.error || 'Update failed';
      setClashError(errMsg);
    } finally {
      setIsUpdatingSlot(false);
    }
  };

  // Helper: subject color
  const getSubjectColor = (subj) => SUBJECT_COLORS[subj] || 'var(--blue-500)';

  // ──────────────────────────────────────────────────────────
  // TEACHER PERSONAL DASHBOARD VIEW
  // ──────────────────────────────────────────────────────────
  if (isTeacher) {
    const tData = teacherPersonalData || {};
    const teacher = tData.teacher || {};
    const stats = tData.stats || {};
    const todaySlots = tData.todaySchedule || [];
    const weeklySlots = tData.weeklySchedule || {};

    return (
      <Layout>
        {/* Toast notifications */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
          ))}
        </div>

        {/* ── Teacher Header Banner ── */}
        <div className="card mb-3" style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.4), rgba(15,23,42,0.6))', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1.4rem', color: 'white',
                boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
              }}>
                T
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                  {teacher.name || 'Teacher Schedule'}
                </h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">ID: {teacher.staffId || 'ST-001'}</span>
                  <span className="badge badge-gold">📚 {teacher.subject || 'Faculty'}</span>
                  {teacher.classTeacherOf && (
                    <span className="badge badge-green">🏫 Class Teacher: Class {teacher.classTeacherOf}</span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    • Official School Timing: 10:00 AM – 5:00 PM
                  </span>
                </div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              🖨️ Print My Timetable
            </button>
          </div>
        </div>

        {/* ── Teacher KPI Stat Cards ── */}
        <div className="grid grid-4 mb-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>📅</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.weeklyPeriods || 0}</div>
              <div className="stat-label">Teaching Periods / Week</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>☕</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: '#10b981' }}>{stats.freePeriods || 0}</div>
              <div className="stat-label">Free Periods / Week</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>🏫</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                {(stats.classesTaught || []).length}
              </div>
              <div className="stat-label">Classes Assigned</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>⏰</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: '#8b5cf6' }}>
                {todaySlots.filter(s => !s.isBreak && !s.isFree).length}
              </div>
              <div className="stat-label">Periods Today ({tData.today})</div>
            </div>
          </div>
        </div>

        {/* ── Today's Schedule Timeline ── */}
        <div className="card mb-3">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🕒</span> Today's Schedule — {tData.today || 'Today'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              10:00 AM to 5:00 PM • Recesses included
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {todaySlots.map((slot, i) => {
              if (slot.isBreak) {
                return (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: 8,
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px dashed rgba(245,158,11,0.3)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>
                      {slot.startTime} – {slot.endTime}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                      {slot.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No teaching assigned</div>
                  </div>
                );
              }

              if (slot.isFree) {
                return (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: 8,
                    background: 'rgba(100,116,139,0.08)',
                    border: '1px dashed rgba(100,116,139,0.3)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Period {slot.periodNumber} • {slot.startTime} – {slot.endTime}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>
                      ☕ Free Period
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Staff Room / Prep</div>
                  </div>
                );
              }

              return (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: 'rgba(30,41,59,0.8)',
                  borderLeft: `4px solid ${getSubjectColor(slot.subject)}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Period {slot.periodNumber}
                    </span>
                    <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                      Class {slot.classKey?.replace('_', '-')}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginTop: 4 }}>
                    {slot.subject}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>⏰ {slot.startTime} – {slot.endTime}</span>
                    <span>📍 {slot.room || 'Room'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Complete Weekly Grid for Logged-In Teacher ── */}
        <div className="card mb-3">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>📅 Full Weekly Timetable</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Monday through Saturday (9 Periods per day)
            </span>
          </div>

          <div className="table-wrap">
            <table className="table" style={{ textAlign: 'center', minWidth: 800 }}>
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Time & Period</th>
                  {DAYS.map(d => (
                    <th key={d} style={{ color: d === tData.today ? 'var(--gold-400)' : 'inherit' }}>
                      {d} {d === tData.today && '• Today'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(weeklySlots.Monday || []).map((_, periodIdx) => {
                  const sampleSlot = (weeklySlots.Monday || [])[periodIdx] || {};
                  if (sampleSlot.isBreak) {
                    return (
                      <tr key={periodIdx} style={{ background: 'rgba(245,158,11,0.06)' }}>
                        <td style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.8rem' }}>
                          {sampleSlot.startTime} – {sampleSlot.endTime}
                        </td>
                        <td colSpan={6} style={{ fontWeight: 700, color: '#f59e0b', letterSpacing: 1 }}>
                          {sampleSlot.label}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={periodIdx}>
                      <td style={{ textAlign: 'left', fontSize: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          Period {sampleSlot.periodNumber}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          {sampleSlot.startTime} – {sampleSlot.endTime}
                        </div>
                      </td>
                      {DAYS.map(day => {
                        const slot = (weeklySlots[day] || [])[periodIdx];
                        if (!slot || slot.isFree) {
                          return (
                            <td key={day} style={{ background: 'rgba(0,0,0,0.1)' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                — Free —
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={day} style={{
                            background: `${getSubjectColor(slot.subject)}15`,
                            borderLeft: `3px solid ${getSubjectColor(slot.subject)}`
                          }}>
                            <div style={{ fontWeight: 700, color: getSubjectColor(slot.subject), fontSize: '0.85rem' }}>
                              {slot.subject}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              Class {slot.classKey?.replace('_', '-')}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {slot.room}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }

  // ──────────────────────────────────────────────────────────
  // ADMINISTRATOR / PRINCIPAL MANAGEMENT VIEW
  // ──────────────────────────────────────────────────────────
  const isDraftMode = Boolean(draftData);
  const validationReport = currentTimetable.validation || { valid: true, conflictCount: 0, conflicts: [], warnings: [] };
  const currentClassSchedule = currentTimetable.classes?.[selectedClassKey] || {};
  const periodsList = timetableConfig?.periods || [];

  return (
    <Layout>
      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>

      {/* ── Page Header & Publication Status ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📅</span> Timetable & Subject Scheduling Management
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Classes 5th to 10th • 10:00 AM – 5:00 PM • Automatic Conflict-Free Generator
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Status Badge */}
          {isDraftMode ? (
            <span className="badge badge-gold" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚠️</span> Draft Mode (Unpublished Edits)
            </span>
          ) : (
            <span className="badge badge-green" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🟢</span> Published Live (v{publishedData?.version || 1})
            </span>
          )}

          {/* Conflict indicator */}
          {validationReport.valid ? (
            <span className="badge badge-blue" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
              ✓ 0 Clashes
            </span>
          ) : (
            <span className="badge badge-red" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
              🚨 {validationReport.conflictCount} Clash(es)
            </span>
          )}

          {isDraftMode && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePublish}
              disabled={isPublishing || !validationReport.valid}
            >
              {isPublishing ? 'Publishing...' : '🚀 Publish Timetable'}
            </button>
          )}

          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            🖨️ Print
          </button>
        </div>
      </div>

      {/* ── Tab Navigation Bar ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10, flexWrap: 'wrap' }}>
        {[
          { id: 'class', label: '🏫 Class-wise Timetable' },
          { id: 'teacher', label: '👩‍🏫 Teacher-wise Timetable' },
          { id: 'subject', label: '📚 Subject Matrix' },
          { id: 'generate', label: '⚡ Generator & Conflicts' },
          { id: 'timings', label: '⚙️ School Hours & Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ fontWeight: 600 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: CLASS-WISE TIMETABLE
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'class' && (
        <div>
          {/* Class Selector Bar */}
          <div className="card mb-3" style={{ padding: '12px 18px', background: 'rgba(30,41,59,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Class:</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ALL_CLASSES.map(c => {
                    const key = `${c.class}_${c.section}`;
                    const isSelected = selectedClassKey === key;
                    return (
                      <button
                        key={key}
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setSelectedClassKey(key)}
                        style={{ padding: '6px 14px' }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Day Filter:</span>
                <select
                  className="form-control"
                  style={{ width: 130, padding: '4px 8px', fontSize: '0.85rem' }}
                  value={selectedDayFilter}
                  onChange={e => setSelectedDayFilter(e.target.value)}
                >
                  <option value="all">All Days (Grid)</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Class Timetable Grid */}
          <div className="card mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  Weekly Schedule — Class {selectedClassKey.replace('_', '-')}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Room: {ALL_CLASSES.find(c => `${c.class}_${c.section}` === selectedClassKey)?.room} • Click any period to edit
                </div>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                {parseInt(selectedClassKey) >= 9 ? 'Senior Wing (Algebra + Geometry)' : 'Junior Wing (Mathematics)'}
              </span>
            </div>

            <div className="table-wrap">
              <table className="table" style={{ textAlign: 'center', minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={{ width: 140 }}>Period & Timing</th>
                    {(selectedDayFilter === 'all' ? DAYS : [selectedDayFilter]).map(d => (
                      <th key={d}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periodsList.map((p, periodIdx) => {
                    if (p.isBreak) {
                      return (
                        <tr key={periodIdx} style={{ background: 'rgba(245,158,11,0.07)' }}>
                          <td style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.8rem' }}>
                            {p.startTime} – {p.endTime}
                          </td>
                          <td
                            colSpan={selectedDayFilter === 'all' ? DAYS.length : 1}
                            style={{ fontWeight: 700, color: '#f59e0b', letterSpacing: 1 }}
                          >
                            {p.label}
                          </td>
                        </tr>
                      );
                    }

                    const daysToRender = selectedDayFilter === 'all' ? DAYS : [selectedDayFilter];

                    return (
                      <tr key={periodIdx}>
                        <td style={{ textAlign: 'left', fontSize: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {p.label}
                          </div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            {p.startTime} – {p.endTime}
                          </div>
                        </td>

                        {daysToRender.map(day => {
                          const slot = (currentClassSchedule[day] || []).find(s => s.periodNumber === p.periodNumber) || {
                            periodNumber: p.periodNumber,
                            subject: 'Self-Study',
                            teacherName: 'Class Mentor / Self-Study',
                            room: 'Room'
                          };

                          const color = getSubjectColor(slot.subject);

                          return (
                            <td
                              key={day}
                              onClick={() => openEditModal(day, slot)}
                              style={{
                                cursor: 'pointer',
                                background: `${color}15`,
                                borderLeft: `3px solid ${color}`,
                                transition: 'all 0.15s ease',
                                position: 'relative'
                              }}
                              title="Click to edit subject or teacher"
                            >
                              <div style={{ fontWeight: 700, color, fontSize: '0.85rem' }}>
                                {slot.subject}
                              </div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                                {slot.teacherName || '—'}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {slot.room}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: TEACHER-WISE TIMETABLE
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'teacher' && (
        <div>
          {/* Teacher Selector Bar */}
          <div className="card mb-3" style={{ padding: '12px 18px', background: 'rgba(30,41,59,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Teacher:</span>
              <select
                className="form-control"
                style={{ width: 260, fontSize: '0.9rem' }}
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject || 'Faculty'}) {t.classTeacherOf ? `• CT ${t.classTeacherOf}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Teacher Details & Workload */}
          {(() => {
            const currentTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];
            // Compute teacher's schedule across all classes in currentTimetable
            const teacherGrid = {};
            DAYS.forEach(d => { teacherGrid[d] = []; });
            let teachingCount = 0;
            let freeCount = 0;
            const assignedClassesSet = new Set();

            periodsList.forEach(p => {
              DAYS.forEach(d => {
                if (p.isBreak) {
                  teacherGrid[d].push({ ...p, isBreak: true });
                  return;
                }
                let found = null;
                Object.entries(currentTimetable.classes || {}).forEach(([cKey, dayMap]) => {
                  const s = (dayMap[d] || []).find(x => x.periodNumber === p.periodNumber);
                  if (s && s.teacherId === selectedTeacherId) {
                    found = { ...s, classKey: cKey };
                  }
                });
                if (found) {
                  teacherGrid[d].push(found);
                  teachingCount++;
                  assignedClassesSet.add(found.classKey.replace('_', '-'));
                } else {
                  teacherGrid[d].push({ ...p, isFree: true, subject: 'Free Period', room: 'Staff Room' });
                  freeCount++;
                }
              });
            });

            return (
              <div>
                {/* Stats cards for teacher */}
                <div className="grid grid-4 mb-3">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>📅</div>
                    <div className="stat-info">
                      <div className="stat-value" style={{ color: '#3b82f6' }}>{teachingCount}</div>
                      <div className="stat-label">Weekly Periods</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>☕</div>
                    <div className="stat-info">
                      <div className="stat-value" style={{ color: '#10b981' }}>{freeCount}</div>
                      <div className="stat-label">Free Periods</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>🏫</div>
                    <div className="stat-info">
                      <div className="stat-value" style={{ color: '#f59e0b' }}>{assignedClassesSet.size}</div>
                      <div className="stat-label">Classes Handled</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>🎓</div>
                    <div className="stat-info">
                      <div className="stat-value" style={{ color: '#8b5cf6', fontSize: '1.1rem' }}>
                        {currentTeacher?.classTeacherOf ? `Class ${currentTeacher.classTeacherOf}` : 'Subject Only'}
                      </div>
                      <div className="stat-label">Class Teacher Role</div>
                    </div>
                  </div>
                </div>

                {/* Teacher Timetable Grid */}
                <div className="card mb-3">
                  <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>
                    Schedule for {currentTeacher?.name} ({currentTeacher?.subject})
                  </h3>

                  <div className="table-wrap">
                    <table className="table" style={{ textAlign: 'center', minWidth: 850 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 140 }}>Period & Time</th>
                          {DAYS.map(d => <th key={d}>{d}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {periodsList.map((p, pIdx) => {
                          if (p.isBreak) {
                            return (
                              <tr key={pIdx} style={{ background: 'rgba(245,158,11,0.06)' }}>
                                <td style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.8rem' }}>
                                  {p.startTime} – {p.endTime}
                                </td>
                                <td colSpan={6} style={{ fontWeight: 700, color: '#f59e0b', letterSpacing: 1 }}>
                                  {p.label}
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={pIdx}>
                              <td style={{ textAlign: 'left', fontSize: '0.75rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.label}</div>
                                <div style={{ color: 'var(--text-muted)' }}>{p.startTime} – {p.endTime}</div>
                              </td>

                              {DAYS.map(d => {
                                const slot = (teacherGrid[d] || [])[pIdx];
                                if (!slot || slot.isFree) {
                                  return (
                                    <td key={d} style={{ background: 'rgba(0,0,0,0.1)' }}>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                        — Free —
                                      </span>
                                    </td>
                                  );
                                }
                                return (
                                  <td key={d} style={{
                                    background: `${getSubjectColor(slot.subject)}15`,
                                    borderLeft: `3px solid ${getSubjectColor(slot.subject)}`
                                  }}>
                                    <div style={{ fontWeight: 700, color: getSubjectColor(slot.subject), fontSize: '0.85rem' }}>
                                      {slot.subject}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                      Class {slot.classKey?.replace('_', '-')}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                      {slot.room}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: SUBJECT MATRIX VIEW
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'subject' && (
        <div>
          <div className="card mb-3" style={{ padding: '12px 18px', background: 'rgba(30,41,59,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Subject:</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.keys(SUBJECT_COLORS).filter(s => s !== 'Library' && s !== 'PE').map(s => (
                  <button
                    key={s}
                    className={`btn btn-sm ${selectedSubject === s ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedSubject(s)}
                    style={{
                      borderLeft: `3px solid ${SUBJECT_COLORS[s]}`,
                      padding: '4px 10px', fontSize: '0.8rem'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📚</span> Distribution for {selectedSubject}
            </h3>

            <div className="table-wrap">
              <table className="table" style={{ textAlign: 'center', minWidth: 800 }}>
                <thead>
                  <tr>
                    <th style={{ width: 140 }}>Class</th>
                    {DAYS.map(d => <th key={d}>{d}</th>)}
                    <th style={{ width: 100 }}>Total / Wk</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_CLASSES.map(c => {
                    const classKey = `${c.class}_${c.section}`;
                    const sched = currentTimetable.classes?.[classKey] || {};
                    let totalCount = 0;

                    return (
                      <tr key={classKey}>
                        <td style={{ textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {c.label}
                        </td>
                        {DAYS.map(d => {
                          const periodsWithSubj = (sched[d] || []).filter(s => s.subject === selectedSubject);
                          totalCount += periodsWithSubj.length;

                          if (periodsWithSubj.length === 0) {
                            return (
                              <td key={d} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                —
                              </td>
                            );
                          }

                          return (
                            <td key={d} style={{ background: `${getSubjectColor(selectedSubject)}15` }}>
                              {periodsWithSubj.map(p => (
                                <div key={p.periodNumber} style={{ fontSize: '0.75rem', fontWeight: 600, color: getSubjectColor(selectedSubject) }}>
                                  Period {p.periodNumber}
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{p.startTime}</div>
                                </div>
                              ))}
                            </td>
                          );
                        })}
                        <td style={{ fontWeight: 800, color: 'var(--gold-400)' }}>
                          {totalCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 4: GENERATOR & CONFLICTS
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'generate' && (
        <div>
          {/* Action Card */}
          <div className="card mb-3" style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.25), rgba(15,23,42,0.4))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  Constraint-Based Timetable Generator
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Generates an optimal, clash-free schedule for all 6 classes simultaneously across 10:00 AM – 5:00 PM.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {isGenerating ? '⚡ Running Solver...' : '⚡ Generate Full Timetable'}
                </button>
                {isDraftMode && (
                  <button
                    className="btn btn-secondary"
                    onClick={handlePublish}
                    disabled={isPublishing || !validationReport.valid}
                  >
                    {isPublishing ? 'Publishing...' : '🚀 Publish Draft Live'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Conflict Auditor Summary Card */}
          <div className="card mb-3">
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛡️</span> Timetable Conflict & Validation Audit
            </h3>

            {validationReport.valid ? (
              <div style={{
                padding: '16px 20px', borderRadius: 8,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', gap: 14
              }}>
                <div style={{ fontSize: '2rem' }}>✅</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>
                    Zero Scheduling Clashes Detected
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Every teacher is assigned to at most one class at any given minute. All recesses are strictly respected. Physical Education is distributed without overlaps.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  padding: '16px 20px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14
                }}>
                  <div style={{ fontSize: '2rem' }}>🚨</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '1rem' }}>
                      {validationReport.conflictCount} Scheduling Conflict(s) Require Resolution
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      The timetable cannot be published until all teacher and class double-bookings are resolved.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {validationReport.conflicts.map((conf, idx) => (
                    <div key={idx} style={{
                      padding: '12px 16px', borderRadius: 6,
                      background: 'rgba(30,41,59,0.6)', borderLeft: '4px solid #ef4444'
                    }}>
                      <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.9rem' }}>
                        {conf.type} • {conf.day} ({conf.time})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 2 }}>
                        {conf.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Physical Education Period 9 Report */}
          <div className="card mb-3">
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏃‍♂️</span> Physical Education Period 9 Distribution Report
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              Period 9 (4:10 PM – 5:00 PM) is preferred for PE. Since Mr. Vikram Shinde is the designated PE teacher, each class receives Period 9 on a distinct day to avoid simultaneous clashes:
            </p>

            <div className="grid grid-3" style={{ gap: 12 }}>
              {DAYS.map(day => {
                let peClass = null;
                Object.entries(currentTimetable.classes || {}).forEach(([cKey, sched]) => {
                  const p9 = (sched[day] || []).find(s => s.periodNumber === 9);
                  if (p9 && p9.subject === 'Physical Education') peClass = cKey;
                });

                return (
                  <div key={day} style={{
                    padding: '12px 14px', borderRadius: 8,
                    background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: '0.85rem' }}>{day}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                      {peClass ? `Class ${peClass.replace('_', '-')}` : 'Self-Study / Revision'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Coach: {peClass ? 'Mr. Vikram Shinde' : 'Class Mentor'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 5: SCHOOL HOURS & SETTINGS
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'timings' && (
        <div>
          <div className="card mb-3">
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⏰</span> Official Daily Schedule (10:00 AM – 5:00 PM)
            </h3>

            <div className="table-wrap">
              <table className="table" style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Type</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {periodsList.map((p, idx) => (
                    <tr key={idx} style={{ background: p.isBreak ? 'rgba(245,158,11,0.06)' : 'transparent' }}>
                      <td style={{ fontWeight: 700, color: p.isBreak ? '#f59e0b' : 'var(--text-primary)' }}>
                        {p.label}
                      </td>
                      <td>
                        <span className={`badge ${p.isBreak ? 'badge-gold' : 'badge-blue'}`}>
                          {p.isBreak ? 'Recess / Break' : 'Teaching Period'}
                        </span>
                      </td>
                      <td>{p.startTime}</td>
                      <td>{p.endTime}</td>
                      <td>{p.duration} mins</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.periodNumber === 9 ? '🏃 Preferred for Physical Education' : (p.isBreak ? 'No teaching allowed' : 'Regular academic')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Class Teachers & Room Summary */}
          <div className="card mb-3">
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏫</span> Class Teachers & Classroom Allocations
            </h3>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Class Teacher</th>
                    <th>Assigned Room</th>
                    <th>Wing / Curriculum</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_CLASSES.map(c => {
                    const ct = timetableConfig?.classTeachers?.[`${c.class}_${c.section}`];
                    return (
                      <tr key={c.label}>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Class {c.class}</td>
                        <td>{c.section}</td>
                        <td style={{ fontWeight: 600, color: 'var(--gold-400)' }}>
                          {ct?.teacherName || '—'}
                        </td>
                        <td>{c.room}</td>
                        <td>
                          <span className={`badge ${parseInt(c.class) >= 9 ? 'badge-purple' : 'badge-blue'}`}>
                            {parseInt(c.class) >= 9 ? 'Senior Wing (Algebra + Geometry)' : 'Junior Wing (Mathematics)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          EDIT PERIOD MODAL (with Real-Time Clash Prevention)
          ══════════════════════════════════════════════════════════ */}
      {showEditModal && editSlotData && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>
                Edit Period {editSlotData.slot.periodNumber} — {editSlotData.day}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Class {selectedClassKey.replace('_', '-')} • {editSlotData.slot.startTime} – {editSlotData.slot.endTime}
              </div>

              {clashError && (
                <div style={{
                  padding: '10px 14px', borderRadius: 6,
                  background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
                  color: '#fca5a5', fontSize: '0.85rem'
                }}>
                  ⚠️ {clashError}
                </div>
              )}

              <div>
                <label className="form-label">Subject *</label>
                <select
                  className="form-control"
                  value={modalSubject}
                  onChange={e => {
                    const newSubj = e.target.value;
                    setModalSubject(newSubj);
                    // Automatically auto-suggest eligible teacher
                    const defaultTeacher = timetableConfig?.subjectTeachers?.[newSubj];
                    if (defaultTeacher) {
                      setModalTeacherId(defaultTeacher.teacherId);
                    }
                  }}
                >
                  {classSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Teacher *</label>
                <select
                  className="form-control"
                  value={modalTeacherId}
                  onChange={e => setModalTeacherId(e.target.value)}
                >
                  <option value="">— Select Teacher / Self-Study —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject || 'Faculty'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Room</label>
                <input
                  className="form-control"
                  value={modalRoom}
                  onChange={e => setModalRoom(e.target.value)}
                  placeholder="e.g. Room 101 or School Ground"
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveSlot} disabled={isUpdatingSlot}>
                {isUpdatingSlot ? 'Validating...' : 'Save & Validate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
