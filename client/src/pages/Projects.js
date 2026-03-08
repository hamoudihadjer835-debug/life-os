import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { getProjects, createProject, deleteProject, addTask, updateTaskStatus, deleteTask } from '../services/api';

const COLUMNS = [
  { id: 'todo',       label: 'To Do',      color: '#7c6fcd', bg: 'rgba(124,111,205,0.08)' },
  { id: 'inprogress', label: 'In Progress', color: '#f0a500', bg: 'rgba(240,165,0,0.08)'   },
  { id: 'done',       label: 'Done',        color: '#4caf50', bg: 'rgba(76,175,80,0.08)'   },
];

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { low: '#4caf50', medium: '#f0a500', high: '#ff6b6b' };
const PRIORITY_BG     = { low: 'rgba(76,175,80,0.12)', medium: 'rgba(240,165,0,0.12)', high: 'rgba(255,107,107,0.12)' };

const LABELS = [
  { id: 'design',  label: 'Design',  color: '#a855f7' },
  { id: 'dev',     label: 'Dev',     color: '#00bcd4' },
  { id: 'bug',     label: 'Bug',     color: '#ff6b6b' },
  { id: 'feature', label: 'Feature', color: '#4caf50' },
  { id: 'review',  label: 'Review',  color: '#f0a500' },
  { id: 'urgent',  label: 'Urgent',  color: '#ff4444' },
];

const ColIcon = ({ id, size = 16 }) => {
  if (id === 'todo')       return <span style={{ color: '#7c6fcd' }}>{Icons.task(size)}</span>;
  if (id === 'inprogress') return <span style={{ color: '#f0a500' }}>{Icons.flame(size)}</span>;
  return <span style={{ color: '#4caf50' }}>{Icons.check(size)}</span>;
};

