import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, Heart } from 'lucide-react';
import './Auth.css';

const LoginPage = () => {
  const { role } = useParams(); // 'doctor' | 'patient'
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDoctor = role === 'doctor';
  const theme = isDoctor ? 'doctor-theme' : 'patient-theme';
  const Icon = isDoctor ? Stethoscope : User;
  const accentColor = isDoctor ? 'var(--doctor-primary)' : 'var(--patient-primary)';
  const bullets = isDoctor
    ? ['Manage patient appointments', 'Access medical records', 'Write prescriptions', 'View analytics']
    : ['Book doctor appointments', 'View health records', 'Track prescriptions', 'Communicate with doctors'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password, role);
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left Panel */}
      <div className={`auth-panel-left ${theme}`}>
        <div className="auth-left-blob auth-left-blob-1" />
        <div className="auth-left-blob auth-left-blob-2" />
        <div className="auth-left-content animate-fade-in">
          <div className="auth-left-icon"><Icon size={44} /></div>
          <h1>{isDoctor ? 'Doctor Portal' : 'Patient Portal'}</h1>
          <p>{isDoctor
            ? 'Your complete practice management system — schedule, treat, and care.'
            : 'Your health journey, managed seamlessly — book, track, and communicate.'
          }</p>
          <ul className="auth-left-bullets">
            {bullets.map((b) => (
              <li key={b}><span className="bullet-dot" />{b}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-panel-right animate-fade-in">
        <div className="auth-form-header">
          <button className="auth-back-btn" onClick={() => navigate('/')} id="btn-back-home">
            <ArrowLeft size={14} /> Back to Home
          </button>
          <div className={`auth-role-tag ${theme}`}>
            <Icon size={11} />
            {isDoctor ? 'Doctor Login' : 'Patient Login'}
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your {isDoctor ? 'doctor' : 'patient'} account to continue</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <Mail size={16} className="form-input-icon" />
              <input
                id="input-email"
                type="email"
                name="email"
                className={`form-input with-icon ${error ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <Lock size={16} className="form-input-icon" />
              <input
                id="input-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-input with-icon ${error ? 'error' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="form-input-right"
                onClick={() => setShowPassword(!showPassword)}
                id="btn-toggle-password"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="btn-login-submit"
            disabled={loading}
            className={`btn btn-full btn-lg ${isDoctor ? 'btn-primary' : 'btn-patient'}`}
            style={{ marginTop: 8 }}
          >
            {loading ? <><span className="spinner" />Signing in...</> : `Sign In as ${isDoctor ? 'Doctor' : 'Patient'}`}
          </button>
        </form>

        <div className="divider"><span>Don't have an account?</span></div>

        <div className="auth-footer-link">
          <button
            id="btn-go-signup"
            onClick={() => navigate(`/${role}/signup`)}
          >
            Create a {isDoctor ? 'Doctor' : 'Patient'} Account
          </button>
        </div>

        <div style={{ marginTop: 40, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <Heart size={12} style={{ color: accentColor }} />
          MediCare Pro — Secure & Private
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
