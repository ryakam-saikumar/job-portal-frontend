import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import PostJobPage from './pages/PostJobPage';
import ManageApplicationsPage from './pages/ManageApplicationsPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user && (user.role === 'admin' || user.role === 'recruiter') ? children : <Navigate to="/jobs" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to={user.role === 'admin' || user.role === 'recruiter' ? '/admin' : '/jobs'} />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/jobs" />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
        <Route path="/jobs/:id" element={<PrivateRoute><JobDetailPage /></PrivateRoute>} />
        <Route path="/my-applications" element={<PrivateRoute><MyApplicationsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/post-job" element={<AdminRoute><PostJobPage /></AdminRoute>} />
        <Route path="/admin/post-job/:id" element={<AdminRoute><PostJobPage /></AdminRoute>} />
        <Route path="/admin/applications/:jobId" element={<AdminRoute><ManageApplicationsPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/jobs" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, borderRadius: 10, boxShadow: 'var(--shadow)' }
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
