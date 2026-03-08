import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { getNotes, createNote, updateNote, deleteNote } from '../services/api';

const CATEGORIES = ['General', 'Personal', 'Work', 'Ideas', 'Important'];
const COLORS     = ['#7c6fcd','#a855f7','#4caf50','#f0a500','#ff6b6b','#00bcd4','#e91e63'];

export default function Notes() {
  const { theme } = useTheme();
  const [notes, setNotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterTag, setFilterTag] = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editNote, setEditNote]   = useState(null);
  const [form, setForm]           = useState({ title: '', content: '', category: 'General', tags: '', color: '#7c6fcd', pinned: false });
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try { const res = await getNotes(); setNotes(res.data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    try {
      if (editNote) {
        const res = await updateNote(editNote._id, data);
        setNotes(notes.map(n => n._id === editNote._id ? res.data : n));
      } else {
        const res = await createNote(data);
        setNotes([res.data, ...notes]);
      }
      resetForm();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try { await deleteNote(id); setNotes(notes.filter(n => n._id !== id)); }
    catch (err) { console.error(err); }
  };

  const handlePin = async (note) => {
    try {
      const res = await updateNote(note._id, { ...note, pinned: !note.pinned });
      setNotes(notes.map(n => n._id === note._id ? res.data : n).sort((a,b) => b.pinned - a.pinned));
    } catch (err) { console.error(err); }
  };

  const handleEdit = (note) => {
    setEditNote(note);
    setForm({ title: note.title, content: note.content, category: note.category, tags: note.tags.join(', '), color: note.color, pinned: note.pinned });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ title: '', content: '', category: 'General', tags: '', color: '#7c6fcd', pinned: false });
    setEditNote(null);
    setShowForm(false);
  };

  const allTags  = [...new Set(notes.flatMap(n => n.tags))];
  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === 'All' || n.category === filterCat;
    const matchTag    = !filterTag || n.tags.includes(filterTag);
    return matchSearch && matchCat && matchTag;
  });

  const pinned   = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);
  const cardClass = theme.isDark ? 'glass-card' : 'glass-card-light';

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1px solid ${theme.border}`, background: theme.input,
    color: theme.text, fontSize: '0.9rem', boxSizing: 'border-box',
    outline: 'none', marginBottom: 12,
  };

  const NoteCard = ({ note }) => (
    <div className="card-hover" style={{ borderRadius: 16, padding: isMobile ? '14px' : '20px',
      background: theme.isDark ? 'rgba(26,26,46,0.85)' : 'rgba(255,255,255,0.9)',
      border: `1px solid ${note.color}30`, borderTop: `3px solid ${note.color}`,
      backdropFilter: 'blur(12px)', position: 'relative', transition: 'all 0.2s' }}>

      {note.pinned && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: note.color + '20', color: note.color, borderRadius: 8, padding: '2px 7px', fontSize: '0.65rem', fontWeight: '700' }}>
          📌 Pinned
        </div>
      )}

      <div style={{ marginBottom: 10, paddingRight: note.pinned ? 65 : 0 }}>
        <h3 style={{ color: theme.text, margin: '0 0 6px', fontSize: '0.95rem', fontWeight: '700' }}>{note.title}</h3>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ background: note.color + '20', color: note.color, borderRadius: 6, padding: '2px 7px', fontSize: '0.68rem', fontWeight: '600' }}>
            {note.category}
          </span>
          {note.tags.map(tag => (
            <span key={tag} onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
              style={{ background: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: theme.subtext, borderRadius: 6, padding: '2px 7px', fontSize: '0.65rem', cursor: 'pointer', transition: 'all 0.2s',
                ...(filterTag === tag ? { background: note.color + '20', color: note.color } : {}) }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {note.content && (
        <p style={{ color: theme.subtext, fontSize: '0.83rem', margin: '0 0 12px', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {note.content}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: theme.subtext, fontSize: '0.7rem' }}>
          {new Date(note.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => handlePin(note)} title={note.pinned ? 'Unpin' : 'Pin'}
            style={{ padding: '5px 7px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600', transition: 'all 0.2s',
              background: note.pinned ? note.color + '20' : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              color: note.pinned ? note.color : theme.subtext }}>
            📌
          </button>
          <button onClick={() => handleEdit(note)}
            style={{ padding: '5px 9px', borderRadius: 8, border: 'none', cursor: 'pointer', background: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: theme.subtext }}>
            {Icons.edit(13)}
          </button>
          <button onClick={() => handleDelete(note._id)}
            style={{ padding: '5px 9px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b' }}>
            {Icons.trash(13)}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: theme.bg }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: theme.isDark
          ? 'linear-gradient(135deg, rgba(124,111,205,0.15) 0%, rgba(168,85,247,0.1) 100%)'
          : 'linear-gradient(135deg, rgba(124,111,205,0.08) 0%, rgba(168,85,247,0.05) 100%)',
        borderBottom: `1px solid ${theme.border}`,
        padding: isMobile ? '18px 16px 16px' : '28px 28px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ color: theme.text, margin: '0 0 4px', fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: 10 }}>
              Notes
            </h1>
            <p style={{ color: theme.subtext, margin: 0, fontSize: '0.85rem' }}>
              {notes.length} notes · {pinned.length} pinned
            </p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="gradient-btn btn-press"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: isMobile ? '9px 16px' : '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', color: '#fff',
              background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', boxShadow: '0 4px 16px rgba(124,111,205,0.4)' }}>
            {Icons.add(15)} {isMobile ? 'Add' : 'New Note'}
          </button>
        </div>
      </div>

      <div style={{ padding: isMobile ? '14px' : '24px' }}>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.subtext, pointerEvents: 'none' }}>
              {Icons.search(14)}
            </span>
            <input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inp, marginBottom: 0, paddingLeft: 36, background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
          </div>

          {/* Category filters — scroll on mobile */}
          <div style={{ display: 'flex', gap: 6, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'unset', paddingBottom: isMobile ? 4 : 0 }}>
            {['All', ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                style={{ padding: '7px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.78rem', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  background: filterCat === cat ? 'linear-gradient(135deg,#7c6fcd,#a855f7)' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: filterCat === cat ? '#fff' : theme.subtext,
                  boxShadow: filterCat === cat ? '0 4px 12px rgba(124,111,205,0.3)' : 'none',
                  flexShrink: 0 }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Active tag filter */}
        {filterTag && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ color: theme.subtext, fontSize: '0.8rem' }}>Tag:</span>
            <span style={{ background: 'rgba(124,111,205,0.15)', color: '#7c6fcd', borderRadius: 8, padding: '3px 10px', fontSize: '0.78rem', fontWeight: '600' }}>#{filterTag}</span>
            <button onClick={() => setFilterTag('')}
              style={{ background: 'none', border: 'none', color: theme.subtext, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {Icons.x(13)}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: theme.subtext }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 10px' }}>📝</p>
            <p style={{ color: theme.text, fontWeight: '700', fontSize: '1rem', margin: '0 0 6px' }}>No notes found</p>
            <p style={{ color: theme.subtext, fontSize: '0.85rem', margin: 0 }}>Create your first note!</p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: theme.subtext, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📌 Pinned ({pinned.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {pinned.map(note => <NoteCard key={note._id} note={note} />)}
                </div>
              </div>
            )}

            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <h3 style={{ color: theme.subtext, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
                    All Notes ({unpinned.length})
                  </h3>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {unpinned.map(note => <NoteCard key={note._id} note={note} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal Form ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: isMobile ? 12 : 20 }}>
          <div className={cardClass} style={{ width: '100%', maxWidth: 520, borderRadius: 20, padding: isMobile ? '20px 16px' : 32, maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: theme.text, margin: 0, fontWeight: '800', fontSize: '1.1rem' }}>
                {editNote ? '✏️ Edit Note' : '📝 New Note'}
              </h2>
              <button onClick={resetForm}
                style={{ background: 'rgba(255,107,107,0.1)', border: 'none', color: '#ff6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: 8, padding: '5px 7px' }}>
                {Icons.x(18)}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label style={{ color: theme.subtext, fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>TITLE *</label>
              <input placeholder="Note title..." required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} style={inp} />

              <label style={{ color: theme.subtext, fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>CONTENT</label>
              <textarea placeholder="Write your note here..." value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                rows={isMobile ? 4 : 5} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>CATEGORY</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ ...inp, cursor: 'pointer' }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: 6 }}>TAGS (comma separated)</label>
                  <input placeholder="work, idea, important" value={form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })} style={inp} />
                </div>
              </div>

              <label style={{ color: theme.subtext, fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: 10 }}>COLOR</label>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: c, cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: form.color === c ? `0 0 0 3px ${theme.isDark ? '#1a1a2e' : '#fff'}, 0 0 0 5px ${c}` : 'none',
                      transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }} />
                ))}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 18 }}>
                <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: '#7c6fcd' }} />
                <span style={{ color: theme.text, fontSize: '0.88rem', fontWeight: '600' }}>📌 Pin this note</span>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="gradient-btn btn-press"
                  style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: '700', color: '#fff',
                    background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {Icons.check(15)} {editNote ? 'Save Changes' : 'Create Note'}
                </button>
                <button type="button" onClick={resetForm}
                  style={{ padding: '11px 18px', borderRadius: 10, border: `1px solid ${theme.border}`, cursor: 'pointer', fontWeight: '600', background: 'none', color: theme.subtext }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}