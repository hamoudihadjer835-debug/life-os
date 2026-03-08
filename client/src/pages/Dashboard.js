import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { getTransactions, getProjects, getHabits } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects]         = useState([]);
  const [habits, setHabits]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet]         = useState(window.innerWidth < 1024);

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
        setTransactions(t.data);
        setProjects(p.data);
        setHabits(h.data);
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
  const inProgressTasks= projects.reduce((s, p) => s + p.tasks.filter(t => t.status === 'inprogress').length, 0);
  const taskProgress   = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const habitsProgress = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const bestStreak     = habits.reduce((max, h) => {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(d); date.setDate(date.getDate() - i);
      if (h.completedDates.includes(date.toISOString().split('T')[0])) streak++;
      else if (i > 0) break;
    }
    return Math.max(max, streak);
  }, 0);

  const recentTransactions = [...transactions].slice(0, 5);
  const recentTasks        = projects.flatMap(p => p.tasks.map(t => ({ ...t, projectTitle: p.title }))).slice(0, 5);
  const cardClass          = theme.isDark ? 'glass-card' : 'glass-card-light';

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const overallScore = loading ? 0 : Math.min(100, Math.round(
    (habitsProgress * 0.4) + (taskProgress * 0.4) + (balance >= 0 ? 20 : 0)
  ));

  const SunIcon  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0a500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
  const MoonIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c6fcd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
  const CalIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

  const ProgressBar = ({ value, color }) => (
    <div style={{ background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 8, height: 8, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.8s ease' }} />
    </div>
  );

  const SkeletonCard = () => (
    <div className={cardClass} style={{ padding: 20, borderRadius: 14 }}>
      <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 30, width: '40%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '75%' }} />
    </div>
  );

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: theme.bg }}>
      <Navbar />

      {/* BG Decoration */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,111,205,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -200, left: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />
      </div>

      <div style={{ padding: isMobile ? '16px' : '32px', position: 'relative', zIndex: 1 }}>

        {/* ── Welcome Hero ── */}
        <div className="fade-in" style={{ marginBottom: 24 }}>
          <div style={{
            padding: isMobile ? '20px' : '28px 32px', borderRadius: 20,
            background: theme.isDark
              ? 'linear-gradient(135deg, rgba(124,111,205,0.18) 0%, rgba(168,85,247,0.10) 50%, rgba(26,26,46,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(124,111,205,0.12) 0%, rgba(168,85,247,0.07) 50%, rgba(255,255,255,0.95) 100%)',
            border: '1px solid rgba(124,111,205,0.22)',
            boxShadow: theme.isDark ? '0 8px 32px rgba(124,111,205,0.12)' : '0 8px 32px rgba(124,111,205,0.08)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,111,205,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, position: 'relative' }}>
              {/* Left */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {hour < 17 ? <SunIcon /> : <MoonIcon />}
                  <span style={{ color: theme.subtext, fontSize: '0.92rem', fontWeight: '500' }}>{greeting}</span>
                </div>
                <h2 className="gradient-text" style={{ margin: '0 0 8px', fontSize: isMobile ? '1.7rem' : '2.2rem', fontWeight: '800', lineHeight: 1.1 }}>
                  {user?.name}
                </h2>
                <p style={{ color: theme.subtext, margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalIcon />
                  {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Right: Score */}
              {!loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20, flexWrap: 'wrap' }}>
                  {/* Circular Score */}
                  <div style={{ textAlign: 'center', padding: '14px 18px', background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 16, border: '1px solid rgba(124,111,205,0.18)' }}>
                    <div style={{ position: 'relative', width: 68, height: 68, margin: '0 auto 8px' }}>
                      <svg width="68" height="68" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="36" cy="36" r="30" fill="none" stroke={theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="6"/>
                        <circle cx="36" cy="36" r="30" fill="none" stroke="url(#scoreGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(overallScore/100)*188.5} 188.5`} style={{ transition: 'stroke-dasharray 1s ease' }}/>
                        <defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7c6fcd"/><stop offset="100%" stopColor="#a855f7"/></linearGradient></defs>
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                        <p style={{ color: theme.text, fontWeight: '800', fontSize: '1.1rem', margin: 0, lineHeight: 1 }}>{overallScore}</p>
                      </div>
                    </div>
                    <p style={{ color: theme.subtext, fontSize: '0.7rem', margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Score</p>
                  </div>

                  {/* Mini Progress Bars */}
                  {!isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { icon: Icons.habits(14),  label: 'Habits',  value: `${completedToday}/${habits.length}`, color: '#7c6fcd', pct: habitsProgress },
                        { icon: Icons.task(14),    label: 'Tasks',   value: `${doneTasks}/${totalTasks}`,         color: '#f0a500', pct: taskProgress  },
                        { icon: Icons.finance(14), label: 'Balance', value: `$${balance.toFixed(0)}`,             color: balance >= 0 ? '#4caf50' : '#ff6b6b', pct: balance >= 0 ? 100 : 0 },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: item.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ color: theme.subtext, fontSize: '0.75rem', fontWeight: '600' }}>{item.label}</span>
                              <span style={{ color: item.color, fontSize: '0.75rem', fontWeight: '700' }}>{item.value}</span>
                            </div>
                            <div style={{ height: 5, borderRadius: 4, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                              <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 4, transition: 'width 1s ease' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Top Stats ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Balance',      value: `$${balance.toFixed(0)}`,            icon: Icons.wallet(20), color: balance >= 0 ? '#4caf50' : '#ff6b6b', sub: `+$${totalIncome.toFixed(0)} income`           },
              { label: 'Total Tasks',  value: totalTasks,                           icon: Icons.task(20),   color: '#f0a500',                             sub: `${doneTasks} done · ${inProgressTasks} in progress` },
              { label: 'Habits Today', value: `${completedToday}/${habits.length}`, icon: Icons.habits(20), color: '#7c6fcd',                             sub: `${habitsProgress}% completed`                 },
              { label: 'Best Streak',  value: `${bestStreak}`,                      icon: Icons.flame(20),  color: '#ff6b6b',                             sub: 'days in a row'                                },
            ].map(stat => (
              <div key={stat.label} className={`card-hover ${cardClass}`} style={{ padding: isMobile ? '14px' : '20px', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: theme.subtext, margin: '0 0 4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                    <p style={{ color: stat.color, margin: '0 0 4px', fontSize: isMobile ? '1.4rem' : '1.7rem', fontWeight: '800' }}>{stat.value}</p>
                    <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>{stat.sub}</p>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: stat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Progress Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 20, marginBottom: 24 }}>
          {[
            {
              title: 'Finance', titleIcon: Icons.finance(18), titleColor: '#4caf50', path: '/finance',
              content: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: theme.subtext, fontSize: '0.85rem' }}>Income</span>
                    <span style={{ color: '#4caf50', fontWeight: '700' }}>${totalIncome.toFixed(0)}</span>
                  </div>
                  <ProgressBar value={100} color="linear-gradient(90deg,#4caf50,#81c784)" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, marginBottom: 6 }}>
                    <span style={{ color: theme.subtext, fontSize: '0.85rem' }}>Expenses</span>
                    <span style={{ color: '#ff6b6b', fontWeight: '700' }}>${totalExpense.toFixed(0)}</span>
                  </div>
                  <ProgressBar value={totalIncome > 0 ? Math.min((totalExpense/totalIncome)*100,100) : 0} color="linear-gradient(90deg,#ff6b6b,#ff8a80)" />
                  <p style={{ color: theme.subtext, fontSize: '0.78rem', marginTop: 14, marginBottom: 0 }}>{transactions.length} transactions total</p>
                </>
              )
            },
            {
              title: 'Projects', titleIcon: Icons.projects(18), titleColor: '#f0a500', path: '/projects',
              content: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: theme.subtext, fontSize: '0.85rem' }}>Completion</span>
                    <span style={{ color: '#f0a500', fontWeight: '700' }}>{taskProgress}%</span>
                  </div>
                  <ProgressBar value={taskProgress} color="linear-gradient(90deg,#f0a500,#ffcc02)" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
                    {[
                      { label: 'Todo',  value: totalTasks - doneTasks - inProgressTasks, color: '#7c6fcd', bg: 'rgba(124,111,205,0.12)' },
                      { label: 'Doing', value: inProgressTasks, color: '#f0a500', bg: 'rgba(240,165,0,0.12)' },
                      { label: 'Done',  value: doneTasks,       color: '#4caf50', bg: 'rgba(76,175,80,0.12)'  },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center', padding: '10px 8px', background: s.bg, borderRadius: 10 }}>
                        <p style={{ color: s.color, fontWeight: '800', margin: '0 0 2px', fontSize: '1.3rem' }}>{s.value}</p>
                        <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )
            },
            {
              title: 'Habits', titleIcon: Icons.habits(18), titleColor: '#7c6fcd', path: '/habits',
              content: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: theme.subtext, fontSize: '0.85rem' }}>Today's Progress</span>
                    <span style={{ color: '#7c6fcd', fontWeight: '700' }}>{habitsProgress}%</span>
                  </div>
                  <ProgressBar value={habitsProgress} color="linear-gradient(90deg,#7c6fcd,#a855f7)" />
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {habits.length === 0
                      ? <p style={{ color: theme.subtext, fontSize: '0.85rem', margin: 0 }}>No habits yet</p>
                      : habits.slice(0, 3).map(h => (
                        <div key={h._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: theme.text, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#7c6fcd' }}>{Icons.star(13)}</span> {h.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 12, fontWeight: '600',
                            background: h.completedDates.includes(today) ? 'rgba(76,175,80,0.15)' : 'rgba(255,107,107,0.15)',
                            color: h.completedDates.includes(today) ? '#4caf50' : '#ff6b6b' }}>
                            {h.completedDates.includes(today) ? 'Done' : 'Pending'}
                          </span>
                        </div>
                      ))}
                  </div>
                </>
              )
            }
          ].map(card => (
            <div key={card.title} className={cardClass} style={{ padding: isMobile ? '16px' : '24px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: theme.text, margin: 0, fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: card.titleColor }}>{card.titleIcon}</span> {card.title}
                </h3>
                <button style={{ background: 'rgba(124,111,205,0.12)', border: 'none', color: '#7c6fcd', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', padding: '4px 10px', borderRadius: 8 }}
                  onClick={() => navigate(card.path)}>View →</button>
              </div>
              {card.content}
            </div>
          ))}
        </div>

        {/* ── Recent Activity ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
          {[
            {
              title: 'Recent Transactions', titleIcon: Icons.finance(17), titleColor: '#4caf50', path: '/finance',
              content: recentTransactions.length === 0
                ? <p style={{ color: theme.subtext, textAlign: 'center', padding: '20px 0' }}>No transactions yet</p>
                : recentTransactions.map(t => (
                  <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type === 'income' ? 'rgba(76,175,80,0.15)' : 'rgba(255,107,107,0.15)', color: t.type === 'income' ? '#4caf50' : '#ff6b6b' }}>
                        {t.type === 'income' ? Icons.income(15) : Icons.expense(15)}
                      </div>
                      <div>
                        <p style={{ color: theme.text, margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>{t.category}</p>
                        <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span style={{ color: t.type === 'income' ? '#4caf50' : '#ff6b6b', fontWeight: '700', fontSize: '0.9rem' }}>
                      {t.type === 'income' ? '+' : '-'}${t.amount}
                    </span>
                  </div>
                ))
            },
            {
              title: 'Recent Tasks', titleIcon: Icons.task(17), titleColor: '#f0a500', path: '/projects',
              content: recentTasks.length === 0
                ? <p style={{ color: theme.subtext, textAlign: 'center', padding: '20px 0' }}>No tasks yet</p>
                : recentTasks.map(t => (
                  <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <div>
                      <p style={{ color: theme.text, margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>{t.title}</p>
                      <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>{t.projectTitle}</p>
                    </div>
                    <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 10, fontWeight: '600',
                      background: t.status === 'done' ? 'rgba(76,175,80,0.15)' : t.status === 'inprogress' ? 'rgba(240,165,0,0.15)' : 'rgba(124,111,205,0.15)',
                      color: t.status === 'done' ? '#4caf50' : t.status === 'inprogress' ? '#f0a500' : '#7c6fcd' }}>
                      {t.status === 'done' ? 'Done' : t.status === 'inprogress' ? 'Doing' : 'Todo'}
                    </span>
                  </div>
                ))
            }
          ].map(section => (
            <div key={section.title} className={cardClass} style={{ padding: isMobile ? '16px' : '24px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: theme.text, margin: 0, fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: section.titleColor }}>{section.titleIcon}</span> {section.title}
                </h3>
                <button style={{ background: 'rgba(124,111,205,0.12)', border: 'none', color: '#7c6fcd', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', padding: '4px 10px', borderRadius: 8 }}
                  onClick={() => navigate(section.path)}>View all →</button>
              </div>
              {section.content}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}