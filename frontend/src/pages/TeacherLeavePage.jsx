/* ============================================================
   TeacherLeavePage.jsx — Full React port of teacher-leave.html + teacher-leave.js
   Features: Leave Applications, Quotas (CL, ML, OD, Special),
             Approval Workflow (Principal/Admin), Period Substitutions (1-7),
             Calendar & Leave History
   ============================================================ */
import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';

const LEAVE_TYPES = [
  { key: 'Casual',  labelKey: 'casualLeave', defaultLabel: 'Casual Leave (CL)', quota: 12, color: '#3b82f6', icon: '🏖️' },
  { key: 'Medical', labelKey: 'medicalLeave', defaultLabel: 'Medical Leave (ML)', quota: 10, color: '#ef4444', icon: '🩺' },
  { key: 'Duty',    labelKey: 'dutyLeave',    defaultLabel: 'On-Duty Leave (OD)', quota: 15, color: '#10b981', icon: '📝' },
  { key: 'Special', labelKey: 'emergencyLeave', defaultLabel: 'Emergency Leave',  quota: 5,  color: '#8b5cf6', icon: '🚨' },
];

const PERIODS = [
  { idx: 1, label: 'Period 1', time: '10:00 – 10:40 AM' },
  { idx: 2, label: 'Period 2', time: '10:40 – 11:20 AM' },
  { idx: 3, label: 'Period 3', time: '11:35 AM – 12:15 PM' },
  { idx: 4, label: 'Period 4', time: '12:15 – 12:55 PM' },
  { idx: 5, label: 'Period 5', time: '01:30 – 02:10 PM' },
  { idx: 6, label: 'Period 6', time: '02:10 – 02:50 PM' },
  { idx: 7, label: 'Period 7', time: '02:50 – 03:30 PM' },
  { idx: 8, label: 'Period 8', time: '03:40 – 04:20 PM' },
  { idx: 9, label: 'Period 9', time: '04:20 – 05:00 PM' },
];

const DEFAULT_STAFF = [
  { id: 'ST-001', name: 'Mr. Ramesh Gupta', role: 'teacher', subject: 'Mathematics' },
  { id: 'ST-002', name: 'Mrs. Sunita Deshpande', role: 'teacher', subject: 'Science' },
  { id: 'ST-004', name: 'Mrs. Lata Mehta', role: 'teacher', subject: 'English' },
  { id: 'ST-005', name: 'Mr. Deepak Patil', role: 'teacher', subject: 'History' },
];

