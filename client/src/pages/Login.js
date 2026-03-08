import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';
import { login } from '../services/api';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email: form.email, password: form.password });
      loginUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '13px 14px 13px 44px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)',
    color: '#fff', fontSize: '0.92rem', boxSizing: 'border-box', outline: 'none',
    transition: 'border 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f0f1a' }}>

      {/* ── Left Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #13132a 0%, #1a1a3e 50%, #0f0f1a 100%)' }}>

        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,111,205,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48, position: 'relative' }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(124,111,205,0.5)' }}>
            {Icons.logo(28)}
          </div>
          <span style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LifeOS</span>
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 52, position: 'relative' }}>
          <h2 style={{ color: '#fff', fontSize: '1.9rem', fontWeight: '800', margin: '0 0 12px', lineHeight: 1.2 }}>
            Your all-in-one<br/>
            <span style={{ background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>life management</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            Track habits, manage projects,<br/>and take control of your finances.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320, position: 'relative' }}>
          {[
            { icon: Icons.finance(18),  color: '#4caf50', title: 'Track your finances',  desc: 'Income, expenses & budget goals'    },
            { icon: Icons.projects(18), color: '#f0a500', title: 'Manage projects',       desc: 'Kanban boards & task tracking'      },
            { icon: Icons.habits(18),   color: '#7c6fcd', title: 'Build habits',          desc: 'Streaks, goals & progress tracking' },
            { icon: Icons.sun(18),      color: '#00bcd4', title: 'Dark & Light mode',     desc: 'Comfortable for any time of day'    },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: f.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <p style={{ color: '#fff', margin: 0, fontWeight: '700', fontSize: '0.85rem' }}>{f.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: '0.72rem' }}>{f.desc}</p>
              </div>
              <div style={{ marginLeft: 'auto', color: '#7c6fcd', flexShrink: 0 }}>{Icons.check(14)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px',
        background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: '100%' }}>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ color: '#fff', margin: '0 0 6px', fontSize: '2rem', fontWeight: '800' }}>Welcome back</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.88rem' }}>Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 10, color: '#ff6b6b', fontSize: '0.85rem', fontWeight: '600', marginBottom: 20 }}>
              <span style={{ flexShrink: 0 }}>{Icons.warning(15)}</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6, letterSpacing: '0.3px' }}>EMAIL</label>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}>
                {Icons.info(16)}
              </span>
              <input type="email" placeholder="you@example.com" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(124,111,205,0.6)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6, letterSpacing: '0.3px' }}>PASSWORD</label>
            <div style={{ position: 'relative', marginBottom: 28 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}>
                {Icons.lock(16)}
              </span>
              <input type={showPw ? 'text' : 'password'} placeholder="Your password" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,111,205,0.6)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPw ? Icons.x(15) : Icons.check(15)}
              </button>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
                background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', color: '#fff',
                boxShadow: '0 4px 20px rgba(124,111,205,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Signing in...</>
                : <>{Icons.arrowRight(16)} Sign In</>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.88rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#a855f7', fontWeight: '700', textDecoration: 'none' }}>Create one free</Link>
          </p>

          <div style={{ marginTop: 40, padding: '16px', borderRadius: 12, background: 'rgba(124,111,205,0.06)', border: '1px solid rgba(124,111,205,0.12)' }}>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
              {[
                { icon: Icons.lock(13),  label: 'Secure & Private' },
                { icon: Icons.check(13), label: 'No Ads'           },
                { icon: Icons.star(13),  label: 'Always Free'      },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
                  <span style={{ color: '#7c6fcd' }}>{item.icon}</span> {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { outline: none; border-color: rgba(124,111,205,0.6) !important; }
      `}</style>
    </div>
  );
}