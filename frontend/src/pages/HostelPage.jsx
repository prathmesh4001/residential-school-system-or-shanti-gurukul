/* ============================================================
   HostelPage.jsx — Full React port of hostel.html + hostel.js
   Features:
     - 4 Stat Cards: Total Rooms, Occupied Beds, Full Rooms, Available Rooms
     - 4 Tabs:
       1. Room Overview: Floor & status filter, color-coded room cards,
          occupancy progress, room detail modal with resident removals
       2. Allocate Student: Student search, available room selector,
          live residential allocation table with deallocation
       3. Leave Records: Out-passes and leaves tracker, mark returned,
          status badges (Returned, Out, Overdue)
       4. Mess Schedule: Daily meal timings and hostel living guidelines
     - Add Room Modal & Record Leave Modal
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
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  return { toasts, show };
}

export default function HostelPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdminOrWarden = user?.role === 'admin' || user?.role === 'principal' || user?.role === 'warden' || user?.role === 'mentor';
  const { toasts, show: toast } = useToast();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Active Tab: 'rooms' | 'allocate' | 'leaves' | 'mess'
  const [activeTab, setActiveTab] = useState('rooms');

  // Shared Data
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters for Tab 1: Room Overview
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Tab 2: Allocation State
  const [allocSearch, setAllocSearch] = useState('');
  const [selectedStudentForAlloc, setSelectedStudentForAlloc] = useState(null);
  const [selectedRoomForAlloc, setSelectedRoomForAlloc] = useState('');
  const [isAllocating, setIsAllocating] = useState(false);

  // Modals
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomNo, setNewRoomNo] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('1st');
  const [newRoomCap, setNewRoomCap] = useState(4);
  const [newRoomType, setNewRoomType] = useState('boys');
  const [isAddingRoom, setIsAddingRoom] = useState(false);

  const [showRoomDetailModal, setShowRoomDetailModal] = useState(false);
  const [activeDetailRoom, setActiveDetailRoom] = useState(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStudentId, setLeaveStudentId] = useState('');
  const [leaveFrom, setLeaveFrom] = useState(todayStr);
  const [leaveTo, setLeaveTo] = useState(todayStr);
  const [leaveReason, setLeaveReason] = useState('Family Event');
  const [isSavingLeave, setIsSavingLeave] = useState(false);

  // ──────────────────────────────────────────────────────────
  // Fetch Base Data
  // ──────────────────────────────────────────────────────────
  const fetchHostelData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [roomsRes, stuRes, leavesRes] = await Promise.all([
        api.get('/hostel/rooms'),
        api.get('/students'),
        api.get('/hostel/leaves')
      ]);

      setRooms(roomsRes.data || []);
      setStudents(stuRes.data || []);
      setLeaves(leavesRes.data || []);
    } catch (err) {
      console.error(err);
      toast('Failed to load hostel data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHostelData();
  }, [fetchHostelData]);

  // Lookup maps
  const studentMap = useMemo(() => {
    const map = {};
    students.forEach(s => { map[s.id] = s; });
    return map;
  }, [students]);

  const residentialStudents = useMemo(() => {
    return students.filter(s => s.type === 'residential');
  }, [students]);

  // Student to room allocation map
  const studentRoomMap = useMemo(() => {
    const map = {};
    rooms.forEach(r => {
      (r.students || []).forEach(sid => {
        map[sid] = r;
      });
    });
    return map;
  }, [rooms]);

  // ──────────────────────────────────────────────────────────
  // Stat Metrics
  // ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupiedBeds = rooms.reduce((sum, r) => sum + (r.students?.length || 0), 0);
    const fullRooms = rooms.filter(r => (r.students?.length || 0) >= r.capacity).length;
    const availableRooms = rooms.filter(r => (r.students?.length || 0) === 0).length;

    return { totalRooms, occupiedBeds, fullRooms, availableRooms };
  }, [rooms]);

  // ──────────────────────────────────────────────────────────
  // 1. Add Room
  // ──────────────────────────────────────────────────────────
  const handleAddRoom = async (e) => {
    if (e) e.preventDefault();
    if (!newRoomNo.trim()) {
      toast('Please enter a room number', 'warning');
      return;
    }

    setIsAddingRoom(true);
    try {
      await api.post('/hostel/rooms', {
        roomNo: newRoomNo.trim(),
        floor: newRoomFloor,
        capacity: Number(newRoomCap) || 4,
        type: newRoomType,
        students: []
      });

      toast(`✅ Room ${newRoomNo.trim()} added successfully!`);
      setShowAddRoomModal(false);
      setNewRoomNo('');
      fetchHostelData();
    } catch (err) {
      console.error(err);
      toast('Failed to create new room', 'error');
    } finally {
      setIsAddingRoom(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 2. Allocate Student
  // ──────────────────────────────────────────────────────────
  const handleAllocate = async () => {
    if (!selectedStudentForAlloc) {
      toast('Please select a student to allocate', 'warning');
      return;
    }
    if (!selectedRoomForAlloc) {
      toast('Please choose a room with available beds', 'warning');
      return;
    }

    setIsAllocating(true);
    try {
      await api.post(`/hostel/rooms/${selectedRoomForAlloc}/allocate`, {
        studentId: selectedStudentForAlloc.id
      });

      toast(`✅ ${selectedStudentForAlloc.name} allocated to Room ${selectedRoomForAlloc}!`);
      setSelectedStudentForAlloc(null);
      setSelectedRoomForAlloc('');
      setAllocSearch('');
      fetchHostelData();
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.error || 'Allocation failed. Room may be full.', 'error');
    } finally {
      setIsAllocating(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 3. Remove Student from Room
  // ──────────────────────────────────────────────────────────
  const handleDeallocate = async (studentId, roomNo) => {
    if (!confirm('Remove this student from the room?')) return;

    try {
      await api.post(`/hostel/rooms/${roomNo}/deallocate`, { studentId });
      toast('Student removed from room');
      fetchHostelData();
      if (activeDetailRoom && activeDetailRoom.roomNo === roomNo) {
        setActiveDetailRoom(prev => ({
          ...prev,
          students: prev.students.filter(id => id !== studentId)
        }));
      }
    } catch (err) {
      console.error(err);
      toast('Failed to remove student from room', 'error');
    }
  };

  // ──────────────────────────────────────────────────────────
  // 4. Save Leave Record
  // ──────────────────────────────────────────────────────────
  const handleSaveLeave = async (e) => {
    if (e) e.preventDefault();
    if (!leaveStudentId) {
      toast('Please select a residential student', 'warning');
      return;
    }
    if (!leaveFrom || !leaveTo) {
      toast('Please specify leave and return dates', 'warning');
      return;
    }

    setIsSavingLeave(true);
    try {
      await api.post('/hostel/leaves', {
        studentId: leaveStudentId,
        leaveDate: leaveFrom,
        returnDate: leaveTo,
        reason: leaveReason,
        status: 'out'
      });

      toast('✅ Student leave recorded successfully!');
      setShowLeaveModal(false);
      fetchHostelData();
    } catch (err) {
      console.error(err);
      toast('Failed to record student leave', 'error');
    } finally {
      setIsSavingLeave(false);
    }
  };

  // Mark student returned from leave
  const handleMarkReturned = async (leaveId) => {
    try {
      await api.put(`/hostel/leaves/${leaveId}`, { status: 'returned' });
      toast('✅ Marked student as safely returned!');
      fetchHostelData();
    } catch (err) {
      console.error(err);
      toast('Failed to update leave status', 'error');
    }
  };

  // Filtered rooms for Tab 1
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      if (floorFilter !== 'all' && !r.floor.includes(floorFilter)) return false;
      const count = (r.students || []).length;
      const isFull = count >= r.capacity;
      const isAvail = count === 0;

      if (statusFilter === 'full' && !isFull) return false;
      if (statusFilter === 'available' && !isAvail) return false;
      if (statusFilter === 'partial' && (isFull || isAvail)) return false;
      return true;
    });
  }, [rooms, floorFilter, statusFilter]);

  // Search results for Tab 2
  const searchedAllocStudents = useMemo(() => {
    const q = allocSearch.trim().toLowerCase();
    if (!q) return [];
    return (students || []).filter(
      s => s.name?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [students, allocSearch]);

  return (
    <Layout title="Hostel Management" currentModule="hostel">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : '✅'}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      <div className="page-content" style={{ padding: '0' }}>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.8rem' }}>🏠</span> {t('nav_hostel')}
            </div>
            <div className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              {t('hostelSubtitle')}
            </div>
          </div>

          {isAdminOrWarden && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddRoomModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}
            >
              {t('addNewRoom')}
            </button>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: '18px 20px', background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('totalRooms')}</span>
              <span style={{ fontSize: '1.4rem' }}>🏠</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--blue-400)', marginTop: 8 }}>
              {stats.totalRooms}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{t('roomsSub')}</div>
          </div>

          <div className="card" style={{ padding: '18px 20px', background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('occupiedBeds')}</span>
              <span style={{ fontSize: '1.4rem' }}>👥</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--gold-400)', marginTop: 8 }}>
              {stats.occupiedBeds}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{t('residentsSub')}</div>
          </div>

          <div className="card" style={{ padding: '18px 20px', background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('fullCapacityRooms')}</span>
              <span style={{ fontSize: '1.4rem' }}>🔴</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--danger)', marginTop: 8 }}>
              {stats.fullRooms}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{t('zeroVacant')}</div>
          </div>

          <div className="card" style={{ padding: '18px 20px', background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('availableRooms')}</span>
              <span style={{ fontSize: '1.4rem' }}>🟢</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--success)', marginTop: 8 }}>
              {stats.availableRooms}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{t('readyForAllocation')}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs" style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          <button
            className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'rooms' ? 'var(--navy-800)' : 'transparent',
              color: activeTab === 'rooms' ? 'var(--gold-400)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'rooms' ? '2px solid var(--gold-400)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>🏠</span> {t('roomOverviewTab')} ({rooms.length})
          </button>

          <button
            className={`tab-btn ${activeTab === 'allocate' ? 'active' : ''}`}
            onClick={() => setActiveTab('allocate')}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'allocate' ? 'var(--navy-800)' : 'transparent',
              color: activeTab === 'allocate' ? 'var(--gold-400)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'allocate' ? '2px solid var(--gold-400)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>➕</span> {t('allocateStudentTab')}
          </button>

          <button
            className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaves')}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'leaves' ? 'var(--navy-800)' : 'transparent',
              color: activeTab === 'leaves' ? 'var(--gold-400)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'leaves' ? '2px solid var(--gold-400)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>📋</span> {t('leavePassTab')} ({leaves.length})
          </button>

          <button
            className={`tab-btn ${activeTab === 'mess' ? 'active' : ''}`}
            onClick={() => setActiveTab('mess')}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'mess' ? 'var(--navy-800)' : 'transparent',
              color: activeTab === 'mess' ? 'var(--gold-400)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'mess' ? '2px solid var(--gold-400)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>🍱</span> {t('messScheduleTab')}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════
            TAB 1: ROOM OVERVIEW
            ══════════════════════════════════════════════════════ */}
        {activeTab === 'rooms' && (
          <div>
            {/* Filter Bar */}
            <div
              className="card"
              style={{
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                background: 'var(--navy-800)',
                border: '1px solid var(--border)',
                borderRadius: 12
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Floor:</label>
                  <select
                    className="form-control"
                    value={floorFilter}
                    onChange={e => setFloorFilter(e.target.value)}
                    style={{ width: 130 }}
                  >
                    <option value="all">All Floors</option>
                    <option value="1">1st Floor</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</label>
                  <select
                    className="form-control"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ width: 140 }}
                  >
                    <option value="all">All Status</option>
                    <option value="full">🔴 Full</option>
                    <option value="partial">🟡 Partial</option>
                    <option value="available">🟢 Available</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing {filteredRooms.length} of {rooms.length} rooms
              </div>
            </div>

            {/* Room Cards Grid */}
            {filteredRooms.length === 0 ? (
              <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏠</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Rooms Match Selected Filters</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                {filteredRooms.map(r => {
                  const occ = (r.students || []).length;
                  const isFull = occ >= r.capacity;
                  const isAvail = occ === 0;
                  const pct = Math.round((occ / r.capacity) * 100);

                  const borderColor = isFull ? 'rgba(239, 68, 68, 0.4)' : isAvail ? 'rgba(34, 197, 94, 0.4)' : 'rgba(234, 179, 8, 0.4)';
                  const statusTag = isFull ? '🔴 Full' : isAvail ? '🟢 Available' : '🟡 Partial';
                  const tagColor = isFull ? 'badge-red' : isAvail ? 'badge-green' : 'badge-yellow';

                  return (
                    <div
                      key={r.roomNo}
                      className="card"
                      onClick={() => {
                        setActiveDetailRoom(r);
                        setShowRoomDetailModal(true);
                      }}
                      style={{
                        padding: 18,
                        background: 'var(--navy-800)',
                        border: `1px solid ${borderColor}`,
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'transform 0.15s, border-color 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                          Room {r.roomNo}
                        </div>
                        <span className={`badge ${tagColor}`} style={{ fontSize: '0.72rem' }}>
                          {statusTag}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                        Floor {r.floor} • {r.type === 'girls' ? '👧 Girls Wing' : '👦 Boys Wing'}
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', background: 'var(--navy-900)', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: isFull ? 'var(--danger)' : isAvail ? 'var(--success)' : 'var(--gold-400)',
                            borderRadius: 4
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {occ} / {r.capacity} Beds Occupied
                        </span>
                        <span style={{ color: 'var(--blue-400)', fontSize: '0.75rem', fontWeight: 600 }}>
                          View Residents →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 2: ALLOCATE STUDENT
            ══════════════════════════════════════════════════════ */}
        {activeTab === 'allocate' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 24, alignItems: 'start' }}>
            {/* Allocation Form Card */}
            <div className="card" style={{ padding: 22, background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 16 }}>
                ➕ Allocate Student to Room
              </div>

              {/* Student Search */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                  Search Residential Student <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    🔍
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by student name or roll..."
                    value={allocSearch}
                    onChange={e => setAllocSearch(e.target.value)}
                    style={{ paddingLeft: 36, width: '100%' }}
                  />
                </div>

                {searchedAllocStudents.length > 0 && (
                  <div style={{ marginTop: 8, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--navy-900)' }}>
                    {searchedAllocStudents.map(s => {
                      const room = studentRoomMap[s.id];
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedStudentForAlloc(s);
                            setAllocSearch(s.name);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: selectedStudentForAlloc?.id === s.id ? 'var(--navy-700)' : 'transparent'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{s.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.id} • Class {s.class}-{s.section}</div>
                          </div>
                          {room ? (
                            <span className="badge badge-yellow" style={{ fontSize: '0.68rem' }}>Room {room.roomNo}</span>
                          ) : (
                            <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>Not Assigned</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedStudentForAlloc && (
                <div style={{ padding: '10px 14px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 8, marginBottom: 16, fontSize: '0.82rem' }}>
                  Selected: <strong style={{ color: 'var(--blue-400)' }}>{selectedStudentForAlloc.name}</strong> ({selectedStudentForAlloc.id})
                  {studentRoomMap[selectedStudentForAlloc.id] && (
                    <div style={{ color: 'var(--warning)', marginTop: 4 }}>
                      ⚠️ Currently in Room {studentRoomMap[selectedStudentForAlloc.id].roomNo}. Reallocating will transfer student.
                    </div>
                  )}
                </div>
              )}

              {/* Room Selector */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                  Target Room with Available Beds <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-control"
                  value={selectedRoomForAlloc}
                  onChange={e => setSelectedRoomForAlloc(e.target.value)}
                >
                  <option value="">Select available room...</option>
                  {rooms.filter(r => (r.students || []).length < r.capacity).map(r => (
                    <option key={r.roomNo} value={r.roomNo}>
                      Room {r.roomNo} (Floor {r.floor}, {r.type}) — {(r.students || []).length} / {r.capacity} beds filled
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAllocate}
                disabled={isAllocating || !selectedStudentForAlloc || !selectedRoomForAlloc}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {isAllocating ? '🏠 Allocating...' : '🏠 Allocate to Room'}
              </button>
            </div>

            {/* Residential Students Table */}
            <div className="card" style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', background: 'var(--navy-700)', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text-primary)' }}>
                👥 Residential Students &amp; Room Assignments ({residentialStudents.length} Students)
              </div>

              <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--navy-800)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 16px' }}>Student Name</th>
                      <th style={{ padding: '12px 16px' }}>Roll No</th>
                      <th style={{ padding: '12px 16px' }}>Class</th>
                      <th style={{ padding: '12px 16px' }}>Room</th>
                      <th style={{ padding: '12px 16px' }}>Floor</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residentialStudents.map((s, idx) => {
                      const room = studentRoomMap[s.id];
                      return (
                        <tr
                          key={s.id}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {s.name}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--gold-400)', fontSize: '0.85rem' }}>
                            {s.rollNo || s.id}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                              Class {s.class}-{s.section}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {room ? (
                              <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                                🏠 Room {room.roomNo}
                              </span>
                            ) : (
                              <span className="badge badge-red" style={{ fontSize: '0.75rem' }}>
                                Not Allocated
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                            {room ? `Floor ${room.floor}` : '—'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {room && isAdminOrWarden ? (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleDeallocate(s.id, room.roomNo)}
                                style={{ fontSize: '0.75rem', padding: '3px 8px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                              >
                                Deallocate
                              </button>
                            ) : !room ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setSelectedStudentForAlloc(s);
                                  setAllocSearch(s.name);
                                }}
                                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                              >
                                Allocate
                              </button>
                            ) : '—'}
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

        {/* ══════════════════════════════════════════════════════
            TAB 3: LEAVE & OUT-PASS RECORDS
            ══════════════════════════════════════════════════════ */}
        {activeTab === 'leaves' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowLeaveModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                ➕ Record Student Out-Pass / Leave
              </button>
            </div>

            <div className="card" style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--navy-700)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 16px', width: 50, color: 'var(--text-muted)' }}>#</th>
                      <th style={{ padding: '12px 16px' }}>Student</th>
                      <th style={{ padding: '12px 16px' }}>Room</th>
                      <th style={{ padding: '12px 16px' }}>Departure Date</th>
                      <th style={{ padding: '12px 16px' }}>Return Date</th>
                      <th style={{ padding: '12px 16px' }}>Reason</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                          No student leave records found.
                        </td>
                      </tr>
                    ) : (
                      leaves.map((l, idx) => {
                        const s = studentMap[l.studentId];
                        const room = s ? studentRoomMap[s.id] : null;
                        const isReturned = l.status === 'returned';
                        const isOverdue = !isReturned && l.returnDate && l.returnDate < todayStr;
                        const statusBadge = isReturned ? 'badge-green' : isOverdue ? 'badge-red' : 'badge-yellow';
                        const statusLabel = isReturned ? '✅ Returned' : isOverdue ? '⚠️ Overdue' : '🟡 On Leave';

                        return (
                          <tr
                            key={l.id || idx}
                            style={{
                              borderBottom: '1px solid var(--border)',
                              background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                            }}
                          >
                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s?.name || l.studentId}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s ? `Class ${s.class}-${s.section}` : ''}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {room ? `Room ${room.roomNo}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                              {l.leaveDate ? new Date(l.leaveDate).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                              {l.returnDate ? new Date(l.returnDate).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                                {l.reason || 'General'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className={`badge ${statusBadge}`} style={{ fontSize: '0.72rem' }}>
                                {statusLabel}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              {!isReturned ? (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleMarkReturned(l.id)}
                                  style={{ fontSize: '0.78rem', padding: '3px 8px', color: 'var(--success)', borderColor: 'rgba(34, 197, 94, 0.4)' }}
                                >
                                  ✅ Mark Returned
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Closed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 4: MESS SCHEDULE & GUIDELINES
            ══════════════════════════════════════════════════════ */}
        {activeTab === 'mess' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: 24, alignItems: 'start' }}>
            <div className="card" style={{ padding: 24, background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gold-400)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🍽️</span> Daily Dining &amp; Mess Timings
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { meal: '🌄 Morning Breakfast & Milk', time: '7:00 AM – 7:45 AM' },
                  { meal: '☀️ Afternoon Lunch', time: '12:30 PM – 1:15 PM' },
                  { meal: '🍵 Evening Tea & Snacks', time: '4:30 PM – 5:00 PM' },
                  { meal: '🌙 Dinner & Warm Milk', time: '7:30 PM – 8:30 PM' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--navy-700)',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                      {item.meal}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: '0.88rem' }}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 24, background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--blue-400)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📋</span> Residential Living Guidelines &amp; Routine
              </div>

              <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                <li><strong>Morning Roll Call:</strong> Promptly at 6:00 AM in the central hostel courtyard.</li>
                <li><strong>Night Roll Call &amp; Lights Out:</strong> Night attendance at 9:00 PM. Lights out at 10:00 PM for junior and 10:30 PM for senior standards.</li>
                <li><strong>Mess Dress Code:</strong> Clean institutional uniform or formal hostel attire required; slippers and nightwear are strictly restricted in the dining hall.</li>
                <li><strong>Gate Passes / Leaves:</strong> Students may leave campus only upon written approval by the hostel warden and parental consent via the portal.</li>
                <li><strong>Study Hours:</strong> Mandatory evening study session from 5:30 PM to 7:00 PM in the reading hall.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          ROOM DETAIL MODAL
          ══════════════════════════════════════════════════════ */}
      {showRoomDetailModal && activeDetailRoom && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
        >
          <div
            className="modal"
            style={{
              background: 'var(--navy-800)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              width: '100%',
              maxWidth: 500,
              borderRadius: 12,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                background: 'var(--navy-700)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gold-400)' }}>
                🏠 Room {activeDetailRoom.roomNo} Details
              </div>
              <button
                type="button"
                onClick={() => setShowRoomDetailModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, padding: 12, background: 'var(--navy-900)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Floor</div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}>{activeDetailRoom.floor}</div>
                </div>
                <div style={{ flex: 1, padding: 12, background: 'var(--navy-900)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupancy</div>
                  <div style={{ fontWeight: 700, marginTop: 2, color: 'var(--gold-400)' }}>
                    {(activeDetailRoom.students || []).length} / {activeDetailRoom.capacity} Beds
                  </div>
                </div>
                <div style={{ flex: 1, padding: 12, background: 'var(--navy-900)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wing Type</div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}>{activeDetailRoom.type === 'girls' ? '👧 Girls' : '👦 Boys'}</div>
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                Allocated Students ({(activeDetailRoom.students || []).length})
              </div>

              {(activeDetailRoom.students || []).length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--navy-900)', borderRadius: 8 }}>
                  No students currently assigned to this room.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(activeDetailRoom.students || []).map(sid => {
                    const s = studentMap[sid];
                    return (
                      <div
                        key={sid}
                        style={{
                          padding: '10px 14px',
                          background: 'var(--navy-900)',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s?.name || sid}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {sid} {s ? `• Class ${s.class}-${s.section}` : ''}
                          </div>
                        </div>

                        {isAdminOrWarden && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleDeallocate(sid, activeDetailRoom.roomNo)}
                            style={{ fontSize: '0.75rem', padding: '3px 8px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', background: 'var(--navy-700)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowRoomDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ADD ROOM MODAL
          ══════════════════════════════════════════════════════ */}
      {showAddRoomModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
        >
          <div
            className="modal"
            style={{
              background: 'var(--navy-800)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              width: '100%',
              maxWidth: 480,
              borderRadius: 12,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                background: 'var(--navy-700)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gold-400)' }}>
                ➕ Add New Hostel Room
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRoom} style={{ padding: 20 }}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                  Room Number <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. H-103 or 204"
                  value={newRoomNo}
                  onChange={e => setNewRoomNo(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                    Floor Level
                  </label>
                  <select
                    className="form-control"
                    value={newRoomFloor}
                    onChange={e => setNewRoomFloor(e.target.value)}
                  >
                    <option value="1st">1st Floor</option>
                    <option value="2nd">2nd Floor</option>
                    <option value="3rd">3rd Floor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                    Bed Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="form-control"
                    value={newRoomCap}
                    onChange={e => setNewRoomCap(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                  Hostel Wing Type
                </label>
                <select
                  className="form-control"
                  value={newRoomType}
                  onChange={e => setNewRoomType(e.target.value)}
                >
                  <option value="boys">Boys Hostel Wing</option>
                  <option value="girls">Girls Hostel Wing</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddRoomModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isAddingRoom}>
                  {isAddingRoom ? '💾 Saving...' : '💾 Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          RECORD LEAVE MODAL
          ══════════════════════════════════════════════════════ */}
      {showLeaveModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
        >
          <div
            className="modal"
            style={{
              background: 'var(--navy-800)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              width: '100%',
              maxWidth: 480,
              borderRadius: 12,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                background: 'var(--navy-700)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gold-400)' }}>
                📋 Record Student Out-Pass / Leave
              </div>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLeave} style={{ padding: 20 }}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                  Residential Student <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-control"
                  value={leaveStudentId}
                  onChange={e => setLeaveStudentId(e.target.value)}
                  required
                >
                  <option value="">Select student...</option>
                  {residentialStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id}) — Class {s.class}-{s.section}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                    Departure Date <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={leaveFrom}
                    onChange={e => setLeaveFrom(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                    Expected Return Date <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={leaveTo}
                    onChange={e => setLeaveTo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block' }}>
                  Reason for Out-Pass / Leave
                </label>
                <select
                  className="form-control"
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                >
                  <option value="Family Event">Family Event / Function</option>
                  <option value="Medical">Medical Checkup / Treatment</option>
                  <option value="Going Home">Weekend Home Visit</option>
                  <option value="Competition">External Competition</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowLeaveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingLeave}>
                  {isSavingLeave ? '💾 Saving...' : '💾 Save Leave Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