export default function TeacherLeavePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdminOrPrincipal = ['admin', 'principal'].includes(user?.role);

  // State
  const [leaves, setLeaves] = useState([]);
  const [staffList, setStaffList] = useState(DEFAULT_STAFF);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'substitutions'
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState(null);

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedLeaveForSub, setSelectedLeaveForSub] = useState(null);
  const [saving, setSaving] = useState(false);

  // Substitution & Schedule Lookup state
  const [absentScheduleData, setAbsentScheduleData] = useState(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState(null);

  // Apply Form
  const [form, setForm] = useState({
    staffId: '',
    leaveType: 'Casual',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    isHalfDay: false,
    reason: '',
    emergencyContact: ''
  });

  // Substitution state
  const [subForm, setSubForm] = useState({
    period: 'Period 1',
    substituteStaffId: '',
    instructions: 'Supervise self-study & class revision'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leaveRes, staffRes] = await Promise.all([
        api.get('/teacher-leave'),
        api.get('/staff').catch(() => ({ data: DEFAULT_STAFF }))
      ]);
      setLeaves(leaveRes.data || []);
      const teachers = Array.isArray(staffRes?.data) && staffRes.data.length > 0
        ? staffRes.data
        : DEFAULT_STAFF;
      setStaffList(teachers);
    } catch {
      showToast('Could not load leave records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats
  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const onLeaveToday = leaves.filter(l => l.status === 'Approved' && l.startDate <= todayStr && l.endDate >= todayStr).length;

    return { total, pending, approved, onLeaveToday };
  }, [leaves]);

  // Filtered
  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      if (statusFilter === 'all') return true;
      return l.status === statusFilter;
    });
  }, [leaves, statusFilter]);

  // Substitutions count
  const totalSubCount = useMemo(() => {
    return leaves.reduce((sum, l) => sum + (l.substitutes ? Object.keys(l.substitutes).length : 0), 0);
  }, [leaves]);

  // Open apply modal
  const openApply = () => {
    const pool = staffList.length > 0 ? staffList : DEFAULT_STAFF;
    setForm({
      staffId: pool[0]?.id || '',
      leaveType: 'Casual',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      isHalfDay: false,
      reason: '',
      emergencyContact: ''
    });
    setShowApplyModal(true);
  };

  // Submit leave
  const handleApply = async (e) => {
    e.preventDefault();
    setSaving(true);
    const pool = staffList.length > 0 ? staffList : DEFAULT_STAFF;
    const staff = pool.find(s => s.id === form.staffId);
    const payload = {
      ...form,
      staffName: staff?.name || 'Staff Member',
      status: 'Pending',
      substitutes: {}
    };

    try {
      const res = await api.post('/teacher-leave', payload);
      setLeaves([res.data, ...leaves]);
      setShowApplyModal(false);
      showToast('Leave application submitted for approval!');
    } catch {
      showToast('Failed to submit leave application.');
    } finally {
      setSaving(false);
    }
  };

  // Approve / Reject
  const handleStatusChange = async (id, newStatus) => {
    const item = leaves.find(l => l.id === id);
    if (!item) return;

    try {
      const res = await api.put(`/teacher-leave/${id}`, {
        ...item,
        status: newStatus,
        actionDate: new Date().toISOString()
      });
      setLeaves(leaves.map(l => l.id === id ? res.data : l));
      showToast(`Leave application marked as ${newStatus}!`);
    } catch {
      showToast('Failed to update leave status.');
    }
  };

  // Open substitution modal with smart schedule lookup
  const openSubAssign = async (leave) => {
    setSelectedLeaveForSub(leave);
    setShowSubModal(true);
    setLoadingLookup(true);
    setAbsentScheduleData(null);
    setSelectedPeriodNumber(null);

    try {
      const res = await api.get(`/teacher-leave/lookup-schedule?staffId=${leave.staffId || leave.staffName}&date=${leave.startDate}`);
      setAbsentScheduleData(res.data);
      if (res.data.periods && res.data.periods.length > 0) {
        const firstP = res.data.periods[0];
        setSelectedPeriodNumber(firstP.periodNumber);
        setSubForm({
          period: `Period ${firstP.periodNumber}`,
          substituteStaffId: firstP.freeTeachers[0]?.id || '',
          instructions: `Supervise Class ${firstP.classLabel} ${firstP.subject} revision & classwork`
        });
      } else {
        setSubForm({
          period: 'Period 1',
          substituteStaffId: '',
          instructions: 'Supervise self-study & reading exercises'
        });
      }
    } catch (err) {
      console.error('Failed to lookup absent teacher schedule:', err);
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleSelectPeriod = (periodItem) => {
    setSelectedPeriodNumber(periodItem.periodNumber);
    setSubForm({
      period: `Period ${periodItem.periodNumber}`,
      substituteStaffId: periodItem.freeTeachers[0]?.id || '',
      instructions: `Supervise ${periodItem.classLabel} ${periodItem.subject} classwork & reading`
    });
  };

  // Save Substitution
  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (!selectedLeaveForSub) return;
    const pool = (staffList && staffList.length > 0) ? staffList : DEFAULT_STAFF;
    const subStaff = pool.find(s => s.id === subForm.substituteStaffId);
    if (!subStaff) {
      showToast('Please select an available substitute teacher.');
      return;
    }

    const currentPeriodInfo = (absentScheduleData?.periods || []).find(p => p.periodNumber === selectedPeriodNumber);

    const updatedSubs = {
      ...(selectedLeaveForSub.substitutes || {}),
      [subForm.period]: {
        periodNumber: selectedPeriodNumber,
        periodTime: currentPeriodInfo ? `${currentPeriodInfo.startTime} – ${currentPeriodInfo.endTime}` : '',
        classLabel: currentPeriodInfo?.classLabel || '',
        subject: currentPeriodInfo?.subject || '',
        room: currentPeriodInfo?.room || '',
        substituteStaffId: subStaff.id,
        substituteStaffName: subStaff.name,
        instructions: subForm.instructions
      }
    };

    try {
      const res = await api.put(`/teacher-leave/${selectedLeaveForSub.id}`, {
        ...selectedLeaveForSub,
        substitutes: updatedSubs
      });
      setLeaves(leaves.map(l => l.id === selectedLeaveForSub.id ? res.data : l));
      setShowSubModal(false);
      showToast(`Period ${selectedPeriodNumber || subForm.period} substitution assigned to ${subStaff.name}!`);
    } catch {
      showToast('Failed to save period substitution.');
    }
  };

  return (
    <Layout pageTitle={`🏖️ ${t('leaveManager')}`}>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--gold-500)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>🏖️</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            🏖️ {t('leaveManager')}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            {t('leaveSubtitle') || 'Leave Applications • Principal Approvals • Conflict-Free Period 1-9 Classroom Substitutions'}
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={openApply}>
          {t('applyForLeave')}
        </button>
      </div>

      {/* Leave Quota Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14, marginBottom: 24
      }}>
        {LEAVE_TYPES.map(qt => (
          <div key={qt.key} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              fontSize: '1.8rem', background: `${qt.color}15`, width: 48, height: 48,
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${qt.color}35`
            }}>
              {qt.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t(qt.labelKey) || qt.defaultLabel}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                {qt.quota} {t('days')} <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{t('perYear')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stat Bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14, marginBottom: 20
      }}>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">{t('totalApplications')}</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-info">
            <div className="stat-value" style={{ color: stats.pending > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
              {stats.pending}
            </div>
            <div className="stat-label">{t('pendingApproval')}</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.approved}</div>
            <div className="stat-label">{t('approvedLeaves')}</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.onLeaveToday}</div>
            <div className="stat-label">{t('onLeaveToday')}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 10, borderBottom: '1px solid var(--border)',
        marginBottom: 20, paddingBottom: 2
      }}>
        <button
          className={`tab-btn${activeTab === 'applications' ? ' active' : ''}`}
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'applications' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'applications' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem'
          }}
        >
          📋 {t('applicationsTab')} ({leaves.length})
        </button>
        <button
          className={`tab-btn${activeTab === 'substitutions' ? ' active' : ''}`}
          onClick={() => setActiveTab('substitutions')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'substitutions' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'substitutions' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem'
          }}
        >
          🔄 {t('substitutionsTab')} ({totalSubCount})
        </button>
      </div>

      {/* Tab 1: Applications */}
      {activeTab === 'applications' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span className="card-title">{t('leaveTableTitle')}</span>
            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ maxWidth: 180 }}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Approvals</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading leave requests...</div>
            ) : filteredLeaves.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No leave records match filter.</div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>{t('staffName')}</th>
                      <th>{t('leaveType')}</th>
                      <th>{t('fromDate')}</th>
                      <th>{t('toDate')}</th>
                      <th>{t('reason')}</th>
                      <th>{t('status')}</th>
                      <th style={{ textAlign: 'right', paddingRight: 16 }}>{t('actionsSub')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.map(item => {
                      const isPending = item.status === 'Pending';
                      const isApproved = item.status === 'Approved';

                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.staffName}
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.id}</div>
                            {item.substitutes && Object.keys(item.substitutes).length > 0 && (
                              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {Object.entries(item.substitutes).map(([p, det]) => {
                                  const isObj = typeof det === 'object' && det !== null;
                                  const subName = isObj ? det.substituteStaffName : String(det).split(' (')[0];
                                  const subClass = isObj && det.classLabel ? ` [${det.classLabel}]` : '';
                                  return (
                                    <span key={p} style={{
                                      fontSize: '0.72rem',
                                      background: 'rgba(59, 130, 246, 0.15)',
                                      border: '1px solid rgba(59, 130, 246, 0.3)',
                                      color: '#60a5fa',
                                      padding: '2px 8px',
                                      borderRadius: 6,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}>
                                      🔄 <strong>{p}:</strong> {subName}{subClass}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-blue">{item.leaveType}</span>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{item.startDate}</td>
                          <td style={{ fontSize: '0.85rem' }}>{item.endDate}</td>
                          <td style={{ fontSize: '0.85rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.reason}
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 8px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 800,
                              background: isApproved ? 'rgba(16,185,129,0.15)' : (isPending ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'),
                              color: isApproved ? '#10b981' : (isPending ? '#f59e0b' : '#ef4444')
                            }}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: 16 }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              {isAdminOrPrincipal && isPending && (
                                <>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981' }}
                                    onClick={() => handleStatusChange(item.id, 'Approved')}
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                    onClick={() => handleStatusChange(item.id, 'Rejected')}
                                  >
                                    ✕ Reject
                                  </button>
                                </>
                              )}
                              {isApproved && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                  onClick={() => openSubAssign(item)}
                                >
                                  + Assign Sub
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Substitutions Roster */}
      {activeTab === 'substitutions' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔄 Active Daily Period Substitutions</span>
          </div>
          <div className="card-body">
            {leaves.filter(l => l.substitutes && Object.keys(l.substitutes).length > 0).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                No active substitutions currently assigned.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {leaves
                  .filter(l => l.substitutes && Object.keys(l.substitutes).length > 0)
                  .map(l => (
                    <div key={l.id} style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: 16
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div>
                          <strong style={{ color: 'var(--gold-400)' }}>Absent: {l.staffName}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 10 }}>
                            Dates: {l.startDate} to {l.endDate}
                          </span>
                        </div>
                        <span className="badge badge-teal">Approved Leave</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                        {Object.entries(l.substitutes).map(([period, details]) => {
                          const isObj = typeof details === 'object' && details !== null;
                          const subName = isObj ? details.substituteStaffName : String(details).split(' (')[0];
                          const subNote = isObj ? details.instructions : (String(details).includes('(') ? String(details).split('(')[1]?.replace(')', '') : '');
                          const subClass = isObj ? details.classLabel : '';
                          const subSubject = isObj ? details.subject : '';
                          const subTime = isObj ? details.periodTime : '';

                          return (
                            <div key={period} style={{
                              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
                              padding: 12, borderRadius: 8
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                  🕒 {period} {subTime && <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>({subTime})</span>}
                                </div>
                                {subClass && <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{subClass}</span>}
                              </div>
                              <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.85rem', marginTop: 4 }}>
                                👤 Sub: {subName} {subSubject && <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>({subSubject})</span>}
                              </div>
                              {subNote && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                  📝 {subNote}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Apply For Leave */}
      {showApplyModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">🏖️ Submit Teacher Leave Application</h3>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Staff Member *</label>
                  <select
                    className="form-control"
                    value={form.staffId}
                    onChange={e => setForm({ ...form, staffId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Teacher / Staff --</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.subject || s.role})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Leave Type *</label>
                    <select
                      className="form-control"
                      value={form.leaveType}
                      onChange={e => setForm({ ...form, leaveType: e.target.value })}
                    >
                      <option value="Casual">Casual Leave (CL)</option>
                      <option value="Medical">Medical Leave (ML)</option>
                      <option value="Duty">On-Duty Leave (OD)</option>
                      <option value="Special">Special / Emergency</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Phone</label>
                    <input
                      type="tel" className="form-control" placeholder="Mobile during leave"
                      value={form.emergencyContact}
                      onChange={e => setForm({ ...form, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date" className="form-control"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input
                      type="date" className="form-control"
                      value={form.endDate}
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Absence *</label>
                  <textarea
                    rows={3} className="form-control" placeholder="Personal work, doctor appointment, academic training..."
                    value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Period Substitution */}
      {showSubModal && selectedLeaveForSub && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3 className="modal-title">🔄 Assign Period Substitution</h3>
              <button className="modal-close" onClick={() => setShowSubModal(false)}>✕</button>
            </div>
            {loadingLookup ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <span>⏳</span> Inspecting published timetable for absent teacher's periods...
              </div>
            ) : (
              <form onSubmit={handleSaveSub}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ background: 'rgba(30,58,138,0.2)', border: '1px solid rgba(59,130,246,0.3)', padding: 12, borderRadius: 8, fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <div>
                        Absent Teacher: <strong style={{ color: 'var(--gold-400)', fontSize: '0.95rem' }}>{selectedLeaveForSub.staffName}</strong>
                      </div>
                      <span className="badge badge-blue">
                        {absentScheduleData?.day || 'Leave Day'} • {selectedLeaveForSub.startDate}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      Scheduled Teaching Periods: <strong>{absentScheduleData?.scheduledPeriodsCount || 0} periods</strong> on this day
                    </div>
                  </div>

                  {/* Absent Teacher Scheduled Periods */}
                  {absentScheduleData?.periods && absentScheduleData.periods.length > 0 ? (
                    <div>
                      <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                        Select Absent Teacher's Class / Period to Substitute: *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                        {absentScheduleData.periods.map(p => {
                          const isSelected = selectedPeriodNumber === p.periodNumber;
                          const hasExistingSub = selectedLeaveForSub.substitutes && selectedLeaveForSub.substitutes[`Period ${p.periodNumber}`];

                          return (
                            <button
                              key={p.periodNumber}
                              type="button"
                              onClick={() => handleSelectPeriod(p)}
                              style={{
                                textAlign: 'left',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: isSelected ? '2px solid var(--gold-400)' : '1px solid var(--border)',
                                background: isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: isSelected ? 'var(--gold-400)' : 'var(--text-primary)', fontSize: '0.85rem' }}>
                                  Period {p.periodNumber}
                                </strong>
                                {hasExistingSub && (
                                  <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>✓ Subbed</span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                {p.classLabel} • {p.subject}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {p.startTime} – {p.endTime}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                      Teacher has no regular classes scheduled in the timetable on this day. You can select a general period below:
                    </div>
                  )}

                  {/* Current Selected Period Summary Banner */}
                  {(() => {
                    const currentPeriod = (absentScheduleData?.periods || []).find(p => p.periodNumber === selectedPeriodNumber);
                    if (!currentPeriod) return null;
                    return (
                      <div style={{ background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981', padding: '8px 12px', borderRadius: 4, fontSize: '0.8rem' }}>
                        📍 <strong>Period {currentPeriod.periodNumber}</strong> ({currentPeriod.startTime} – {currentPeriod.endTime}) •
                        <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}> {currentPeriod.classLabel}</span> • Subject: <strong>{currentPeriod.subject}</strong> • Room: {currentPeriod.room}
                      </div>
                    );
                  })()}

                  {/* Substitute Teacher Selector (Free vs Busy) */}
                  <div className="form-group">
                    {(() => {
                      const currentPeriod = (absentScheduleData?.periods || []).find(p => p.periodNumber === selectedPeriodNumber);
                      return (
                        <>
                          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Choose Substitute Teacher *</span>
                            {currentPeriod && (
                              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                                🟢 {currentPeriod.freeTeachers?.length || 0} Teachers Free in this Period
                              </span>
                            )}
                          </label>

                          {currentPeriod ? (
                            <select
                              className="form-control"
                              value={subForm.substituteStaffId}
                              onChange={e => setSubForm({ ...subForm, substituteStaffId: e.target.value })}
                              required
                            >
                              <option value="">-- Choose Available Substitute Teacher --</option>
                              <optgroup label="🟢 AVAILABLE & FREE TEACHERS (No Class Clashes)">
                                {currentPeriod.freeTeachers.map(t => (
                                  <option key={t.id} value={t.id}>
                                    🟢 {t.name} ({t.subject || 'Faculty'})
                                  </option>
                                ))}
                              </optgroup>
                              {currentPeriod.busyTeachers?.length > 0 && (
                                <optgroup label="🔴 BUSY IN ANOTHER CLASS (Cannot Substitute)">
                                  {currentPeriod.busyTeachers.map(t => (
                                    <option key={t.id} value={t.id} disabled>
                                      🔴 {t.name} — {t.busyWith}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          ) : (
                            <select
                              className="form-control"
                              value={subForm.substituteStaffId}
                              onChange={e => setSubForm({ ...subForm, substituteStaffId: e.target.value })}
                              required
                            >
                              <option value="">-- Choose Substitute Teacher --</option>
                              {staffList
                                .filter(s => s.id !== selectedLeaveForSub.staffId && s.name !== selectedLeaveForSub.staffName)
                                .map(s => (
                                  <option key={s.id} value={s.id}>
                                    {s.name} ({s.subject && s.subject !== '—' ? s.subject : s.role || 'Teacher'})
                                  </option>
                                ))}
                            </select>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Classwork / Instructions */}
                  <div className="form-group">
                    <label className="form-label">Classwork / Instructions *</label>
                    <input
                      type="text" className="form-control"
                      placeholder="e.g. Conduct chapter 3 reading, class test & revision"
                      value={subForm.instructions}
                      onChange={e => setSubForm({ ...subForm, instructions: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSubModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    Assign Substitute {selectedPeriodNumber ? `for Period ${selectedPeriodNumber}` : ''}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
