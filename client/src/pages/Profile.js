import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { getTransactions, getProjects, getHabits } from '../services/api';

const AVATAR_COLORS = ['#7c6fcd','#a855f7','#4caf50','#f0a500','#ff6b6b','#00bcd4'];

export default function Profile() {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects]         = useState([]);
  const [habits, setHabits]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('overview');
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet]         = useState(window.innerWidth < 1024);

  const [editMode, setEditMode]         = useState(false);
  const [nameVal, setNameVal]           = useState(user?.name || '');
  const [avatarColor, setAvatarColor]   = useState(localStorage.getItem('avatarColor') || '#7c6fcd');
  const [saveMsg, setSaveMsg]           = useState('');

  const [pwForm, setPwForm]             = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg]               = useState('');
  const [pwError, setPwError]           = useState('');
  const [showPw, setShowPw]             = useState({ current: false, newPw: false, confirm: false });

  const [prefs, setPrefs] = useState(() => JSON.parse(localStorage.getItem('userPrefs') || '{"emailNotif":true,"weekStart":"Sun","currency":"USD","defaultView":"dashboard"}'));

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, p, h] = await Promise.all([getTransactions(), getProjects(), getHabits()]);
        setTransactions(t.data); setProjects(p.data); setHabits(h.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const totalIncome    = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense   = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance        = totalIncome - totalExpense;
  const totalTasks     = projects.reduce((s, p) => s + p.tasks.length, 0);
  const doneTasks      = projects.reduce((s, p) => s + p.tasks.filter(t => t.status === 'done').length, 0);
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const bestStreak     = habits.reduce((max, h) => {
    let streak = 0; const d = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(d); date.setDate(date.getDate() - i);
      if (h.completedDates.includes(date.toISOString().split('T')[0])) streak++;
      else if (i > 0) break;
    }
    return Math.max(max, streak);
  }, 0);

  const overallScore = loading ? 0 : Math.min(100, Math.round(
    (habits.length > 0 ? (completedToday / habits.length) * 40 : 0) +
    (totalTasks > 0 ? (doneTasks / totalTasks) * 40 : 0) +
    (balance >= 0 ? 20 : 0)
  ));

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const daysActive  = user?.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / 86400000) : 0;

  const handleSaveProfile = () => {
    localStorage.setItem('avatarColor', avatarColor);
    setSaveMsg('Profile saved!');
    setEditMode(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handlePassword = (e) => {
    e.preventDefault();
    setPwError(''); setPwMsg('');
    if (pwForm.newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    setPwMsg('Password updated successfully!');
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setPwMsg(''), 3000);
  };

  const savePrefs = (newPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem('userPrefs', JSON.stringify(newPrefs));
  };

  const cardClass = theme.isDark ? 'glass-card' : 'glass-card-light';
  const inp = { width: '100%', padding: '11px 14px', marginBottom: 12, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, boxSizing: 'border-box', fontSize: '0.9rem' };

  const tabBtn = (id, label, icon) => (
    <button onClick={() => setActiveTab(id)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '8px 10px' : '8px 16px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: '600', transition: 'all 0.2s',
        background: activeTab === id ? 'linear-gradient(135deg,#7c6fcd,#a855f7)' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        color: activeTab === id ? '#fff' : theme.subtext,
        boxShadow: activeTab === id ? '0 4px 12px rgba(124,111,205,0.35)' : 'none' }}>
      {icon} {isMobile ? '' : label}
    </button>
  );

  const PwInput = ({ field, placeholder }) => (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <input type={showPw[field] ? 'text' : 'password'} placeholder={placeholder}
        value={pwForm[field]} onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })}
        style={{ ...inp, marginBottom: 0, paddingRight: 44 }} />
      <button type="button" onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.subtext, cursor: 'pointer' }}>
        {showPw[field] ? Icons.x(15) : Icons.user(15)}
      </button>
    </div>
  );

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: theme.bg }}>
      <Navbar />

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,111,205,0.18) 0%, rgba(168,85,247,0.12) 50%, rgba(26,26,46,0.95) 100%)',
        borderBottom: `1px solid rgba(124,111,205,0.15)`,
        padding: isMobile ? '20px 16px' : '32px 28px 28px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,111,205,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 14 : 24, position: 'relative', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: isMobile ? 68 : 90, height: isMobile ? 68 : 90, borderRadius: isMobile ? 20 : 26, background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '1.6rem' : '2.2rem', fontWeight: '800', color: '#fff', boxShadow: `0 8px 32px ${avatarColor}50`, border: '3px solid rgba(255,255,255,0.15)' }}>
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div style={{ position: 'absolute', bottom: -6, right: -6, background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', borderRadius: 10, padding: '3px 8px', fontSize: '0.68rem', fontWeight: '800', color: '#fff', border: '2px solid rgba(255,255,255,0.2)' }}>
              {overallScore}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: '#fff', margin: '0 0 4px', fontSize: isMobile ? '1.3rem' : '1.8rem', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 8px', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            {!isMobile && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { icon: Icons.calendar(13), label: `Member since ${memberSince}` },
                  { icon: Icons.flame(13),    label: `${daysActive} days active`    },
                  { icon: Icons.star(13),     label: `Score: ${overallScore}/100`   },
                ].map(item => (
                  <span key={item.label} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{item.icon}</span> {item.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setEditMode(!editMode)} className="btn-press"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '8px 12px' : '9px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', backdropFilter: 'blur(8px)' }}>
              {Icons.edit(14)} {isMobile ? '' : 'Edit Profile'}
            </button>
            <button onClick={logoutUser} className="btn-press"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '8px 12px' : '9px 16px', background: 'rgba(255,107,107,0.15)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
              {Icons.logout(14)} {isMobile ? '' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '14px' : '24px' }}>
        {saveMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 10, marginBottom: 14, color: '#4caf50', fontWeight: '600', fontSize: '0.85rem' }}>
            {Icons.check(16)} {saveMsg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabBtn('overview', 'Overview',     Icons.user(14))}
          {tabBtn('edit',     'Edit Profile', Icons.edit(14))}
          {tabBtn('security', 'Security',     Icons.lock(14))}
          {tabBtn('prefs',    'Preferences',  Icons.star(14))}
        </div>

        {/* ══ TAB: Overview ══ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 10 : 16 }}>
              {[
                { label: 'Balance',      value: `$${balance.toFixed(0)}`,            color: balance >= 0 ? '#4caf50' : '#ff6b6b', icon: Icons.finance(isMobile?18:22), sub: `${transactions.length} transactions` },
                { label: 'Tasks Done',   value: `${doneTasks}/${totalTasks}`,         color: '#f0a500', icon: Icons.task(isMobile?18:22),    sub: `${projects.length} projects`      },
                { label: 'Habits Today', value: `${completedToday}/${habits.length}`, color: '#7c6fcd', icon: Icons.habits(isMobile?18:22), sub: `${bestStreak} day streak`         },
                { label: 'Daily Score',  value: `${overallScore}`,                    color: '#a855f7', icon: Icons.chart(isMobile?18:22),  sub: 'overall performance'              },
              ].map(s => (
                <div key={s.label} className={`${cardClass} card-hover`} style={{ padding: isMobile ? '12px' : '20px 22px', borderRadius: 16, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: theme.subtext, margin: '0 0 4px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                      <p style={{ color: s.color, margin: '0 0 2px', fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: '800' }}>{s.value}</p>
                      <p style={{ color: theme.subtext, margin: 0, fontSize: '0.7rem' }}>{s.sub}</p>
                    </div>
                    <div style={{ width: isMobile ? 34 : 42, height: isMobile ? 34 : 42, borderRadius: 12, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                      {s.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Score */}
            <div className={cardClass} style={{ padding: isMobile ? 18 : 28, borderRadius: 16 }}>
              <h3 style={{ color: theme.text, margin: '0 0 18px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#7c6fcd' }}>{Icons.chart(18)}</span> Overall Performance
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: isMobile ? 16 : 28, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: isMobile ? 110 : 140, height: isMobile ? 110 : 140, margin: '0 auto 12px' }}>
                    <svg width={isMobile ? 110 : 140} height={isMobile ? 110 : 140} viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="70" cy="70" r="58" fill="none" stroke={theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} strokeWidth="10"/>
                      <circle cx="70" cy="70" r="58" fill="none" stroke="url(#profileGrad)" strokeWidth="10"
                        strokeLinecap="round" strokeDasharray={`${(overallScore/100)*364.4} 364.4`}
                        style={{ transition: 'stroke-dasharray 1s ease' }}/>
                      <defs>
                        <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#7c6fcd"/><stop offset="100%" stopColor="#a855f7"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                      <p className="gradient-text" style={{ fontWeight: '900', fontSize: isMobile ? '1.6rem' : '2rem', margin: 0, lineHeight: 1 }}>{overallScore}</p>
                      <p style={{ color: theme.subtext, fontSize: '0.7rem', margin: 0 }}>/ 100</p>
                    </div>
                  </div>
                  <p style={{ color: theme.text, fontWeight: '700', margin: '0 0 4px' }}>
                    {overallScore >= 80 ? 'Excellent!' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Keep going' : 'Just starting'}
                  </p>
                  <p style={{ color: theme.subtext, fontSize: '0.75rem', margin: 0 }}>Daily Performance Score</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Habits',  pct: habits.length > 0 ? Math.round((completedToday/habits.length)*100) : 0, color: '#7c6fcd', weight: '40%', icon: Icons.habits(14)  },
                    { label: 'Tasks',   pct: totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0,            color: '#f0a500', weight: '40%', icon: Icons.task(14)    },
                    { label: 'Finance', pct: balance >= 0 ? 100 : 0,                                                 color: '#4caf50', weight: '20%', icon: Icons.finance(14) },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: theme.text, fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: item.color }}>{item.icon}</span> {item.label}
                          {!isMobile && <span style={{ color: theme.subtext, fontSize: '0.7rem', fontWeight: '400' }}>(weight: {item.weight})</span>}
                        </span>
                        <span style={{ color: item.color, fontWeight: '700' }}>{item.pct}%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 6, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 6, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              {[
                {
                  title: 'Finance Summary', icon: Icons.finance(17), color: '#4caf50',
                  items: [
                    { label: 'Total Income',   val: `$${totalIncome.toFixed(0)}`,  color: '#4caf50' },
                    { label: 'Total Expenses', val: `$${totalExpense.toFixed(0)}`, color: '#ff6b6b' },
                    { label: 'Net Balance',    val: `$${balance.toFixed(0)}`,      color: balance >= 0 ? '#4caf50' : '#ff6b6b' },
                    { label: 'Transactions',   val: transactions.length,            color: '#7c6fcd' },
                  ]
                },
                {
                  title: 'Projects Summary', icon: Icons.projects(17), color: '#f0a500',
                  items: [
                    { label: 'Total Projects', val: projects.length,  color: '#f0a500' },
                    { label: 'Total Tasks',    val: totalTasks,        color: '#7c6fcd' },
                    { label: 'Done',           val: doneTasks,         color: '#4caf50' },
                    { label: 'In Progress',    val: projects.reduce((s,p) => s + p.tasks.filter(t=>t.status==='inprogress').length, 0), color: '#f0a500' },
                  ]
                }
              ].map(section => (
                <div key={section.title} className={cardClass} style={{ padding: isMobile ? 16 : 24, borderRadius: 16 }}>
                  <h3 style={{ color: theme.text, margin: '0 0 14px', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: section.color }}>{section.icon}</span> {section.title}
                  </h3>
                  {section.items.map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                      <span style={{ color: theme.subtext, fontSize: '0.83rem' }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: '700', fontSize: '0.85rem' }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB: Edit Profile ══ */}
        {activeTab === 'edit' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            <div className={cardClass} style={{ padding: isMobile ? 18 : 28, borderRadius: 16 }}>
              <h3 style={{ color: theme.text, margin: '0 0 18px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#7c6fcd' }}>{Icons.user(17)}</span> Personal Info
              </h3>
              <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Full Name</label>
              <input style={inp} value={nameVal} onChange={e => setNameVal(e.target.value)} placeholder="Your name" />
              <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Email</label>
              <input style={{ ...inp, opacity: 0.6, cursor: 'not-allowed' }} value={user?.email || ''} disabled />
              <p style={{ color: theme.subtext, fontSize: '0.75rem', margin: '-4px 0 16px' }}>Email cannot be changed</p>
              <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 10 }}>Avatar Color</label>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {AVATAR_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setAvatarColor(c)}
                    style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: c, cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: avatarColor === c ? `0 0 0 3px ${theme.isDark ? '#1a1a2e' : '#fff'}, 0 0 0 5px ${c}` : 'none',
                      transform: avatarColor === c ? 'scale(1.15)' : 'scale(1)' }} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: avatarColor + '12', border: `1px solid ${avatarColor}30`, marginBottom: 20 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${avatarColor},${avatarColor}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                  {(nameVal || user?.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ color: theme.text, fontWeight: '700', margin: '0 0 2px', fontSize: '0.9rem' }}>{nameVal || user?.name}</p>
                  <p style={{ color: theme.subtext, fontSize: '0.75rem', margin: 0 }}>{user?.email}</p>
                </div>
              </div>
              <button className="gradient-btn btn-press" onClick={handleSaveProfile}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: '600' }}>
                {Icons.check(15)} Save Changes
              </button>
            </div>

            <div className={cardClass} style={{ padding: isMobile ? 18 : 28, borderRadius: 16 }}>
              <h3 style={{ color: theme.text, margin: '0 0 18px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#7c6fcd' }}>{Icons.info(17)}</span> Account Info
              </h3>
              {[
                { label: 'Member Since', val: memberSince },
                { label: 'Days Active',  val: `${daysActive} days` },
                { label: 'Account Type', val: 'Free Plan' },
                { label: 'User ID',      val: user?._id?.slice(-8) || 'N/A' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                  <span style={{ color: theme.subtext, fontSize: '0.83rem' }}>{item.label}</span>
                  <span style={{ color: theme.text, fontWeight: '600', fontSize: '0.83rem' }}>{item.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.15)' }}>
                <p style={{ color: '#ff6b6b', fontWeight: '700', margin: '0 0 6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {Icons.warning(15)} Danger Zone
                </p>
                <p style={{ color: theme.subtext, fontSize: '0.75rem', margin: '0 0 12px' }}>These actions are irreversible</p>
                <button className="btn-press"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 8, cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                  {Icons.trash(13)} Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: Security ══ */}
        {activeTab === 'security' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            <div className={cardClass} style={{ padding: isMobile ? 18 : 28, borderRadius: 16 }}>
              <h3 style={{ color: theme.text, margin: '0 0 18px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#7c6fcd' }}>{Icons.lock(17)}</span> Change Password
              </h3>
              {pwMsg   && <div style={{ padding: '10px 14px', background: 'rgba(76,175,80,0.12)',   border: '1px solid rgba(76,175,80,0.25)',   borderRadius: 10, color: '#4caf50', fontWeight: '600', fontSize: '0.85rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.check(14)} {pwMsg}</div>}
              {pwError && <div style={{ padding: '10px 14px', background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 10, color: '#ff6b6b', fontWeight: '600', fontSize: '0.85rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.warning(14)} {pwError}</div>}
              <form onSubmit={handlePassword}>
                <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>Current Password</label>
                <PwInput field="current" placeholder="Enter current password" />
                <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>New Password</label>
                <PwInput field="newPw" placeholder="Min 6 characters" />
                <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <PwInput field="confirm" placeholder="Repeat new password" />
                <button type="submit" className="gradient-btn btn-press"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: '600', marginTop: 4 }}>
                  {Icons.lock(15)} Update Password
                </button>
              </form>
            </div>
            <div className={cardClass} style={{ padding: isMobile ? 18 : 28, borderRadius: 16 }}>
              <h3 style={{ color: theme.text, margin: '0 0 18px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#7c6fcd' }}>{Icons.info(17)}</span> Security Tips
              </h3>
              {[
                { tip: 'Use a strong password with numbers and symbols', ok: true  },
                { tip: 'Change your password every 3 months',            ok: false },
                { tip: 'Never share your login credentials',             ok: true  },
                { tip: 'Log out on shared devices',                      ok: true  },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                  <span style={{ color: item.ok ? '#4caf50' : '#f0a500', flexShrink: 0, marginTop: 1 }}>{item.ok ? Icons.check(16) : Icons.warning(16)}</span>
                  <span style={{ color: theme.text, fontSize: '0.83rem', lineHeight: 1.5 }}>{item.tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB: Preferences ══ */}
        {activeTab === 'prefs' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            <div className={cardClass} style={{ padding: isMobile ? 18 : 28, borderRadius: 16 }}>
              <h3 style={{ color: theme.text, margin: '0 0 18px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#7c6fcd' }}>{Icons.star(17)}</span> App Preferences
              </h3>

              {/* Dark Mode */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                <div>
                  <p style={{ color: theme.text, margin: '0 0 2px', fontWeight: '600', fontSize: '0.88rem' }}>Dark Mode</p>
                  <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>Toggle light / dark theme</p>
                </div>
                <button onClick={toggleTheme} className="btn-press"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: theme.isDark ? 'rgba(124,111,205,0.15)' : 'rgba(240,165,0,0.12)', color: theme.isDark ? '#7c6fcd' : '#f0a500', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                  {theme.isDark ? <>{Icons.moon(14)} Dark</> : <>{Icons.sun(14)} Light</>}
                </button>
              </div>

              {/* Currency */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                <div>
                  <p style={{ color: theme.text, margin: '0 0 2px', fontWeight: '600', fontSize: '0.88rem' }}>Default Currency</p>
                  <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>Used across Finance page</p>
                </div>
                <select value={prefs.currency} onChange={e => savePrefs({ ...prefs, currency: e.target.value })}
                  style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, fontSize: '0.82rem', cursor: 'pointer' }}>
                  {['USD','EUR','GBP','DZD','SAR'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Week Start */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                <div>
                  <p style={{ color: theme.text, margin: '0 0 2px', fontWeight: '600', fontSize: '0.88rem' }}>Week Starts On</p>
                  <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>For calendar views</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Sun','Mon'].map(d => (
                    <button key={d} onClick={() => savePrefs({ ...prefs, weekStart: d })}
                      style={{ padding: '6px 10px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: '600', fontSize: '0.78rem', transition: 'all 0.2s',
                        background: prefs.weekStart === d ? 'linear-gradient(135deg,#7c6fcd,#a855f7)' : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        color: prefs.weekStart === d ? '#fff' : theme.text }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
                <div>
                  <p style={{ color: theme.text, margin: '0 0 2px', fontWeight: '600', fontSize: '0.88rem' }}>Notifications</p>
                  <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>App alerts & reminders</p>
                </div>
                <button onClick={() => savePrefs({ ...prefs, emailNotif: !prefs.emailNotif })} className="btn-press"
                  style={{ position: 'relative', width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                    background: prefs.emailNotif ? 'linear-gradient(135deg,#7c6fcd,#a855f7)' : theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}>
                  <span style={{ position: 'absolute', top: 3, left: prefs.emailNotif ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>

            <div className={cardClass} style={{ padding: isMobile ? 18 : 28, borderRadius: 16 }}>
              <h3 style={{ color: theme.text, margin: '0 0 18px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#7c6fcd' }}>{Icons.info(17)}</span> About LifeOS
              </h3>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: 20, background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(124,111,205,0.4)' }}>
                  {Icons.logo(28)}
                </div>
                <h2 className="gradient-text" style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: '800' }}>LifeOS</h2>
                <p style={{ color: theme.subtext, margin: '0 0 16px', fontSize: '0.8rem' }}>Your personal life management system</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { label: 'Version',  val: '2.0.0'   },
                    { label: 'Stack',    val: 'MERN'    },
                    { label: 'Frontend', val: 'React'   },
                    { label: 'Backend',  val: 'Express' },
                    { label: 'Database', val: 'MongoDB' },
                    { label: 'Auth',     val: 'JWT'     },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '10px 6px', background: theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 10, textAlign: 'center' }}>
                      <p style={{ color: theme.subtext, margin: '0 0 2px', fontSize: '0.68rem' }}>{item.label}</p>
                      <p style={{ color: '#7c6fcd', margin: 0, fontWeight: '700', fontSize: '0.82rem' }}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}