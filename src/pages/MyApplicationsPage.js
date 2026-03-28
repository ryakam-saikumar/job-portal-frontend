import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:     { label: 'Pending Review', badge: 'badge-yellow', icon: '⏳' },
  reviewed:    { label: 'Under Review',   badge: 'badge-blue',   icon: '👀' },
  shortlisted: { label: 'Shortlisted',    badge: 'badge-green',  icon: '🌟' },
  rejected:    { label: 'Not Selected',   badge: 'badge-red',    icon: '❌' },
  hired:       { label: 'Hired! 🎉',      badge: 'badge-dark',   icon: '🏆' },
};

const TYPE_LABELS = { full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', remote: 'Remote', internship: 'Internship' };

export default function MyApplicationsPage() {
  const { API } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`${API}/applications/my/applications`)
      .then(r => setApplications(r.data))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const formatSalary = (sal) => {
    if (!sal?.min && !sal?.max) return null;
    const fmt = n => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n;
    return sal.min && sal.max ? `₹${fmt(sal.min)}–${fmt(sal.max)}` : sal.min ? `₹${fmt(sal.min)}+` : `Up to ₹${fmt(sal.max)}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: 60 }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container">
          <h1 style={styles.title}>My Applications</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>
            {applications.length} total applications across {Object.keys(counts).length} statuses
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} className="card" style={styles.statCard}>
              <div style={styles.statIcon}>{v.icon}</div>
              <div style={styles.statNum}>{counts[k] || 0}</div>
              <div style={styles.statLabel}>{v.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={styles.tabs}>
          <button className={`btn btn-sm ${filter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setFilter('all')}>All ({applications.length})</button>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => counts[k] ? (
            <button key={k} className={`btn btn-sm ${filter === k ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setFilter(k)}>
              {v.icon} {v.label} ({counts[k]})
            </button>
          ) : null)}
        </div>

        {loading ? (
          <div style={styles.skeletonList}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card" style={{ padding: 24, height: 100 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 13, width: '30%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>{filter === 'all' ? "No applications yet" : `No ${STATUS_CONFIG[filter]?.label} applications`}</h3>
            <p>{filter === 'all' ? 'Start exploring jobs and apply to ones that match your profile.' : 'Try filtering by a different status.'}</p>
            {filter === 'all' && <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 8 }}>Browse Jobs →</Link>}
          </div>
        ) : (
          <div style={styles.appList}>
            {filtered.map((app, i) => {
              const s = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
              const salary = formatSalary(app.job?.salary);
              return (
                <div key={app._id} className="card" style={{ ...styles.appCard, animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {/* Company Logo */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      background: `hsl(${(app.job?.company || 'A').charCodeAt(0) * 5 % 360}, 65%, 92%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 800,
                      color: `hsl(${(app.job?.company || 'A').charCodeAt(0) * 5 % 360}, 50%, 40%)`
                    }}>
                      {(app.job?.company || 'J').charAt(0)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{app.job?.title}</h3>
                          <p style={{ fontSize: 14, color: 'var(--muted)' }}>{app.job?.company}</p>
                        </div>
                        <span className={`badge ${s.badge}`}>{s.icon} {s.label}</span>
                      </div>

                      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          📍 {app.job?.location}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                          {TYPE_LABELS[app.job?.type]}
                        </span>
                        {salary && <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>{salary}</span>}
                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                          Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {app.status === 'hired' && (
                        <div style={styles.congratsBanner}>
                          🎉 Congratulations! You've been hired for this role!
                        </div>
                      )}
                      {app.status === 'shortlisted' && (
                        <div style={styles.shortlistBanner}>
                          🌟 Great news! You've been shortlisted. Expect to hear from the recruiter soon.
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.appFooter}>
                    <Link to={`/jobs/${app.job?._id}`} className="btn btn-outline btn-sm">View Job</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: { background: 'var(--ink)', padding: '40px 0 32px' },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 8 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 },
  statCard: { padding: 20, textAlign: 'center' },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statNum: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--ink)' },
  statLabel: { fontSize: 12, color: 'var(--muted)', marginTop: 4 },
  tabs: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24, padding: '12px 0', borderBottom: '1px solid var(--border)' },
  skeletonList: { display: 'flex', flexDirection: 'column', gap: 16 },
  appList: { display: 'flex', flexDirection: 'column', gap: 16 },
  appCard: { padding: 24 },
  appFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' },
  congratsBanner: { marginTop: 12, padding: '10px 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: 14, color: '#16a34a', fontWeight: 500 },
  shortlistBanner: { marginTop: 12, padding: '10px 16px', background: '#fefce8', border: '1px solid #fde047', borderRadius: 8, fontSize: 14, color: '#854d0e', fontWeight: 500 },
};
