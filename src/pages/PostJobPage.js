import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DESIGNATIONS = [
  { value: 'all', label: '🌐 All Levels' },
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

const EMPTY_FORM = {
  title: '', company: '', description: '', location: '',
  type: 'full_time', category: 'engineering',
  skills: '', requirements: '',
  salaryMin: '', salaryMax: '',
  expMin: 0, expMax: 10,
  targetDesignations: ['all'],
  deadline: '',
};

export default function PostJobPage() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      axios.get(`${API}/jobs/${id}`)
        .then(r => {
          const j = r.data;
          setForm({
            title: j.title, company: j.company, description: j.description, location: j.location,
            type: j.type, category: j.category,
            skills: (j.skills || []).join(', '),
            requirements: (j.requirements || []).join('\n'),
            salaryMin: j.salary?.min || '', salaryMax: j.salary?.max || '',
            expMin: j.experienceRequired?.min || 0, expMax: j.experienceRequired?.max || 10,
            targetDesignations: j.targetDesignations || ['all'],
            deadline: j.deadline ? j.deadline.split('T')[0] : '',
          });
        })
        .catch(() => { toast.error('Failed to load job'); navigate('/admin'); })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleDesignation = (val) => {
    if (val === 'all') { updateForm('targetDesignations', ['all']); return; }
    let current = form.targetDesignations.filter(d => d !== 'all');
    if (current.includes(val)) {
      current = current.filter(d => d !== val);
      if (current.length === 0) current = ['all'];
    } else {
      current = [...current, val];
    }
    updateForm('targetDesignations', current);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description || !form.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.targetDesignations.length === 0) {
      toast.error('Select at least one target designation');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title, company: form.company, description: form.description, location: form.location,
        type: form.type, category: form.category,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements: form.requirements.split('\n').map(s => s.trim()).filter(Boolean),
        salary: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0, currency: 'INR' },
        experienceRequired: { min: Number(form.expMin), max: Number(form.expMax) },
        targetDesignations: form.targetDesignations,
        deadline: form.deadline || undefined,
      };
      if (isEdit) {
        await axios.put(`${API}/jobs/${id}`, payload);
        toast.success('Job updated!');
      } else {
        await axios.post(`${API}/jobs`, payload);
        toast.success('Job posted successfully! 🎉');
      }
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: 60 }}>
      <div style={styles.header}>
        <div className="container">
          <h1 style={styles.headerTitle}>{isEdit ? '✏️ Edit Job' : '+ Post New Job'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            {isEdit ? 'Update the job details below' : 'Fill in the details to create a new job listing'}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        <form onSubmit={handleSubmit}>
          <div style={styles.layout}>
            {/* Main Form */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Basic Info */}
              <Section title="Basic Information">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Job Title *</label>
                    <input className="form-input" placeholder="e.g. Senior React Developer"
                      value={form.title} onChange={e => updateForm('title', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company Name *</label>
                    <input className="form-input" placeholder="e.g. TechCorp India"
                      value={form.company} onChange={e => updateForm('company', e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Location *</label>
                    <input className="form-input" placeholder="Hyderabad, Telangana"
                      value={form.location} onChange={e => updateForm('location', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Job Type</label>
                    <select className="form-input" value={form.type} onChange={e => updateForm('type', e.target.value)}>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.category} onChange={e => updateForm('category', e.target.value)}>
                      {['engineering', 'design', 'product', 'data', 'marketing', 'sales', 'hr', 'finance', 'operations'].map(c => (
                        <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Section>

              {/* Description */}
              <Section title="Job Description">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description *</label>
                  <textarea className="form-input" style={{ minHeight: 180 }}
                    placeholder="Describe the role, responsibilities, team culture, perks..."
                    value={form.description} onChange={e => updateForm('description', e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0, marginTop: 16 }}>
                  <label className="form-label">Requirements <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(one per line)</span></label>
                  <textarea className="form-input" style={{ minHeight: 120 }}
                    placeholder={"3+ years React experience\nStrong TypeScript skills\nExperience with REST APIs"}
                    value={form.requirements} onChange={e => updateForm('requirements', e.target.value)} />
                </div>
              </Section>

              {/* Skills & Salary */}
              <Section title="Skills & Compensation">
                <div className="form-group">
                  <label className="form-label">Required Skills <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                  <input className="form-input" placeholder="React, Node.js, MongoDB, TypeScript, AWS"
                    value={form.skills} onChange={e => updateForm('skills', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Min Salary (₹/yr)</label>
                    <input type="number" className="form-input" placeholder="600000"
                      value={form.salaryMin} onChange={e => updateForm('salaryMin', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Max Salary (₹/yr)</label>
                    <input type="number" className="form-input" placeholder="1200000"
                      value={form.salaryMax} onChange={e => updateForm('salaryMax', e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Min Experience (yrs)</label>
                    <input type="number" className="form-input" min="0" max="40"
                      value={form.expMin} onChange={e => updateForm('expMin', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Max Experience (yrs)</label>
                    <input type="number" className="form-input" min="0" max="40"
                      value={form.expMax} onChange={e => updateForm('expMax', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Application Deadline</label>
                    <input type="date" className="form-input"
                      value={form.deadline} onChange={e => updateForm('deadline', e.target.value)} />
                  </div>
                </div>
              </Section>
            </div>

            {/* Sidebar: Target Designations */}
            <aside style={styles.sidebar}>
              <div className="card" style={{ padding: 24, position: 'sticky', top: 80 }}>
                <h3 style={styles.sidebarTitle}>🎯 Target Designations</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  Only users with selected designations will see this job listing.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {DESIGNATIONS.map(d => {
                    const selected = form.targetDesignations.includes(d.value);
                    return (
                      <button key={d.value} type="button"
                        onClick={() => toggleDesignation(d.value)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 10, border: '1.5px solid',
                          borderColor: selected ? 'var(--accent)' : 'var(--border)',
                          background: selected ? 'var(--accent-soft)' : 'white',
                          cursor: 'pointer', fontSize: 13, fontWeight: selected ? 600 : 400,
                          color: selected ? 'var(--accent)' : 'var(--ink)',
                          transition: 'all 0.15s', textAlign: 'left',
                        }}>
                        <span style={{ flex: 1 }}>{d.label}</span>
                        {selected && <span style={{ fontSize: 12 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 10, fontSize: 13, color: 'var(--muted)' }}>
                  Selected: <strong style={{ color: 'var(--ink)' }}>
                    {form.targetDesignations.includes('all') ? 'All designations' : `${form.targetDesignations.length} designation(s)`}
                  </strong>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving...</> : (isEdit ? '✓ Update Job' : '🚀 Publish Job')}
                </button>
                <button type="button" className="btn btn-ghost" style={{ width: '100%', marginTop: 8 }}
                  onClick={() => navigate('/admin')}>
                  Cancel
                </button>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 28, marginBottom: 20 }}>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

const styles = {
  header: { background: 'var(--ink)', padding: '40px 0 32px' },
  headerTitle: { fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 6 },
  layout: { display: 'flex', gap: 28, alignItems: 'flex-start' },
  sidebar: { width: 300, flexShrink: 0 },
  sidebarTitle: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 },
};
