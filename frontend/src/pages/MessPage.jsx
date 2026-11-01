/* ============================================================
   MessPage.jsx — Full React port of mess.html + mess.js
   Features: Weekly 7-day schedule, Live current meal slot,
             Special Feasts / Mahaprasad, Day Scholar policies,
             Edit Day Menu modal, Add Special Feast modal,
             Printable weekly menu chart
   ============================================================ */
import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const DAYS = [
  { key: 'Monday',    en: 'Monday',    mr: 'सोमवार', short: 'Mon' },
  { key: 'Tuesday',   en: 'Tuesday',   mr: 'मंगळवार', short: 'Tue' },
  { key: 'Wednesday', en: 'Wednesday', mr: 'बुधवार',  short: 'Wed' },
  { key: 'Thursday',  en: 'Thursday',  mr: 'गुरुवार', short: 'Thu' },
  { key: 'Friday',    en: 'Friday',    mr: 'शुक्रवार', short: 'Fri' },
  { key: 'Saturday',  en: 'Saturday',  mr: 'शनिवार',  short: 'Sat' },
  { key: 'Sunday',    en: 'Sunday',    mr: 'रविवार',  short: 'Sun' },
];

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Breakfast (नाश्ता)',   timing: '07:30 – 08:30 AM', icon: '🥣', color: '#f59e0b' },
  { key: 'lunch',     label: 'Lunch (दुपारचे जेवण)',  timing: '12:30 – 01:30 PM', icon: '🍛', color: '#10b981' },
  { key: 'snacks',    label: 'Evening Snacks (अल्पोपहार)', timing: '04:30 – 05:15 PM', icon: '🥛', color: '#3b82f6' },
  { key: 'dinner',    label: 'Dinner (रात्रीचे जेवण)', timing: '07:45 – 08:45 PM', icon: '🍲', color: '#8b5cf6' },
];

function getCurrentSlotKey() {
  const now = new Date();
  const time = now.getHours() + now.getMinutes() / 60;
  if (time >= 6.0 && time < 10.5) return 'breakfast';
  if (time >= 10.5 && time < 15.5) return 'lunch';
  if (time >= 15.5 && time < 19.5) return 'snacks';
  return 'dinner';
}

function getTodayDayName() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

