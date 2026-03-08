import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { getHabits, createHabit, deleteHabit, toggleHabit } from '../services/api';

const HABIT_ICONS = [
  { key: 'star',    el: (s) => Icons.star(s)    },
  { key: 'flame',   el: (s) => Icons.flame(s)   },
  { key: 'task',    el: (s) => Icons.task(s)    },
  { key: 'habits',  el: (s) => Icons.habits(s)  },
  { key: 'finance', el: (s) => Icons.finance(s) },
  { key: 'chart',   el: (s) => Icons.chart(s)   },
  { key: 'lock',    el: (s) => Icons.lock(s)    },
  { key: 'check',   el: (s) => Icons.check(s)   },
  { key: 'user',    el: (s) => Icons.user(s)    },
  { key: 'calendar',el: (s) => Icons.calendar(s)},
];

const HABIT_COLORS = ['#7c6fcd','#a855f7','#4caf50','#f0a500','#ff6b6b','#00bcd4','#ff8a80','#26c6da'];
const FREQUENCIES  = ['daily','weekly'];
const DAYS_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const HabitIcon = ({ iconKey, size = 18, color = '#7c6fcd' }) => {
  const found = HABIT_ICONS.find(i => i.key === iconKey);
  return <span style={{ color }}>{found ? found.el(size) : Icons.star(size)}</span>;
};

const getStreak = (completedDates) => {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    if (completedDates.includes(d.toISOString().split('T')[0])) streak++;
    else if (i > 0) break;
  }
  return streak;
};

const getLongestStreak = (completedDates) => {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000;
    if (diff === 1) { cur++; max = Math.max(max, cur); } else cur = 1;
  }
  return max;
};

const getCompletionRate = (completedDates) => {
  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
  return Math.round((days30.filter(d => completedDates.includes(d)).length / 30) * 100);
};

