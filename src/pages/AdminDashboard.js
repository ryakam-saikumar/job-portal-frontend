import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/admin/stats`),
      axios.get(`${API}/admin/jobs`)
    ]).then(([s, j]) => {
      setStats(s.data);
      setJobs(j.data);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/jobs/${id}`);
      setJobs(prev => prev.filter(j => j._id !== id));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const STATUS_COLORS = { pending: '#f59e0b', reviewed: '#3b82f6', shortlisted: '#10b981', rejected: '#ef4444', hired: '#7c3aed' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: 60 }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <h1 style={styles.headerTitle}>Admin Dashboard</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Manage jobs and applications from one place</p>
            </div>
            <Link to="/admin/post-job" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              + Post New Job
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        {/* Stats Cards */}
        {loading ? (
          <div className="grid-3" style={{ marginBottom: 32 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)}
          </div>
        ) : stats && (
          <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            <StatCard icon="💼" label="Active Jobs" value={stats.totalJobs} color="var(--accent)" />
            <StatCard icon="👤" label="Job Seekers" value={stats.totalUsers} color="var(--accent-2)" />
            <StatCard icon="📋" label="Total Apps" value={stats.totalApplications} color="var(--success)" />
            <StatCard icon="✅" label="Hired" value={stats.applicationsByStatus?.find(s => s._id === 'hired')?.count || 0} color="#7c3aed" />
          </div>
        )}

        {/* Tabs */}
        <div style={{ ...styles.tabs, overflowX: 'auto', paddingBottom: 4 }}>
          {['overview', 'jobs', 'activity'].map(t => (
            <button key={t} className={`btn btn-sm ${activeTab === t ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
              {t === 'overview' ? '📊 Overview' : t === 'jobs' ? '💼 My Jobs' : '🔔 Activity'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid-2">
            {/* Application Status Breakdown */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={styles.cardTitle}>Applications by Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                {stats.applicationsByStatus?.map(s => {
                  const total = stats.totalApplications || 1;
                  const pct = Math.round((s.count / total) * 100);
                  return (
                    <div key={s._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{s._id}</span>
                        <span style={{ color: 'var(--muted)' }}>{s.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: STATUS_COLORS[s._id] || 'var(--muted)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Jobs by Category */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={styles.cardTitle}>Jobs by Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                {stats.jobsByCategory?.map(c => (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface)', borderRadius: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{c._id}</span>
                    <span className="badge badge-dark" style={{ fontSize: 11 }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div>
            {loading ? (
              <div className="grid-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />)}</div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No jobs posted yet</h3>
                <p>Create your first job posting to start receiving applications.</p>
                <Link to="/admin/post-job" className="btn btn-primary" style={{ marginTop: 8 }}>Post First Job →</Link>
              </div>
            ) : (
              <div className="grid-2">
                {jobs.map(job => (
                  <JobCard key={job._id} job={job} showActions
                    onEdit={(id) => navigate(`/admin/post-job/${id}`)}
                    onDelete={handleDelete}
                    onViewApps={(id) => navigate(`/admin/applications/${id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && stats?.recentApplications && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ ...styles.cardTitle, marginBottom: 20 }}>Recent Applications</h3>
            {stats.recentApplications.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>No applications yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {stats.recentApplications.map((app, i) => (
                  <div key={app._id} style={{ ...styles.activityRow, borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {app.applicant?.name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{app.applicant?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>applied for <strong>{app.job?.title}</strong> at {app.job?.company}</div>
                    </div>
                    <span className="badge badge-gray" style={{ fontSize: 11, textTransform: 'capitalize' }}>{app.applicant?.designation?.replace(/_/g, ' ')}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/admin/applications/${app.job?._id}`)}>
                      View →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  header: { background: 'var(--ink)', padding: '40px 0 32px' },
  headerTitle: { fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 6 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 },
  tabs: { display: 'flex', gap: 6, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 12 },
  cardTitle: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--ink)' },
  activityRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' },
};
