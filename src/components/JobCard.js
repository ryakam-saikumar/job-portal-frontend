import React from 'react';
import { Link } from 'react-router-dom';

const TYPE_LABELS = {
  full_time: 'Full Time', part_time: 'Part Time',
  contract: 'Contract', remote: 'Remote', internship: 'Internship'
};
const TYPE_COLORS = {
  full_time: 'badge-blue', part_time: 'badge-yellow',
  contract: 'badge-orange', remote: 'badge-green', internship: 'badge-gray'
};
const DESIG_LABELS = {
  all: 'All Levels', fresher: 'Fresher', junior_developer: 'Junior Dev',
  mid_developer: 'Mid Dev', senior_developer: 'Senior Dev', lead: 'Lead',
  manager: 'Manager', director: 'Director', executive: 'Executive',
  designer: 'Designer', data_scientist: 'Data Scientist', devops: 'DevOps',
  qa_engineer: 'QA Engineer', product_manager: 'PM'
};

export default function JobCard({ job, showActions, onEdit, onDelete, onViewApps }) {
  const formatSalary = (sal) => {
    if (!sal?.min && !sal?.max) return null;
    const fmt = (n) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n;
    return sal.min && sal.max ? `₹${fmt(sal.min)} – ₹${fmt(sal.max)}` : sal.min ? `₹${fmt(sal.min)}+` : `Up to ₹${fmt(sal.max)}`;
  };

  const daysAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 30) return `${diff}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const salary = formatSalary(job.salary);

  return (
    <div className="card card-hover" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, transition: 'all 0.25s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `hsl(${job.company.charCodeAt(0) * 5 % 360}, 65%, 92%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: `hsl(${job.company.charCodeAt(0) * 5 % 360}, 50%, 40%)`
            }}>
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{job.company}</div>
            </div>
          </div>
          <Link to={`/jobs/${job._id}`}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4, lineHeight: 1.3 }}
                onMouseOver={e => e.target.style.color = 'var(--accent)'}
                onMouseOut={e => e.target.style.color = 'var(--ink)'}>
              {job.title}
            </h3>
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className={`badge ${TYPE_COLORS[job.type] || 'badge-gray'}`}>
            {TYPE_LABELS[job.type]}
          </span>
          {job.hasApplied && <span className="badge badge-green" style={{ fontSize: 11 }}>✓ Applied</span>}
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>📍</span> {job.location}
        </span>
        {salary && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontWeight: 600 }}>
          <span>💰</span> {salary}
        </span>}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⏱</span> {job.experienceRequired?.min}–{job.experienceRequired?.max}yr exp
        </span>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {job.skills.slice(0, 4).map(s => <span key={s} className="tag">{s}</span>)}
          {job.skills.length > 4 && <span className="tag">+{job.skills.length - 4}</span>}
        </div>
      )}

      {/* Target designations */}
      {job.targetDesignations?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginRight: 2 }}>For:</span>
          {job.targetDesignations.slice(0, 3).map(d => (
            <span key={d} className="badge badge-dark" style={{ fontSize: 10, padding: '2px 7px' }}>
              {DESIG_LABELS[d] || d}
            </span>
          ))}
          {job.targetDesignations.length > 3 && (
            <span className="badge badge-gray" style={{ fontSize: 10, padding: '2px 7px' }}>+{job.targetDesignations.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {daysAgo(job.createdAt)} · {job.applicationsCount} applicants
        </span>
        <div style={{ display: 'flex', gap: 8, width: 'min(100%, 100%)' }}>
          {showActions ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => onViewApps(job._id)}>
                👥 {job.applicationsCount}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => onEdit(job._id)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(job._id)}>🗑</button>
            </div>
          ) : (
            <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
              View Job →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