export default function Habits() {
  const [habits, setHabits]               = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [calMonth, setCalMonth]           = useState(new Date().getMonth());
  const [calYear, setCalYear]             = useState(new Date().getFullYear());
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [activeTab, setActiveTab]         = useState('today');
  const [form, setForm]                   = useState({ name: '', icon: 'star', color: '#7c6fcd', frequency: 'daily', goal: 7 });
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet]           = useState(window.innerWidth < 1024);
  const { theme } = useTheme();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchHabits(); }, []);
  useEffect(() => { if (habits.length > 0 && !selectedHabit) setSelectedHabit(habits[0]); }, [habits]);

  const fetchHabits = async () => {
    const res = await getHabits();
    setHabits(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createHabit(form);
    setHabits([...habits, res.data]);
    setForm({ name: '', icon: 'star', color: '#7c6fcd', frequency: 'daily', goal: 7 });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await deleteHabit(id);
    const updated = habits.filter(h => h._id !== id);
    setHabits(updated);
    if (selectedHabit?._id === id) setSelectedHabit(updated[0] || null);
  };

  const handleToggle = async (id) => {
    const res = await toggleHabit(id, today);
    setHabits(habits.map(h => h._id === id ? res.data : h));
    if (selectedHabit?._id === id) setSelectedHabit(res.data);
  };

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDay    = (month, year) => new Date(year, month, 1).getDay();
  const calDays     = getDaysInMonth(calMonth, calYear);
  const calFirstDay = getFirstDay(calMonth, calYear);
  const calCells    = Array.from({ length: calFirstDay }, () => null).concat(
    Array.from({ length: calDays }, (_, i) => i + 1)
  );
  const getDateStr = (day) => {
    const m = String(calMonth + 1).padStart(2,'0');
    const d = String(day).padStart(2,'0');
    return `${calYear}-${m}-${d}`;
  };

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalHabits    = habits.length;
  const todayPct       = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const cardClass = theme.isDark ? 'glass-card' : 'glass-card-light';
  const inp = { width: '100%', padding: '10px 14px', marginBottom: 10, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, boxSizing: 'border-box', fontSize: '0.9rem' };

  const tabBtn = (id, label, icon) => (
    <button onClick={() => setActiveTab(id)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '8px 12px' : '8px 18px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: isMobile ? '0.78rem' : '0.88rem', fontWeight: '600', transition: 'all 0.2s',
        background: activeTab === id ? 'linear-gradient(135deg,#7c6fcd,#a855f7)' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        color: activeTab === id ? '#fff' : theme.subtext,
        boxShadow: activeTab === id ? '0 4px 12px rgba(124,111,205,0.35)' : 'none' }}>
      {icon} {isMobile ? '' : label}
    </button>
  );

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: theme.bg }}>
      <Navbar />
      <div style={{ padding: isMobile ? '16px' : '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(124,111,205,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c6fcd' }}>
              {Icons.habits(22)}
            </div>
            <div>
              <h1 className="gradient-text" style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', lineHeight: 1 }}>Habits</h1>
              <p style={{ color: theme.subtext, margin: 0, fontSize: '0.78rem' }}>{completedToday}/{totalHabits} completed today</p>
            </div>
          </div>
          <button className="gradient-btn btn-press" onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            {showForm ? <>{Icons.x(14)} Cancel</> : <>{Icons.add(15)} {isMobile ? 'Add' : 'New Habit'}</>}
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 10 : 16, marginBottom: 20 }}>
          {[
            { label: "Today's Progress", value: `${todayPct}%`,      color: '#7c6fcd', icon: Icons.habits(18), sub: `${completedToday} of ${totalHabits} done` },
            { label: 'Best Streak',      value: `${Math.max(0, ...habits.map(h => getStreak(h.completedDates)))} days`, color: '#ff6b6b', icon: Icons.flame(18), sub: 'current streak' },
            { label: 'Longest Ever',     value: `${Math.max(0, ...habits.map(h => getLongestStreak(h.completedDates)))} days`, color: '#f0a500', icon: Icons.star(18), sub: 'all-time record' },
            { label: '30-Day Rate',      value: `${habits.length > 0 ? Math.round(habits.reduce((s,h) => s + getCompletionRate(h.completedDates), 0) / habits.length) : 0}%`, color: '#4caf50', icon: Icons.chart(18), sub: 'avg completion' },
          ].map(card => (
            <div key={card.label} className={`${cardClass} card-hover`}
              style={{ padding: isMobile ? '12px' : '18px 20px', borderRadius: 16, borderTop: `3px solid ${card.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: theme.subtext, margin: '0 0 4px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</p>
                  <p style={{ color: card.color, margin: '0 0 2px', fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: '800' }}>{card.value}</p>
                  <p style={{ color: theme.subtext, margin: 0, fontSize: '0.7rem' }}>{card.sub}</p>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: card.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Habit Form */}
        {showForm && (
          <div className={`scale-in ${cardClass}`} style={{ borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 20, border: '1px solid rgba(124,111,205,0.2)' }}>
            <h3 style={{ color: theme.text, margin: '0 0 16px', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#7c6fcd' }}>{Icons.add(16)}</span> New Habit
            </h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>Habit Name *</label>
                  <input style={inp} placeholder="e.g. Morning run, Read 30 min..." required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {HABIT_ICONS.map(i => (
                      <button key={i.key} type="button" onClick={() => setForm({ ...form, icon: i.key })}
                        style={{ width: 34, height: 34, border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                          background: form.icon === i.key ? form.color + '30' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          boxShadow: form.icon === i.key ? `0 0 0 2px ${form.color}` : 'none',
                          color: form.icon === i.key ? form.color : theme.subtext }}>
                        {i.el(15)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Color</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {HABIT_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                        style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: c, cursor: 'pointer', transition: 'transform 0.2s',
                          boxShadow: form.color === c ? `0 0 0 3px ${theme.isDark ? '#1a1a2e' : '#fff'}, 0 0 0 5px ${c}` : 'none',
                          transform: form.color === c ? 'scale(1.15)' : 'scale(1)' }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Frequency</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {FREQUENCIES.map(f => (
                      <button key={f} type="button" onClick={() => setForm({ ...form, frequency: f })}
                        style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', textTransform: 'capitalize', transition: 'all 0.2s',
                          background: form.frequency === f ? form.color : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          color: form.frequency === f ? '#fff' : theme.subtext }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    {Icons.star(13)} Weekly Goal (days)
                  </label>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[1,2,3,4,5,6,7].map(n => (
                      <button key={n} type="button" onClick={() => setForm({ ...form, goal: n })}
                        style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.2s',
                          background: form.goal === n ? form.color : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          color: form.goal === n ? '#fff' : theme.subtext }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div style={{ margin: '14px 0', padding: '12px 16px', borderRadius: 12, background: form.color + '12', border: `1px solid ${form.color}30`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: form.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HabitIcon iconKey={form.icon} size={18} color={form.color} />
                </div>
                <div>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '700', fontSize: '0.88rem' }}>{form.name || 'Habit name preview'}</p>
                  <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>{form.frequency} · {form.goal}x per week goal</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="gradient-btn btn-press"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, padding: '11px 0', justifyContent: 'center', borderRadius: 10, cursor: 'pointer', fontWeight: '600' }}>
                  {Icons.add(15)} Create Habit
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: '11px 0', background: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: theme.text, border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tabBtn('today',    "Today's Habits", Icons.habits(15))}
          {tabBtn('calendar', 'Calendar',       Icons.calendar(15))}
          {tabBtn('stats',    'Statistics',     Icons.chart(15))}
        </div>

        {/* ══ TAB: Today ══ */}
        {activeTab === 'today' && (
          <>
            <div className={cardClass} style={{ padding: '14px 18px', borderRadius: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: theme.text, fontWeight: '700', fontSize: '0.92rem' }}>
                  {todayPct === 100 ? '🎉 All habits completed!' : `${completedToday} of ${totalHabits} habits done`}
                </span>
                <span style={{ color: '#7c6fcd', fontWeight: '800', fontSize: '1.1rem' }}>{todayPct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 6, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${todayPct}%`, height: '100%', background: 'linear-gradient(90deg,#7c6fcd,#a855f7)', borderRadius: 6, transition: 'width 0.8s ease' }} />
              </div>
            </div>

            {habits.length === 0 ? (
              <div className={cardClass} style={{ borderRadius: 16, padding: 50, textAlign: 'center' }}>
                <div style={{ color: '#7c6fcd', opacity: 0.35, marginBottom: 14 }}>{Icons.habits(42)}</div>
                <p style={{ color: theme.text, fontSize: '1rem', fontWeight: '600', margin: '0 0 6px' }}>No habits yet</p>
                <p style={{ color: theme.subtext, fontSize: '0.85rem', margin: 0 }}>Click "New Habit" to start building your routine</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {habits.map(h => {
                  const done    = h.completedDates.includes(today);
                  const streak  = getStreak(h.completedDates);
                  const rate    = getCompletionRate(h.completedDates);
                  const longest = getLongestStreak(h.completedDates);
                  const goalMet = streak >= (h.goal || 7);
                  const color   = h.color || '#7c6fcd';

                  const last7 = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(); d.setDate(d.getDate() - (6 - i));
                    return { date: d.toISOString().split('T')[0], day: DAYS_SHORT[d.getDay()] };
                  });

                  return (
                    <div key={h._id} className={`${cardClass} card-hover`}
                      style={{ borderRadius: 18, padding: isMobile ? '14px' : '18px 20px',
                        border: done ? `1.5px solid ${color}40` : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                        background: done ? (theme.isDark ? color + '10' : color + '06') : undefined }}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 14, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', border: done ? `2px solid ${color}` : `1px solid ${color}33` }}>
                            <HabitIcon iconKey={h.icon} size={20} color={color} />
                          </div>
                          <div>
                            <p style={{ color: theme.text, margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{h.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                              <span style={{ fontSize: '0.7rem', padding: '1px 7px', borderRadius: 8, fontWeight: '600', background: color + '18', color }}>{h.frequency}</span>
                              {goalMet && <span style={{ fontSize: '0.7rem', padding: '1px 7px', borderRadius: 8, fontWeight: '600', background: 'rgba(76,175,80,0.15)', color: '#4caf50' }}>🎯 Goal!</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(h._id)}
                          style={{ display: 'flex', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}>
                          {Icons.trash(13)}
                        </button>
                      </div>

                      {/* Last 7 days */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        {last7.map(({ date, day }) => {
                          const isToday   = date === today;
                          const completed = h.completedDates.includes(date);
                          return (
                            <div key={date} style={{ textAlign: 'center', flex: 1 }}>
                              <p style={{ color: theme.subtext, fontSize: '0.6rem', margin: '0 0 4px', fontWeight: '600' }}>{day}</p>
                              <div style={{ width: 24, height: 24, borderRadius: 7, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: completed ? color : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                border: isToday ? `2px solid ${color}` : '2px solid transparent',
                                boxShadow: completed ? `0 2px 8px ${color}40` : 'none' }}>
                                {completed && <span style={{ color: '#fff' }}>{Icons.check(9)}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Stats Row */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        {[
                          { label: 'Streak', value: `${streak}d`,  color: '#ff6b6b', icon: Icons.flame(11) },
                          { label: 'Best',   value: `${longest}d`, color: '#f0a500', icon: Icons.star(11)  },
                          { label: '30-Day', value: `${rate}%`,    color: '#4caf50', icon: Icons.chart(11) },
                          { label: 'Goal',   value: `${h.goal||7}x`, color,          icon: Icons.check(11) },
                        ].map(stat => (
                          <div key={stat.label} style={{ flex: 1, textAlign: 'center', padding: '7px 4px', borderRadius: 10, background: stat.color + '10' }}>
                            <div style={{ color: stat.color, display: 'flex', justifyContent: 'center', marginBottom: 2 }}>{stat.icon}</div>
                            <p style={{ color: stat.color, fontWeight: '800', margin: 0, fontSize: '0.75rem', lineHeight: 1 }}>{stat.value}</p>
                            <p style={{ color: theme.subtext, margin: 0, fontSize: '0.58rem' }}>{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: theme.subtext, fontSize: '0.7rem', fontWeight: '600' }}>30-day completion</span>
                          <span style={{ color, fontSize: '0.7rem', fontWeight: '700' }}>{rate}%</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 4, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s' }} />
                        </div>
                      </div>

                      <button onClick={() => handleToggle(h._id)} className="btn-press"
                        style={{ width: '100%', padding: '10px 0', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: done ? color : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          color: done ? '#fff' : color,
                          boxShadow: done ? `0 4px 16px ${color}40` : 'none' }}>
                        {done ? <>{Icons.check(15)} Completed!</> : <>{Icons.add(15)} Mark Done</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══ TAB: Calendar ══ */}
        {activeTab === 'calendar' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 260px', gap: 20 }}>
            <div className={cardClass} style={{ borderRadius: 16, padding: isMobile ? 14 : 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); }}
                  style={{ background: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', border: 'none', color: theme.text, borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}>←</button>
                <h3 className="gradient-text" style={{ margin: 0, fontWeight: '800', fontSize: isMobile ? '1rem' : '1.1rem' }}>{MONTHS_FULL[calMonth]} {calYear}</h3>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); }}
                  style={{ background: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', border: 'none', color: theme.text, borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}>→</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
                {DAYS_SHORT.map(d => (
                  <div key={d} style={{ textAlign: 'center', color: theme.subtext, fontSize: '0.68rem', fontWeight: '700', padding: '4px 0' }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {calCells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const dateStr   = getDateStr(day);
                  const isToday   = dateStr === today;
                  const completed = habits.filter(h => h.completedDates.includes(dateStr));
                  const allDone   = completed.length === habits.length && habits.length > 0;
                  const someDone  = completed.length > 0 && !allDone;
                  const isFuture  = dateStr > today;
                  return (
                    <div key={day} style={{ aspectRatio: '1', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: isFuture ? 'default' : 'pointer', gap: 2,
                      background: isToday ? 'linear-gradient(135deg,#7c6fcd,#a855f7)' : allDone ? 'rgba(76,175,80,0.2)' : someDone ? 'rgba(240,165,0,0.15)' : 'transparent',
                      border: isToday ? 'none' : allDone ? '1px solid rgba(76,175,80,0.4)' : someDone ? '1px solid rgba(240,165,0,0.3)' : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      opacity: isFuture ? 0.35 : 1 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: isToday ? '800' : '600',
                        color: isToday ? '#fff' : allDone ? '#4caf50' : someDone ? '#f0a500' : theme.text }}>
                        {day}
                      </span>
                      {completed.length > 0 && !isToday && (
                        <span style={{ fontSize: '0.5rem', color: allDone ? '#4caf50' : '#f0a500', fontWeight: '700' }}>
                          {completed.length}/{habits.length}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 14, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { color: 'linear-gradient(135deg,#7c6fcd,#a855f7)', label: 'Today' },
                  { color: 'rgba(76,175,80,0.5)',  label: 'All done' },
                  { color: 'rgba(240,165,0,0.5)',  label: 'Partial'  },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                    <span style={{ color: theme.subtext, fontSize: '0.72rem' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit Selector — stacks below on mobile/tablet */}
            <div className={cardClass} style={{ borderRadius: 16, padding: 18 }}>
              <h3 style={{ color: theme.text, margin: '0 0 12px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habits</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : '1fr', gap: 6 }}>
                {habits.map(h => {
                  const monthCompleted = Array.from({ length: calDays }, (_, i) => i + 1)
                    .filter(d => h.completedDates.includes(getDateStr(d))).length;
                  const color = h.color || '#7c6fcd';
                  return (
                    <div key={h._id} onClick={() => setSelectedHabit(h)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                        background: selectedHabit?._id === h._id ? color + '18' : 'transparent',
                        border: selectedHabit?._id === h._id ? `1px solid ${color}35` : '1px solid transparent' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <HabitIcon iconKey={h.icon} size={15} color={color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: theme.text, margin: 0, fontWeight: '600', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</p>
                        <p style={{ color, margin: 0, fontSize: '0.7rem', fontWeight: '600' }}>{monthCompleted}/{calDays} days</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: Statistics ══ */}
        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {habits.length === 0 ? (
              <div className={cardClass} style={{ borderRadius: 16, padding: 50, textAlign: 'center' }}>
                <p style={{ color: theme.subtext }}>No habits to analyze yet.</p>
              </div>
            ) : (
              <div className={cardClass} style={{ borderRadius: 16, padding: isMobile ? 14 : 24 }}>
                <h3 style={{ color: theme.text, margin: '0 0 16px', fontWeight: '700', fontSize: '1rem' }}>Habit Performance</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {habits.map(h => {
                    const streak  = getStreak(h.completedDates);
                    const longest = getLongestStreak(h.completedDates);
                    const rate    = getCompletionRate(h.completedDates);
                    const color   = h.color || '#7c6fcd';
                    const total   = h.completedDates.length;
                    const goalPct = Math.min(100, Math.round((streak / (h.goal || 7)) * 100));

                    return (
                      <div key={h._id} style={{ padding: isMobile ? '12px' : '16px 18px', borderRadius: 14, background: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)', border: `1px solid ${color}22` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 12, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <HabitIcon iconKey={h.icon} size={17} color={color} />
                            </div>
                            <div>
                              <p style={{ color: theme.text, margin: 0, fontWeight: '700', fontSize: '0.88rem' }}>{h.name}</p>
                              <p style={{ color: theme.subtext, margin: 0, fontSize: '0.7rem' }}>{total} completions · {h.frequency}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {[
                              { label: 'Streak', val: `${streak}d`,  c: '#ff6b6b' },
                              { label: 'Best',   val: `${longest}d`, c: '#f0a500' },
                              { label: '30-Day', val: `${rate}%`,    c: '#4caf50' },
                            ].map(s => (
                              <div key={s.label} style={{ textAlign: 'center', padding: '5px 8px', borderRadius: 10, background: s.c + '12' }}>
                                <p style={{ color: s.c, fontWeight: '800', margin: 0, fontSize: '0.85rem' }}>{s.val}</p>
                                <p style={{ color: theme.subtext, margin: 0, fontSize: '0.62rem' }}>{s.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ color: theme.subtext, fontSize: '0.7rem', fontWeight: '600' }}>
                              Weekly Goal ({streak}/{h.goal || 7} days)
                            </span>
                            <span style={{ color, fontSize: '0.7rem', fontWeight: '700' }}>{goalPct}%</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 4, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                            <div style={{ width: `${goalPct}%`, height: '100%', background: `linear-gradient(90deg,${color},${color}bb)`, borderRadius: 4, transition: 'width 0.8s' }} />
                          </div>
                        </div>

                        {/* 30-day heatmap */}
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {Array.from({ length: 30 }, (_, i) => {
                            const d = new Date(); d.setDate(d.getDate() - (29 - i));
                            const ds   = d.toISOString().split('T')[0];
                            const done = h.completedDates.includes(ds);
                            return <div key={i} title={ds} style={{ width: isMobile ? 10 : 12, height: isMobile ? 10 : 12, borderRadius: 3, background: done ? color : theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }} />;
                          })}
                        </div>
                        <p style={{ color: theme.subtext, fontSize: '0.68rem', margin: '5px 0 0' }}>Last 30 days</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}