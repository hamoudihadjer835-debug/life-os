import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';
import { register } from '../services/api';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const passwordStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6)           score++;
    if (pw.length >= 10)          score++;
    if (/[A-Z]/.test(pw))        score++;
    if (/[0-9]/.test(pw))        score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: '',            color: 'transparent' },
      { label: 'Very Weak',   color: '#ff4444'     },
      { label: 'Weak',        color: '#ff6b6b'     },
      { label: 'Fair',        color: '#f0a500'     },
      { label: 'Strong',      color: '#4caf50'     },
      { label: 'Very Strong', color: '#00bcd4'     },
    ];
    return { score, ...levels[score] };
  };

  const strength      = passwordStrength(form.password);
  const passwordMatch = form.confirm && form.password === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      loginUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '13px 14px 13px 44px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)',
    color: '#fff', fontSize: '0.92rem', boxSizing: 'border-box', outline: 'none',
    transition: 'border 0.2s',
  };

  const iconStyle = {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.35)', pointerEvents: 'none'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f0f1a' }}>

      {/* ── Left Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #13132a 0%, #1a1a3e 50%, #0f0f1a 100%)' }}>

        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,111,205,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48, position: 'relative' }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(124,111,205,0.5)' }}>
            {Icons.logo(28)}
          </div>
          <span style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LifeOS</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 52, position: 'relative' }}>
          <h2 style={{ color: '#fff', fontSize: '1.9rem', fontWeight: '800', margin: '0 0 12px', lineHeight: 1.2 }}>
            Start your journey<br/>
            <span style={{ background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>to a better life</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            Track habits, manage projects,<br/>and take control of your finances.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320, position: 'relative' }}>
          {[
            { icon: Icons.habits(18),   color: '#7c6fcd', title: 'Habit Tracking',     desc: 'Build streaks & stay consistent' },
            { icon: Icons.projects(18), color: '#f0a500', title: 'Project Management', desc: 'Kanban boards with due dates'     },
            { icon: Icons.finance(18),  color: '#4caf50', title: 'Finance Control',    desc: 'Track income, expenses & budgets'},
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: f.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <p style={{ color: '#fff', margin: 0, fontWeight: '700', fontSize: '0.88rem' }}>{f.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.75rem' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 48, position: 'relative' }}>
          {[
            { val: '3',    label: 'Modules' },
            { val: '100%', label: 'Free'    },
            { val: '24/7', label: 'Access'  },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '1.4rem', margin: '0 0 2px' }}>{s.val}</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px',
        background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: '100%' }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ color: '#fff', margin: '0 0 6px', fontSize: '1.9rem', fontWeight: '800' }}>Create account</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.88rem' }}>Join LifeOS for free — no credit card needed</p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 10, color: '#ff6b6b', fontSize: '0.85rem', fontWeight: '600', marginBottom: 20 }}>
              <span style={{ flexShrink: 0 }}>{Icons.warning(15)}</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6, letterSpacing: '0.3px' }}>FULL NAME</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <span style={iconStyle}>{Icons.user(16)}</span>
              <input type="text" placeholder="Your full name" required
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                style={inputStyle} />
            </div>

            {/* Email */}
            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6, letterSpacing: '0.3px' }}>EMAIL</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <span style={iconStyle}>{Icons.info(16)}</span>
              <input type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputStyle} />
            </div>

            {/* Password */}
            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6, letterSpacing: '0.3px' }}>PASSWORD</label>
            <div style={{ position: 'relative', marginBottom: 4 }}>
              <span style={iconStyle}>{Icons.lock(16)}</span>
              <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
                {showPw ? Icons.x(15) : Icons.check(15)}
              </button>
            </div>

            {form.password && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, transition: 'background 0.3s',
                      background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <p style={{ color: strength.color, fontSize: '0.72rem', margin: 0, fontWeight: '600' }}>{strength.label}</p>
              </div>
            )}

            {/* Confirm Password */}
            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: 6, letterSpacing: '0.3px' }}>CONFIRM PASSWORD</label>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <span style={iconStyle}>{Icons.lock(16)}</span>
              <input type="password" placeholder="Repeat password" required
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                style={{ ...inputStyle, paddingRight: 44,
                  borderColor: form.confirm ? (passwordMatch ? 'rgba(76,175,80,0.5)' : 'rgba(255,107,107,0.5)') : 'rgba(255,255,255,0.1)' }} />
              {form.confirm && (
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: passwordMatch ? '#4caf50' : '#ff6b6b', pointerEvents: 'none' }}>
                  {passwordMatch ? Icons.check(15) : Icons.x(15)}
                </span>
              )}
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.95rem', marginTop: 4, transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
                background: 'linear-gradient(135deg,#7c6fcd,#a855f7)', color: '#fff',
                boxShadow: '0 4px 20px rgba(124,111,205,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Creating account...</>
                : <>{Icons.arrowRight(16)} Create Account</>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.88rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a855f7', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
          </p>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', margin: '20px 0 0', fontSize: '0.72rem', lineHeight: 1.5 }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
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