export default function MessPage() {
  const { user } = useAuth();
  const canEdit = ['admin', 'warden', 'principal', 'mentor'].includes(user?.role);

  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(getTodayDayName());
  const [activeSlot, setActiveSlot] = useState(getCurrentSlotKey());
  const [toastMsg, setToastMsg] = useState(null);

  // Special feasts state (in component or persisted in menu)
  const [feasts, setFeasts] = useState([
    {
      id: 'FEAST-101',
      title: 'Ganesh Festival Mahaprasad Feast (महाप्रसाद)',
      occasion: 'Ganesh Utsav Celebration',
      date: new Date().toISOString().slice(0, 10),
      mealSlot: 'lunch',
      items: 'उकडीचे मोदक (2 pcs), पुरणपोळी, वांगी-बटाटा भाजी, कटाची आमटी, बासमती पुलाव, साजूक तूप, मठ्ठा',
      notes: 'Open for all Residential & Day Scholar students, teachers, and visiting parents.'
    }
  ]);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeastModal, setShowFeastModal] = useState(false);
  const [editForm, setEditForm] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' });
  const [feastForm, setFeastForm] = useState({ title: '', occasion: '', date: '', mealSlot: 'lunch', items: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Menu from backend
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/mess');
      setWeeklyMenu(res.data || {});
    } catch {
      showToast('Could not load server menu, displaying offline fallback.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
    const timer = setInterval(() => {
      setActiveSlot(getCurrentSlotKey());
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchMenu]);

  // Current selected day's menu data
  const currentDayData = useMemo(() => {
    return weeklyMenu[selectedDay] || {
      breakfast: 'Poha / Upma + Fresh Cow Milk / Tea',
      lunch: 'Roti, Seasonal Veggie, Dal Tadka, Steamed Rice, Salad, Chhach',
      snacks: 'Boiled Sprouts / Biscuits + Hot Tea',
      dinner: 'Phulka Chapati, Paneer / Mixed Sabzi, Dal Khichdi, Papad',
    };
  }, [weeklyMenu, selectedDay]);

  const activeSlotMeta = MEAL_SLOTS.find(s => s.key === activeSlot) || MEAL_SLOTS[0];
  const todayName = getTodayDayName();

  // Open Edit Day Menu
  const openEdit = () => {
    setEditForm({
      breakfast: currentDayData.breakfast || '',
      lunch:     currentDayData.lunch || '',
      snacks:    currentDayData.snacks || currentDayData.snack || '',
      dinner:    currentDayData.dinner || '',
    });
    setShowEditModal(true);
  };

  // Save Day Menu
  const handleSaveMenu = async (e) => {
    e.preventDefault();
    setSaving(true);
    const updated = {
      ...weeklyMenu,
      [selectedDay]: {
        ...weeklyMenu[selectedDay],
        ...editForm
      }
    };
    try {
      await api.put('/mess', updated);
      setWeeklyMenu(updated);
      setShowEditModal(false);
      showToast(`Updated menu for ${selectedDay}!`);
    } catch {
      showToast('Failed to update mess menu.');
    } finally {
      setSaving(false);
    }
  };

  // Add Special Feast
  const handleSaveFeast = (e) => {
    e.preventDefault();
    if (!feastForm.title) return;
    const newFeast = {
      ...feastForm,
      id: 'FEAST-' + Date.now().toString().slice(-4),
    };
    setFeasts([newFeast, ...feasts]);
    setShowFeastModal(false);
    setFeastForm({ title: '', occasion: '', date: '', mealSlot: 'lunch', items: '', notes: '' });
    showToast('Special Feast announced successfully!');
  };

  // Print Chart
  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout pageTitle="🍽️ Mess & Dietary Menu">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--gold-500)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>🍲</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      {/* Top Header / Actions */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            🍽️ Mess & Dietary Schedule
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Pure Sattvic Vegetarian Nutrition • 4 Meals Daily Prepared Fresh in Gurukul Annachhatra
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            🖨️ Print Chart
          </button>
          {canEdit && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowFeastModal(true)}>
                🎉 Announce Feast
              </button>
              <button className="btn btn-primary btn-sm" onClick={openEdit}>
                ✏️ Edit {selectedDay} Menu
              </button>
            </>
          )}
        </div>
      </div>

      {/* Live Active Meal Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--border-radius)',
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontSize: '2rem', background: 'rgba(245, 158, 11, 0.15)',
            width: 54, height: 54, borderRadius: 14, display: 'flex',
            alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.3)'
          }}>
            {activeSlotMeta.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)', color: '#10b981',
                padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem',
                fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.4)'
              }}>
                ● LIVE SERVING NOW
              </span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {activeSlotMeta.label}
              </strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Timings: <strong style={{ color: 'var(--gold-400)' }}>{activeSlotMeta.timing}</strong> &nbsp;•&nbsp;
              Dining Hall: Main Annachhatra Ground Floor
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today's Date:</div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* 7-Day Selector Tabs */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20
      }}>
        {DAYS.map(d => {
          const isSelected = selectedDay === d.key;
          const isToday = todayName === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setSelectedDay(d.key)}
              style={{
                flex: '1 0 110px',
                padding: '12px 14px',
                borderRadius: 10,
                border: isSelected ? '1px solid var(--gold-500)' : '1px solid var(--border)',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.12) 100%)'
                  : 'var(--bg-card)',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{d.mr}</span>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.8 }}>{d.en}</span>
              {isToday && (
                <span style={{
                  fontSize: '0.62rem', background: 'var(--gold-500)',
                  color: '#000', fontWeight: 900, padding: '1px 6px',
                  borderRadius: 10, marginTop: 2
                }}>
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4 Meal Cards Grid for Selected Day */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16, marginBottom: 30
      }}>
        {MEAL_SLOTS.map(slot => {
          const isLiveNow = todayName === selectedDay && activeSlot === slot.key;
          const menuText = currentDayData[slot.key] || currentDayData[slot.key === 'snacks' ? 'snack' : slot.key] || 'Wholesome nutritious meal prepared fresh.';

          return (
            <div
              key={slot.key}
              style={{
                background: 'var(--bg-card)',
                border: isLiveNow ? '2px solid var(--gold-500)' : '1px solid var(--border)',
                borderRadius: 'var(--border-radius)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                position: 'relative',
                boxShadow: isLiveNow ? '0 8px 24px rgba(245, 158, 11, 0.18)' : 'var(--shadow-sm)',
                transition: 'transform 0.2s ease'
              }}
            >
              {/* Card top border line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: slot.color, borderTopLeftRadius: 'var(--border-radius)', borderTopRightRadius: 'var(--border-radius)'
              }} />

              {/* Title & timing */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.6rem' }}>{slot.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {slot.label}
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      🕒 {slot.timing}
                    </div>
                  </div>
                </div>

                {isLiveNow && (
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)', color: '#10b981',
                    fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 12
                  }}>
                    SERVING
                  </span>
                )}
              </div>

              {/* Menu items */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                minHeight: 85,
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                fontWeight: 500
              }}>
                {menuText}
              </div>

              {/* Dietary info tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 6 }}>
                <span style={{
                  fontSize: '0.7rem', padding: '3px 8px', borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 600
                }}>
                  🌱 100% Sattvic Veg
                </span>
                <span style={{
                  fontSize: '0.7rem', padding: '3px 8px', borderRadius: 6,
                  background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', fontWeight: 600
                }}>
                  🥛 Fresh Dairy / Cow Ghee
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Feasts & Day Scholar Policy section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Special Feasts Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🎉</span>
              <span className="card-title">Special Feasts & Mahaprasad Announcements</span>
            </div>
            {canEdit && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowFeastModal(true)}>
                + Add Feast
              </button>
            )}
          </div>
          <div className="card-body">
            {feasts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                No special feasts announced for this month.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {feasts.map(f => (
                  <div key={f.id} style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 10,
                    padding: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ color: 'var(--gold-400)', fontSize: '0.98rem' }}>{f.title}</strong>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 6 }}>
                        📅 {f.date}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 8, lineHeight: 1.5 }}>
                      <strong>Items:</strong> {f.items}
                    </div>
                    {f.notes && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        ℹ️ {f.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Day Scholar Meal Policy Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📜</span>
              <span className="card-title">Gurukul Dining Guidelines & Day Scholar Policy</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>1. Fresh Dining Protocol:</strong> All residential students must assemble 5 minutes before the gong in clean Gurukul attire. Shanti Mantra prayer is recited before dining.
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>2. Day Scholars Lunch Access:</strong> Day scholar students opting for campus lunch can subscribe via the Fee Management portal. Daily hot lunch & fresh buttermilk are served.
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>3. Special Medical / Fasting Diet:</strong> Students fasting for Ekadashi or needing light sick-bay meals (Khichdi, Herbal Kadha, Boiled Milk) should inform the Hostel Warden by 7 AM.
            </p>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: 12, borderRadius: 8, color: '#10b981', fontWeight: 600, fontSize: '0.8rem'
            }}>
              ✅ Kitchen Certified for 100% Organic Farm Vegetables & RO Purified Water
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Edit Day Menu */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit Menu — {selectedDay}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveMenu}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">🥣 Breakfast (नाश्ता) Items</label>
                  <input
                    type="text" className="form-control"
                    value={editForm.breakfast}
                    onChange={e => setEditForm({ ...editForm, breakfast: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">🍛 Lunch (दुपारचे जेवण) Items</label>
                  <input
                    type="text" className="form-control"
                    value={editForm.lunch}
                    onChange={e => setEditForm({ ...editForm, lunch: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">🥛 Evening Snacks (अल्पोपहार)</label>
                  <input
                    type="text" className="form-control"
                    value={editForm.snacks}
                    onChange={e => setEditForm({ ...editForm, snacks: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">🍲 Dinner (रात्रीचे जेवण) Items</label>
                  <input
                    type="text" className="form-control"
                    value={editForm.dinner}
                    onChange={e => setEditForm({ ...editForm, dinner: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Announce Special Feast */}
      {showFeastModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">🎉 Announce Special Feast / Mahaprasad</h3>
              <button className="modal-close" onClick={() => setShowFeastModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveFeast}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Feast Title</label>
                  <input
                    type="text" className="form-control" placeholder="e.g. Kojagiri Paurnima Kheer Feast"
                    value={feastForm.title}
                    onChange={e => setFeastForm({ ...feastForm, title: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date" className="form-control"
                      value={feastForm.date}
                      onChange={e => setFeastForm({ ...feastForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meal Slot</label>
                    <select
                      className="form-control"
                      value={feastForm.mealSlot}
                      onChange={e => setFeastForm({ ...feastForm, mealSlot: e.target.value })}
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Grand Lunch (महाप्रसाद)</option>
                      <option value="snacks">Evening Snacks</option>
                      <option value="dinner">Special Dinner</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Special Feast Dishes / Delicacies</label>
                  <textarea
                    rows={3} className="form-control" placeholder="e.g. Puran Poli, Modak, Katachi Amti, Kheer..."
                    value={feastForm.items}
                    onChange={e => setFeastForm({ ...feastForm, items: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes / Instructions</label>
                  <input
                    type="text" className="form-control" placeholder="Open for day scholars & parents..."
                    value={feastForm.notes}
                    onChange={e => setFeastForm({ ...feastForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFeastModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
