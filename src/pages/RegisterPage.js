import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DESIGNATIONS = [
  { value: 'fresher', label: '🌱 Fresher' },
  { value: 'junior_developer', label: '💻 Junior Developer' },
  { value: 'mid_developer', label: '🔧 Mid-level Developer' },
  { value: 'senior_developer', label: '🚀 Senior Developer' },
  { value: 'lead', label: '🎯 Tech Lead' },
  { value: 'manager', label: '📋 Manager' },
  { value: 'director', label: '🏆 Director' },
  { value: 'executive', label: '👔 Executive (C-Suite)' },
  { value: 'designer', label: '🎨 Designer' },
  { value: 'data_scientist', label: '📊 Data Scientist' },
  { value: 'devops', label: '⚙️ DevOps Engineer' },
  { value: 'qa_engineer', label: '🧪 QA Engineer' },
  { value: 'product_manager', label: '📦 Product Manager' },
];

const ROLES = [
  { value: 'job_seeker', label: '👤 Job Seeker — Looking for opportunities' },
  { value: 'recruiter', label: '🏢 Recruiter — Post jobs for my company' },
  { value: 'admin', label: '⚡ Admin — Full platform access' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'job_seeker', designation: 'fresher',
    experience: 0, location: '', skills: '', bio: ''
  });

  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleNext = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience: Number(form.experience)
      };
      delete payload.confirmPassword;
      const user = await register(payload);
      toast.success(`Welcome to HireBridge, ${user.name}!`);
      navigate(user.role === 'admin' || user.role === 'recruiter' ? '/admin' : '/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container} className="fade-up">
        {/* Header */}
        <div style={styles.header}>
          <Link to="/login" style={styles.logoLink}>
            <span style={{ color: 'var(--accent)', fontSize: 20 }}>◈</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18 }}>HireBridge</span>
          </Link>
          <div style={styles.stepIndicator}>
            <StepDot num={1} current={step} label="Account" />
            <div style={styles.stepLine} />
            <StepDot num={2} current={step} label="Profile" />
          </div>
        </div>

        <div style={styles.formCard} className="card">
          {step === 1 ? (
            <>
              <div style={styles.formHeader}>
                <h2 style={styles.title}>Create your account</h2>
                <p style={styles.sub}>Join thousands of professionals on HireBridge</p>
              </div>
              <form onSubmit={handleNext}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" placeholder="Arjun Sharma"
                    value={form.name} onChange={e => updateForm('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="arjun@company.com"
                    value={form.email} onChange={e => updateForm('email', e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" placeholder="Min. 6 characters"
                      value={form.password} onChange={e => updateForm('password', e.target.value)} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-input" placeholder="Repeat password"
                      value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">I am a...</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ROLES.map(r => (
                      <label key={r.value} style={{ ...styles.roleCard, ...(form.role === r.value ? styles.roleCardActive : {}) }}>
                        <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                          onChange={() => updateForm('role', r.value)} style={{ display: 'none' }} />
                        <span>{r.label}</span>
                        {form.role === r.value && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Continue →
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={styles.formHeader}>
                <h2 style={styles.title}>Complete your profile</h2>
                <p style={styles.sub}>Help us match you with the right opportunities</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Current Designation</label>
                    <select className="form-input" value={form.designation} onChange={e => updateForm('designation', e.target.value)}>
                      {DESIGNATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input type="number" className="form-input" min="0" max="40"
                      value={form.experience} onChange={e => updateForm('experience', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-input" placeholder="Hyderabad, Telangana"
                    value={form.location} onChange={e => updateForm('location', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Skills <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                  <input type="text" className="form-input" placeholder="React, Node.js, MongoDB, TypeScript"
                    value={form.skills} onChange={e => updateForm('skills', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea className="form-input" placeholder="Tell us a bit about yourself..."
                    value={form.bio} onChange={e => updateForm('bio', e.target.value)} style={{ minHeight: 80 }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                    {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Creating account...</> : '🎉 Create Account'}
                  </button>
                </div>
              </form>
            </>
          )}
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 20 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function StepDot({ num, current, label }) {
  const done = current > num;
  const active = current === num;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, transition: 'all 0.3s',
        background: done || active ? 'var(--accent)' : 'var(--border)',
        color: done || active ? 'white' : 'var(--muted)',
      }}>{done ? '✓' : num}</div>
      <span style={{ fontSize: 11, color: active ? 'var(--ink)' : 'var(--muted)', fontWeight: active ? 600 : 400 }}>{label}</span>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  container: { width: '100%', maxWidth: 560 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  logoLink: { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink)' },
  stepIndicator: { display: 'flex', alignItems: 'center', gap: 8 },
  stepLine: { width: 40, height: 2, background: 'var(--border)', borderRadius: 2 },
  formCard: { padding: 36 },
  formHeader: { marginBottom: 28, textAlign: 'center' },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 },
  sub: { color: 'var(--muted)', fontSize: 14 },
  roleCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border)',
    cursor: 'pointer', fontSize: 14, transition: 'all 0.2s', background: 'white',
  },
  roleCardActive: { borderColor: 'var(--accent)', background: 'var(--accent-soft)', fontWeight: 500 },
};
