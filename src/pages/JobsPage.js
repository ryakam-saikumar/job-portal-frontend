import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import toast from 'react-hot-toast';

const TYPES = ['', 'full_time', 'part_time', 'contract', 'remote', 'internship'];
const TYPE_LABELS = { '': 'All Types', full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', remote: 'Remote', internship: 'Internship' };
const CATEGORIES = ['', 'engineering', 'design', 'product', 'data', 'marketing', 'sales', 'hr', 'finance', 'operations'];
const CAT_LABELS = { '': 'All Categories', engineering: '⚙️ Engineering', design: '🎨 Design', product: '📦 Product', data: '📊 Data', marketing: '📣 Marketing', sales: '💼 Sales', hr: '👥 HR', finance: '💰 Finance', operations: '🔧 Operations' };

const DESIG_LABELS = {
  fresher: 'Fresher', junior_developer: 'Junior Dev', mid_developer: 'Mid Dev',
  senior_developer: 'Senior Dev', lead: 'Lead', manager: 'Manager',
  director: 'Director', executive: 'Executive', designer: 'Designer',
  data_scientist: 'Data Scientist', devops: 'DevOps', qa_engineer: 'QA Engineer', product_manager: 'PM'
};

export default function JobsPage() {
  const { user, API } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ location: '', type: '', category: '' });
  const [searchInput, setSearchInput] = useState('');

  const fetchJobs = useCallback(async (pg = 1, s = search, f = filters) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 9, ...(s && { search: s }), ...f };
      const { data } = await axios.get(`${API}/jobs`, { params });
      setJobs(data.jobs);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [API, search, filters]);

  useEffect(() => { fetchJobs(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchJobs(1, searchInput, filters);
  };

  const handleFilter = (key, val) => {
    const f = { ...filters, [key]: val };
    setFilters(f);
    fetchJobs(1, search, f);
  };

  const handlePage = (p) => fetchJobs(p, search, filters);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Hero Banner */}
      <div className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div style={styles.designationBadge}>
                <span style={styles.designationDot} />
                Showing jobs for: <strong>{DESIG_LABELS[user?.designation] || user?.designation}</strong>
              </div>
              <h1 className="hero-title">
                {total} Jobs matched<br />
                <span style={{ color: 'var(--accent)' }}>just for you</span>
              </h1>
              <p className="hero-sub">Personalized based on your profile</p>
            </div>
            {/* Search */}
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <input
                  className="form-input" style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                  placeholder="Search jobs, companies, skills..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                🔍 Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div className="jobs-layout">
          {/* Sidebar Filters */}
          <aside className="jobs-sidebar">
            <div className="card" style={{ padding: 24 }}>
              <h3 style={styles.sidebarTitle}>Filters</h3>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="City or state..."
                  value={filters.location}
                  onChange={e => handleFilter('location', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Job Type</label>
                <div style={styles.filterGroup}>
                  {TYPES.map(t => (
                    <button key={t} type="button"
                      className={`btn btn-sm ${filters.type === t ? 'btn-secondary' : 'btn-outline'}`}
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6 }}
                      onClick={() => handleFilter('type', t)}>
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <hr className="divider" />
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <div style={styles.filterGroup}>
                  {CATEGORIES.map(c => (
                    <button key={c} type="button"
                      className={`btn btn-sm ${filters.category === c ? 'btn-secondary' : 'btn-outline'}`}
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6 }}
                      onClick={() => handleFilter('category', c)}>
                      {CAT_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
              {(search || filters.type || filters.location || filters.category) && (
                <>
                  <hr className="divider" />
                  <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}
                    onClick={() => { setSearch(''); setSearchInput(''); setFilters({ location: '', type: '', category: '' }); fetchJobs(1, '', { location: '', type: '', category: '' }); }}>
                    ✕ Clear all filters
                  </button>
                </>
              )}
            </div>
          </aside>

          {/* Jobs Grid */}
          <main className="jobs-main">
            {loading ? (
              <div className="grid-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card" style={{ padding: 24, height: 240 }}>
                    <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 20 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[70, 80, 60].map(w => <div key={w} className="skeleton" style={{ height: 24, width: w }} />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No jobs found</h3>
                <p>Try adjusting your filters or search terms. New jobs are posted regularly!</p>
              </div>
            ) : (
              <>
                <div style={styles.resultsHeader}>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                    Showing <strong style={{ color: 'var(--ink)' }}>{jobs.length}</strong> of <strong style={{ color: 'var(--ink)' }}>{total}</strong> jobs
                  </span>
                </div>
                <div className="grid-3">
                  {jobs.map((job, i) => (
                    <div key={job._id} style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                {pages > 1 && (
                  <div style={styles.pagination}>
                    <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => handlePage(page - 1)}>← Prev</button>
                    {[...Array(pages)].map((_, i) => (
                      <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-secondary' : 'btn-outline'}`}
                        onClick={() => handlePage(i + 1)}>{i + 1}</button>
                    ))}
                    <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => handlePage(page + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: { background: 'var(--ink)', padding: '48px 0 40px', borderBottom: '1px solid #222' },
  heroInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, flexWrap: 'wrap' },
  sidebarTitle: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--ink)' },
  filterGroup: { display: 'flex', flexDirection: 'column' },
  resultsHeader: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  jobsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' },
};
