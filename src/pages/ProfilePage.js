import React, { useState } from 'react';
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
  { value: 'executive', label: '👔 Executive' },
  { value: 'designer', label: '🎨 Designer' },
  { value: 'data_scientist', label: '📊 Data Scientist' },
  { value: 'devops', label: '⚙️ DevOps Engineer' },
  { value: 'qa_engineer', label: '🧪 QA Engineer' },
  { value: 'product_manager', label: '📦 Product Manager' },
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    designation: user?.designation || 'fresher',
    experience: user?.experience || 0,
    location: user?.location || '',
    bio: user?.bio || '',
    skills: (user?.skills || []).join(', '),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), experience: Number(form.experience) });
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const u = user;
  const currentDesig = DESIGNATIONS.find(d => d.value === u?.designation);
  const completionFields = [u?.name, u?.designation, u?.location, u?.bio, u?.skills?.length > 0, u?.experience > 0];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={styles.banner}>
        <div className="container">
          <div style={styles.bannerContent}>
            <div style={styles.avatarLarge}>{u?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h1 style={styles.bannerName}>{u?.name}</h1>
              <p style={styles.bannerRole}>{currentDesig?.label} · {u?.experience}yr experience · {u?.location || 'Location not set'}</p>
              <span className={`badge ${u?.role === 'admin' ? 'badge-orange' : u?.role === 'recruiter' ? 'badge-blue' : 'badge-green'}`}>
                {u?.role === 'admin' ? '⚡ Admin' : u?.role === 'recruiter' ? '🏢 Recruiter' : '👤 Job Seeker'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left: Edit Form */}
          <div style={{ flex: 1, minWidth: 'min(100%, 320px)' }}>
            <div className="card" style={{ padding: '24px 32px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={styles.sectionTitle}>Profile Details</h2>
                {!editing ? (
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                      {saving ? <span className="spinner" style={{ borderTopColor: 'white' }} /> : '✓ Save'}
                    </button>
                  </div>
                )}
              </div>

              {editing ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <select className="form-input" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))}>
                        {DESIGNATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Experience (Years)</label>
                      <input type="number" className="form-input" min="0" max="40" value={form.experience}
                        onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" placeholder="Hyderabad, Telangana" value={form.location}
                      onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Skills <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                    <input className="form-input" placeholder="React, Node.js, MongoDB" value={form.skills}
                      onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-input" placeholder="Tell recruiters about yourself..." value={form.bio}
                      onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
                  </div>
                </div>
              ) : (
                <div style={styles.profileView}>
                  <ProfileRow label="Email" value={u?.email} icon="📧" />
                  <ProfileRow label="Designation" value={currentDesig?.label || u?.designation} icon="💼" />
                  <ProfileRow label="Experience" value={`${u?.experience} years`} icon="⏱" />
                  <ProfileRow label="Location" value={u?.location || 'Not specified'} icon="📍" />
                  <ProfileRow label="Bio" value={u?.bio || 'No bio added yet'} icon="📝" />
                </div>
              )}
            </div>

            {/* Skills Card */}
            <div className="card" style={{ padding: '24px 32px' }}>
              <h2 style={{ ...styles.sectionTitle, marginBottom: 20 }}>Skills</h2>
              {u?.skills?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {u.skills.map(s => (
                    <span key={s} style={{ padding: '7px 14px', background: 'var(--ink)', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>No skills added. Edit your profile to add skills.</p>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div style={{ width: 'min(100%, 280px)', flexShrink: 0 }}>
            {/* Profile Completion */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={styles.sidebarTitle}>Profile Strength</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {completion < 60 ? 'Incomplete' : completion < 80 ? 'Good' : completion < 100 ? 'Strong' : 'Complete ✨'}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: completion >= 80 ? 'var(--success)' : 'var(--accent)' }}>{completion}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${completion}%`, background: completion >= 80 ? 'var(--success)' : 'var(--accent)' }} />
              </div>
              {completion < 100 && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Complete these:</p>
                  {!u?.bio && <TipItem label="Add a bio" />}
                  {!u?.location && <TipItem label="Add your location" />}
                  {!u?.skills?.length && <TipItem label="Add your skills" />}
                  {!u?.experience && <TipItem label="Add experience years" />}
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={styles.sidebarTitle}>Account Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InfoRow label="Role" value={u?.role} />
                <InfoRow label="Member since" value={new Date(u?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} />
                <InfoRow label="Email" value={u?.email} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value, icon }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function TipItem({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
      <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid var(--border)', flexShrink: 0 }} />
      {label}
    </div>
  );
}

const styles = {
  banner: { background: 'var(--ink)', padding: '40px 0 36px' },
  bannerContent: { display: 'flex', gap: 24, alignItems: 'center' },
  avatarLarge: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'var(--accent)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, fontWeight: 800, flexShrink: 0,
  },
  bannerName: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 6 },
  bannerRole: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 10 },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--ink)' },
  sidebarTitle: { fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 },
  profileView: { display: 'flex', flexDirection: 'column' },
  progressBar: { height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.6s ease' },
};
