import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' || user.role === 'recruiter' ? '/admin' : '/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email, password) => {
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Logged in as ${user.name}`);
      navigate(user.role === 'admin' || user.role === 'recruiter' ? '/admin' : '/jobs');
    } catch {
      toast.error('Demo login failed. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.logoMark}>◈</div>
          <h1 style={styles.heroTitle}>Find your next<br /><span style={{ color: 'var(--accent)' }}>great role.</span></h1>
          <p style={styles.heroSub}>Smart job matching based on your designation & skills. No noise, just the right opportunities.</p>
          <div style={styles.featureList}>
            {['Role-based job visibility', 'Apply in one click', 'Track application status', 'Admin posting dashboard'].map(f => (
              <div key={f} style={styles.feature}>
                <span style={styles.featureDot}>✦</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formBox} className="fade-up">
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Sign in</h2>
            <p style={styles.formSub}>Welcome back to HireBridge</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email" className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Signing in...</> : 'Sign in →'}
            </button>
          </form>

          <div style={styles.dividerRow}>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ color: 'var(--muted)', fontSize: 12, padding: '0 12px' }}>or try demo</span>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <div style={styles.demoButtons}>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
              onClick={() => demoLogin('seeker@demo.com', 'demo1234')}>
              👤 Job Seeker
            </button>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
              onClick={() => demoLogin('recruiter@demo.com', 'demo1234')}>
              🏢 Recruiter
            </button>
          </div>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 60, position: 'relative', overflow: 'hidden',
  },
  leftContent: { position: 'relative', zIndex: 1, maxWidth: 440 },
  logoMark: { fontSize: 40, color: 'var(--accent)', marginBottom: 32, display: 'block' },
  heroTitle: { fontFamily: "'Syne', sans-serif", fontSize: 48, fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 20 },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 36 },
  featureList: { display: 'flex', flexDirection: 'column', gap: 14 },
  feature: { display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  featureDot: { color: 'var(--accent)', fontSize: 10 },
  right: {
    width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 40, background: 'var(--surface)',
  },
  formBox: { width: '100%', maxWidth: 380 },
  formHeader: { marginBottom: 32 },
  formTitle: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 },
  formSub: { color: 'var(--muted)', fontSize: 14 },
  dividerRow: { display: 'flex', alignItems: 'center', margin: '24px 0' },
  demoButtons: { display: 'flex', gap: 8, marginBottom: 24 },
  switchText: { textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 8 },
};
