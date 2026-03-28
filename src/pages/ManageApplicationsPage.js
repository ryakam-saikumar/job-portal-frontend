import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
const STATUS_CONFIG = {
  pending:     { label: 'Pending',     badge: 'badge-yellow', icon: '⏳' },
  reviewed:    { label: 'Reviewed',    badge: 'badge-blue',   icon: '👀' },
  shortlisted: { label: 'Shortlisted', badge: 'badge-green',  icon: '🌟' },
  rejected:    { label: 'Rejected',    badge: 'badge-red',    icon: '❌' },
  hired:       { label: 'Hired',       badge: 'badge-dark',   icon: '🏆' },
};

const DESIG_LABELS = {
  fresher: 'Fresher', junior_developer: 'Jr Dev', mid_developer: 'Mid Dev',
  senior_developer: 'Sr Dev', lead: 'Lead', manager: 'Manager',
  director: 'Director', executive: 'Executive', designer: 'Designer',
  data_scientist: 'Data Scientist', devops: 'DevOps', qa_engineer: 'QA', product_manager: 'PM'
};

export default function ManageApplicationsPage() {
  const { jobId } = useParams();
  const { API } = useAuth();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/applications/job/${jobId}`),
      axios.get(`${API}/jobs/${jobId}`)
    ]).then(([apps, j]) => {
      setApplications(apps.data);
      setJob(j.data);
    }).catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusUpdate = async (appId, status) => {
    setUpdating(true);
    try {
      const { data } = await axios.put(`${API}/applications/${appId}/status`, { status, notes });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: data.status, notes: data.notes } : a));
      if (selected?._id === appId) setSelected(prev => ({ ...prev, status: data.status }));
      toast.success(`Application marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);
  const counts = applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: 60 }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container">
          <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            ← Back to Dashboard
          </Link>
          <h1 style={styles.headerTitle}>{job?.title || 'Applications'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{job?.company} · {applications.length} total applicants</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        {/* Status Summary */}
        <div style={styles.summaryRow}>
          {['all', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                ...styles.summaryBtn,
                background: filter === s ? 'var(--ink)' : 'white',
                color: filter === s ? 'white' : 'var(--muted)',
                borderColor: filter === s ? 'var(--ink)' : 'var(--border)',
              }}>
              {s === 'all' ? `All (${applications.length})` : `${STATUS_CONFIG[s]?.icon} ${STATUS_CONFIG[s]?.label} (${counts[s] || 0})`}
            </button>
          ))}
        </div>

        <div style={styles.layout}>
          {/* Applicants List */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card" style={{ padding: 20, height: 90 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: 14, width: '45%', marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 12, width: '30%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No applications {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
                <p>Applications will appear here as candidates apply.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map((app, i) => {
                  const s = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                  const a = app.applicant;
                  const isSelected = selected?._id === app._id;
                  return (
                    <div key={app._id} className="card"
                      style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s', border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)', animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}
                      onClick={() => { setSelected(app); setNotes(app.notes || ''); }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        {/* Avatar */}
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                          {a?.name?.charAt(0)}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{a?.name}</div>
                              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{a?.email}</div>
                            </div>
                            <span className={`badge ${s.badge}`}>{s.icon} {s.label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                            <span className="badge badge-dark" style={{ fontSize: 11 }}>{DESIG_LABELS[a?.designation] || a?.designation}</span>
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>⏱ {a?.experience}yr exp</span>
                            {a?.location && <span style={{ fontSize: 12, color: 'var(--muted)' }}>📍 {a?.location}</span>}
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                              Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          {/* Skills preview */}
                          {a?.skills?.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                              {a.skills.slice(0, 4).map(sk => <span key={sk} className="tag" style={{ fontSize: 11 }}>{sk}</span>)}
                              {a.skills.length > 4 && <span className="tag" style={{ fontSize: 11 }}>+{a.skills.length - 4}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <aside style={styles.detailPanel}>
              <div className="card" style={{ padding: 28, position: 'sticky', top: 80 }}>
                {/* Applicant Header */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>
                    {selected.applicant?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>{selected.applicant?.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>{selected.applicant?.email}</p>
                  </div>
                </div>

                {/* Profile details */}
                <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <Detail label="Designation" value={DESIG_LABELS[selected.applicant?.designation] || selected.applicant?.designation} />
                  <Detail label="Experience" value={`${selected.applicant?.experience} years`} />
                  <Detail label="Location" value={selected.applicant?.location || 'Not specified'} />
                </div>

                {/* Skills */}
                {selected.applicant?.skills?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={styles.detailLabel}>Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {selected.applicant.skills.map(s => <span key={s} style={{ padding: '4px 10px', background: 'var(--ink)', color: 'white', borderRadius: 6, fontSize: 12 }}>{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {selected.coverLetter && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={styles.detailLabel}>Cover Letter</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginTop: 6, padding: '12px', background: 'var(--surface)', borderRadius: 8 }}>
                      {selected.coverLetter}
                    </p>
                  </div>
                )}

                {/* Bio */}
                {selected.applicant?.bio && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={styles.detailLabel}>About</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginTop: 6 }}>{selected.applicant.bio}</p>
                  </div>
                )}

                <hr className="divider" />

                {/* Status Update */}
                <p style={styles.detailLabel}>Update Status</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, marginBottom: 16 }}>
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} className="btn btn-sm"
                      style={{
                        background: selected.status === s ? 'var(--ink)' : 'var(--surface-2)',
                        color: selected.status === s ? 'white' : 'var(--muted)',
                        border: 'none', textTransform: 'capitalize',
                      }}
                      onClick={() => handleStatusUpdate(selected._id, s)} disabled={updating}>
                      {STATUS_CONFIG[s]?.icon} {STATUS_CONFIG[s]?.label}
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Internal Notes</label>
                  <textarea className="form-input" style={{ minHeight: 80 }}
                    placeholder="Private notes visible only to recruiters..."
                    value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 8 }}
                  onClick={() => handleStatusUpdate(selected._id, selected.status)} disabled={updating}>
                  💾 Save Notes
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}

const styles = {
  header: { background: 'var(--ink)', padding: '36px 0 28px' },
  headerTitle: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 4 },
  summaryRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  summaryBtn: { padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' },
  layout: { display: 'flex', gap: 24, alignItems: 'flex-start' },
  detailPanel: { width: 320, flexShrink: 0 },
  detailLabel: { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
};
