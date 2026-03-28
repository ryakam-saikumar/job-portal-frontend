import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TYPE_LABELS = { full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', remote: 'Remote', internship: 'Internship' };

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    axios.get(`${API}/jobs/${id}`)
      .then(r => setJob(r.data))
      .catch(() => { toast.error('Job not found'); navigate('/jobs'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await axios.post(`${API}/applications/${id}`, { coverLetter });
      setJob(prev => ({ ...prev, hasApplied: true, applicationsCount: prev.applicationsCount + 1 }));
      setShowModal(false);
      toast.success('Application submitted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (sal) => {
    if (!sal?.min && !sal?.max) return 'Not disclosed';
    const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n;
    return sal.min && sal.max ? `₹${fmt(sal.min)} – ₹${fmt(sal.max)} per annum` : sal.min ? `₹${fmt(sal.min)}+ per annum` : `Up to ₹${fmt(sal.max)} per annum`;
  };

  if (loading) return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px' }}>
      <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
    </div>
  );

  if (!job) return null;

  const isAdmin = user?.role === 'admin' || user?.role === 'recruiter';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: 60 }}>
      {/* Back */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div className="container">
          <Link to="/jobs" style={{ fontSize: 14, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to jobs
          </Link>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        <div style={styles.layout}>
          {/* Main Content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Job Header Card */}
            <div className="card" style={{ padding: 36, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                    background: `hsl(${job.company.charCodeAt(0) * 5 % 360}, 65%, 92%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, fontWeight: 800,
                    color: `hsl(${job.company.charCodeAt(0) * 5 % 360}, 50%, 40%)`
                  }}>
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>{job.title}</h1>
                    <p style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 500 }}>{job.company}</p>
                  </div>
                </div>
                {job.hasApplied ? (
                  <div style={styles.appliedBadge}>✅ Already Applied</div>
                ) : !isAdmin ? (
                  <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
                    Apply Now →
                  </button>
                ) : null}
              </div>

              {/* Quick stats row */}
              <div style={styles.statsRow}>
                <StatItem icon="📍" label="Location" value={job.location} />
                <StatItem icon="⏱" label="Job Type" value={TYPE_LABELS[job.type]} />
                <StatItem icon="💰" label="Salary" value={formatSalary(job.salary)} />
                <StatItem icon="🎯" label="Experience" value={`${job.experienceRequired?.min}–${job.experienceRequired?.max} years`} />
                <StatItem icon="📁" label="Category" value={job.category} />
                <StatItem icon="👥" label="Applicants" value={job.applicationsCount} />
              </div>
            </div>

            {/* Description */}
            <div className="card" style={{ padding: 36, marginBottom: 24 }}>
              <h2 style={styles.sectionTitle}>Job Description</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 15 }}>{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="card" style={{ padding: 36, marginBottom: 24 }}>
                <h2 style={styles.sectionTitle}>Requirements</h2>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {job.requirements.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15 }}>
                      <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}>→</span>
                      <span style={{ color: 'var(--muted)' }}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills Required */}
            {job.skills?.length > 0 && (
              <div className="card" style={{ padding: 36 }}>
                <h2 style={styles.sectionTitle}>Required Skills</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {job.skills.map(s => (
                    <span key={s} style={styles.skillChip}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside style={styles.sidebar}>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--ink)' }}>
                TARGET DESIGNATIONS
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.targetDesignations?.map(d => (
                  <span key={d} className="badge badge-dark" style={{ fontSize: 11 }}>{d.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--ink)' }}>POSTED BY</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {job.postedBy?.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{job.postedBy?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{job.postedBy?.email}</div>
                </div>
              </div>
            </div>

            {job.deadline && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>APPLICATION DEADLINE</h3>
                <p style={{ fontSize: 15, fontWeight: 600, color: new Date(job.deadline) < new Date() ? 'var(--danger)' : 'var(--success)' }}>
                  {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}

            {!isAdmin && !job.hasApplied && (
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={() => setShowModal(true)}>
                Apply for this Role →
              </button>
            )}
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} className="card" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Apply for {job.title}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>at {job.company}</p>
            <div className="form-group">
              <label className="form-label">Cover Letter <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
              <textarea className="form-input" style={{ minHeight: 140 }}
                placeholder={`Tell ${job.company} why you're a great fit for this role...`}
                value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleApply} disabled={applying}>
                {applying ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting...</> : '🚀 Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--ink)' }}>
        {icon} {value}
      </span>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', gap: 28, alignItems: 'flex-start' },
  sidebar: { width: 280, flexShrink: 0, position: 'sticky', top: 80 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', padding: '20px 0 0', borderTop: '1px solid var(--border)' },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 20 },
  skillChip: { padding: '7px 14px', background: 'var(--ink)', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500 },
  appliedBadge: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#e6f7f0', color: 'var(--success)', borderRadius: 10, fontWeight: 600, fontSize: 14 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 },
  modal: { width: '100%', maxWidth: 520, padding: 36, animation: 'fadeUp 0.2s ease' },
};