export default function Projects() {
  const [projects, setProjects]             = useState([]);
  const [activeProject, setActiveProject]   = useState(null);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showTaskForm, setShowTaskForm]     = useState(false);
  const [showSidebar, setShowSidebar]       = useState(false);
  const [taskForm, setTaskForm]             = useState({ title: '', description: '', priority: 'medium', dueDate: '', labels: [] });
  const [draggedTask, setDraggedTask]       = useState(null);
  const [dragOverCol, setDragOverCol]       = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isMobile, setIsMobile]             = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet]             = useState(window.innerWidth < 1024);
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
    if (res.data.length > 0 && !activeProject) setActiveProject(res.data[0]);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    const res = await createProject({ title: newProjectTitle });
    setProjects([...projects, res.data]);
    setActiveProject(res.data);
    setNewProjectTitle('');
    setShowSidebar(false);
  };

  const handleDeleteProject = async (id) => {
    await deleteProject(id);
    const updated = projects.filter(p => p._id !== id);
    setProjects(updated);
    setActiveProject(updated.length > 0 ? updated[0] : null);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const res = await addTask(activeProject._id, taskForm);
    setActiveProject(res.data);
    setProjects(projects.map(p => p._id === res.data._id ? res.data : p));
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', labels: [] });
    setShowTaskForm(false);
  };

  const handleDeleteTask = async (taskId) => {
    const res = await deleteTask(activeProject._id, taskId);
    setActiveProject(res.data);
    setProjects(projects.map(p => p._id === res.data._id ? res.data : p));
  };

  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragOver  = (e, colId) => { e.preventDefault(); setDragOverCol(colId); };
  const handleDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) { setDraggedTask(null); setDragOverCol(null); return; }
    const res = await updateTaskStatus(activeProject._id, draggedTask._id, status);
    setActiveProject(res.data);
    setProjects(projects.map(p => p._id === res.data._id ? res.data : p));
    setDraggedTask(null);
    setDragOverCol(null);
  };

  const toggleLabel = (id) => {
    setTaskForm(f => ({
      ...f,
      labels: f.labels.includes(id) ? f.labels.filter(l => l !== id) : [...f.labels, id]
    }));
  };

  const getTasksByStatus = (status) => {
    let tasks = activeProject?.tasks.filter(t => t.status === status) || [];
    if (searchQuery) tasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterPriority !== 'all') tasks = tasks.filter(t => t.priority === filterPriority);
    return tasks;
  };

  const isOverdue    = (dueDate, status) => dueDate && new Date(dueDate) < new Date() && status !== 'done';
  const totalTasks   = activeProject?.tasks.length || 0;
  const doneTasks    = activeProject?.tasks.filter(t => t.status === 'done').length || 0;
  const todoTasks    = activeProject?.tasks.filter(t => t.status === 'todo').length || 0;
  const doingTasks   = activeProject?.tasks.filter(t => t.status === 'inprogress').length || 0;
  const overdueTasks = activeProject?.tasks.filter(t => isOverdue(t.dueDate, t.status)).length || 0;
  const progress     = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const cardClass = theme.isDark ? 'glass-card' : 'glass-card-light';
  const inp = { width: '100%', padding: '10px 14px', marginBottom: 10, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, boxSizing: 'border-box', fontSize: '0.9rem' };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className={cardClass} style={{ borderRadius: 16, padding: 16 }}>
        <h3 style={{ color: theme.primary, margin: '0 0 14px', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          My Projects
        </h3>
        {projects.map(p => {
          const pDone  = p.tasks.filter(t => t.status === 'done').length;
          const pTotal = p.tasks.length;
          const pPct   = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
          const isActive = activeProject?._id === p._id;
          return (
            <div key={p._id} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                background: isActive ? 'rgba(124,111,205,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #7c6fcd' : '3px solid transparent' }}>
                <div style={{ flex: 1 }} onClick={() => { setActiveProject(p); setShowSidebar(false); }}>
                  <p style={{ color: isActive ? '#7c6fcd' : theme.text, margin: '0 0 4px', fontWeight: isActive ? '700' : '500', fontSize: '0.88rem' }}>{p.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                      <div style={{ width: `${pPct}%`, height: '100%', background: isActive ? '#7c6fcd' : '#4caf50', borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ color: theme.subtext, fontSize: '0.7rem', fontWeight: '600' }}>{pPct}%</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteProject(p._id)}
                  style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', marginLeft: 8 }}>
                  {Icons.trash(12)}
                </button>
              </div>
            </div>
          );
        })}
        <form onSubmit={handleCreateProject} style={{ marginTop: 12 }}>
          <input style={inp} placeholder="New project name..." value={newProjectTitle}
            onChange={e => setNewProjectTitle(e.target.value)} />
          <button type="submit" className="gradient-btn btn-press"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px 0', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem' }}>
            {Icons.add(16)} New Project
          </button>
        </form>
      </div>

      {activeProject && (
        <div className={cardClass} style={{ borderRadius: 16, padding: 16 }}>
          <h3 style={{ color: theme.primary, margin: '0 0 14px', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Project Stats
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
              <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="30" cy="30" r="24" fill="none" stroke={theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="5"/>
                <circle cx="30" cy="30" r="24" fill="none" stroke="url(#projGrad)" strokeWidth="5"
                  strokeLinecap="round" strokeDasharray={`${(progress/100)*150.8} 150.8`}
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
                <defs>
                  <linearGradient id="projGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c6fcd"/><stop offset="100%" stopColor="#a855f7"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <p style={{ color: theme.text, fontWeight: '800', fontSize: '0.9rem', margin: 0 }}>{progress}%</p>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: theme.text, fontWeight: '700', margin: '0 0 2px', fontSize: '0.9rem' }}>{activeProject.title}</p>
              <p style={{ color: theme.subtext, margin: 0, fontSize: '0.75rem' }}>{doneTasks}/{totalTasks} tasks done</p>
            </div>
          </div>
          {[
            { label: 'To Do',       value: todoTasks,    color: '#7c6fcd' },
            { label: 'In Progress', value: doingTasks,   color: '#f0a500' },
            { label: 'Done',        value: doneTasks,    color: '#4caf50' },
            { label: 'Overdue',     value: overdueTasks, color: '#ff6b6b' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
              <span style={{ color: theme.subtext, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: stat.color, display: 'inline-block' }} />
                {stat.label}
              </span>
              <span style={{ color: stat.color, fontWeight: '700', fontSize: '0.88rem' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: theme.bg }}>
      <Navbar />

      {/* Mobile Sidebar Overlay */}
      {isMobile && showSidebar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowSidebar(false)} />
          <div style={{ position: 'relative', width: 280, height: '100%', overflowY: 'auto', background: theme.isDark ? '#0f0f1a' : '#f0f2f5', padding: 16, zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: theme.text, margin: 0, fontWeight: '700' }}>Projects</h3>
              <button onClick={() => setShowSidebar(false)}
                style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}>
                {Icons.x(16)}
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div style={{ padding: isMobile ? '16px' : '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(240,165,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0a500' }}>
              {Icons.projects(22)}
            </div>
            <div>
              <h1 className="gradient-text" style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', lineHeight: 1 }}>Projects</h1>
              <p style={{ color: theme.subtext, margin: 0, fontSize: '0.78rem' }}>{projects.length} projects total</p>
            </div>
          </div>
          {/* Mobile: show sidebar button */}
          {isMobile && (
            <button onClick={() => setShowSidebar(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(124,111,205,0.12)', color: '#7c6fcd', border: '1px solid rgba(124,111,205,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              {Icons.projects(15)} Projects
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '220px 1fr' : '260px 1fr', gap: 24 }}>

          {/* Sidebar — desktop only */}
          {!isMobile && <SidebarContent />}

          {/* ── Board ── */}
          <div>
            {activeProject ? (
              <>
                {/* Board Header */}
                <div className={cardClass} style={{ borderRadius: 16, padding: isMobile ? '14px' : '16px 20px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ color: theme.text, margin: '0 0 6px', fontWeight: '700', fontSize: isMobile ? '1rem' : '1.2rem' }}>{activeProject.title}</h2>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {COLUMNS.map(col => (
                          <span key={col.id} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 8, fontWeight: '600', background: col.color + '18', color: col.color }}>
                            {getTasksByStatus(col.id).length} {col.label}
                          </span>
                        ))}
                        {overdueTasks > 0 && (
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 8, fontWeight: '600', background: 'rgba(255,107,107,0.12)', color: '#ff6b6b' }}>
                            {overdueTasks} Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {!isMobile && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: 10, color: theme.subtext }}>{Icons.search(13)}</span>
                          <input placeholder="Search tasks..." value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ padding: '7px 12px 7px 30px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, fontSize: '0.82rem', width: 150 }} />
                        </div>
                      )}
                      {!isMobile && (
                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                          style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, fontSize: '0.82rem', cursor: 'pointer' }}>
                          <option value="all">All Priority</option>
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      )}
                      <button onClick={() => setShowTaskForm(!showTaskForm)} className="gradient-btn btn-press"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                        {showTaskForm ? <>{Icons.x(13)} Cancel</> : <>{Icons.add(15)} {isMobile ? 'Add' : 'Add Task'}</>}
                      </button>
                    </div>
                  </div>

                  {/* Mobile search */}
                  {isMobile && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: theme.subtext }}>{Icons.search(13)}</span>
                        <input placeholder="Search tasks..." value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          style={{ padding: '8px 12px 8px 30px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, fontSize: '0.82rem', width: '100%', boxSizing: 'border-box' }} />
                      </div>
                      <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, fontSize: '0.8rem', cursor: 'pointer' }}>
                        <option value="all">All</option>
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}

                  {totalTasks > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: theme.subtext, fontSize: '0.75rem', fontWeight: '600' }}>Overall Progress</span>
                        <span style={{ color: '#7c6fcd', fontSize: '0.75rem', fontWeight: '700' }}>{progress}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#7c6fcd,#a855f7)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Task Form */}
                {showTaskForm && (
                  <div className={`scale-in ${cardClass}`} style={{ borderRadius: 16, padding: isMobile ? 14 : 20, marginBottom: 16, border: '1px solid rgba(124,111,205,0.2)' }}>
                    <h3 style={{ color: theme.text, margin: '0 0 14px', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#7c6fcd' }}>{Icons.add(16)}</span> New Task
                    </h3>
                    <form onSubmit={handleAddTask}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                        <div style={{ gridColumn: '1/-1' }}>
                          <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>Task Title *</label>
                          <input style={inp} placeholder="What needs to be done?" required value={taskForm.title}
                            onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                          <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>Description</label>
                          <input style={inp} placeholder="Add details..." value={taskForm.description}
                            onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>Priority</label>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {PRIORITIES.map(p => (
                              <button key={p} type="button" onClick={() => setTaskForm({ ...taskForm, priority: p })}
                                style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', transition: 'all 0.2s', textTransform: 'capitalize',
                                  background: taskForm.priority === p ? PRIORITY_COLORS[p] : PRIORITY_BG[p],
                                  color: taskForm.priority === p ? '#fff' : PRIORITY_COLORS[p] }}>
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                            {Icons.calendar(13)} Due Date
                          </label>
                          <input style={inp} type="date" value={taskForm.dueDate}
                            onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                          <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Labels</label>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {LABELS.map(lbl => (
                              <button key={lbl.id} type="button" onClick={() => toggleLabel(lbl.id)}
                                style={{ padding: '4px 10px', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s',
                                  background: taskForm.labels.includes(lbl.id) ? lbl.color : lbl.color + '18',
                                  color: taskForm.labels.includes(lbl.id) ? '#fff' : lbl.color }}>
                                {lbl.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button type="submit" className="gradient-btn btn-press"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, padding: '10px 0', justifyContent: 'center', borderRadius: 10, cursor: 'pointer', fontWeight: '600' }}>
                          {Icons.add(15)} Add Task
                        </button>
                        <button type="button" onClick={() => setShowTaskForm(false)}
                          style={{ flex: 1, padding: '10px 0', background: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: theme.text, border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: '600' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Kanban Board */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 16 }}>
                  {COLUMNS.map(col => (
                    <div key={col.id}
                      style={{ borderRadius: 16, padding: 12, minHeight: isMobile ? 'auto' : 380, transition: 'all 0.2s',
                        background: dragOverCol === col.id
                          ? (theme.isDark ? col.color + '18' : col.color + '12')
                          : (theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                        border: dragOverCol === col.id ? `2px dashed ${col.color}` : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
                      onDragOver={e => handleDragOver(e, col.id)}
                      onDrop={() => handleDrop(col.id)}
                      onDragLeave={() => setDragOverCol(null)}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: `2px solid ${col.color}33` }}>
                        <span style={{ color: col.color, fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ColIcon id={col.id} size={14} /> {col.label}
                        </span>
                        <span style={{ background: col.color + '22', color: col.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: '800' }}>
                          {getTasksByStatus(col.id).length}
                        </span>
                      </div>

                      {getTasksByStatus(col.id).map(task => (
                        <div key={task._id} className="drag-card"
                          style={{ background: theme.card, borderRadius: 12, padding: '12px', marginBottom: 10, cursor: 'grab', transition: 'all 0.2s',
                            border: isOverdue(task.dueDate, task.status) ? '1px solid rgba(255,107,107,0.35)' : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                            boxShadow: isOverdue(task.dueDate, task.status) ? '0 0 12px rgba(255,107,107,0.15)' : 'none' }}
                          draggable onDragStart={() => handleDragStart(task)}>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <span style={{ color: theme.text, fontWeight: '600', fontSize: '0.85rem', flex: 1, lineHeight: 1.4, paddingRight: 8 }}>{task.title}</span>
                            <button onClick={() => handleDeleteTask(task._id)}
                              style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: 'none', borderRadius: 6, padding: '3px 5px', cursor: 'pointer', flexShrink: 0 }}>
                              {Icons.trash(12)}
                            </button>
                          </div>

                          {task.description && (
                            <p style={{ color: theme.subtext, fontSize: '0.75rem', margin: '0 0 8px', lineHeight: 1.4 }}>{task.description}</p>
                          )}

                          {task.labels?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                              {task.labels.map(lid => {
                                const lbl = LABELS.find(l => l.id === lid);
                                return lbl ? (
                                  <span key={lid} style={{ padding: '2px 7px', borderRadius: 20, fontSize: '0.65rem', fontWeight: '700', background: lbl.color + '22', color: lbl.color }}>
                                    {lbl.label}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 8, fontWeight: '700',
                              background: PRIORITY_BG[task.priority], color: PRIORITY_COLORS[task.priority] }}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span style={{ fontSize: '0.68rem', color: isOverdue(task.dueDate, task.status) ? '#ff6b6b' : theme.subtext, display: 'flex', alignItems: 'center', gap: 3, fontWeight: '600' }}>
                                {Icons.calendar(11)}
                                {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                {isOverdue(task.dueDate, task.status) && <span style={{ color: '#ff6b6b' }}>{Icons.warning(11)}</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {getTasksByStatus(col.id).length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: isMobile ? 20 : 40, color: col.color + '55' }}>
                          <ColIcon id={col.id} size={24} />
                          <p style={{ fontSize: '0.75rem', margin: '6px 0 0', color: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)' }}>
                            {dragOverCol === col.id ? 'Drop here!' : 'No tasks'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={cardClass} style={{ borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 300, color: theme.subtext, gap: 14 }}>
                <div style={{ color: '#7c6fcd', opacity: 0.4 }}>{Icons.projects(42)}</div>
                <p style={{ fontSize: '1rem', margin: 0, fontWeight: '600' }}>Create a project to get started!</p>
                <p style={{ fontSize: '0.82rem', margin: 0, color: theme.subtext }}>
                  {isMobile ? 'Tap "Projects" button above' : 'Use the sidebar to add your first project'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}