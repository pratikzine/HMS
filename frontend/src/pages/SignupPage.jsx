import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope, User, Mail, Lock, Eye, EyeOff,
  ArrowLeft, AlertCircle, Heart, IdCard, Briefcase, Phone, MapPin, Droplets
} from 'lucide-react';
import './Auth.css';

const SignupPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const isDoctor = role === 'doctor';
  const theme = isDoctor ? 'doctor-theme' : 'patient-theme';
  const Icon = isDoctor ? Stethoscope : User;

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    // Doctor
    specialization: '', licenseNumber: '', experience: '',
    // Patient
    age: '', bloodGroup: '', phone: '', address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError('');
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (isDoctor) {
        payload.specialization = form.specialization;
        payload.licenseNumber = form.licenseNumber;
        payload.experience = Number(form.experience) || 0;
      } else {
        payload.age = Number(form.age) || null;
        payload.bloodGroup = form.bloodGroup;
        payload.phone = form.phone;
        payload.address = form.address;
      }
      const user = await signup(payload);
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    'Cardiologist', 'Dermatologist', 'Endocrinologist', 'Gastroenterologist',
    'General Practitioner', 'Neurologist', 'Oncologist', 'Orthopedic Surgeon',
    'Pediatrician', 'Psychiatrist', 'Pulmonologist', 'Radiologist', 'Urologist', 'Other'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const bullets = isDoctor
    ? ['Manage your appointments efficiently', 'Digital prescription management', 'Patient health tracking', 'Advanced analytics']
    : ['Book appointments instantly', 'View complete health history', 'Get prescription reminders', 'Secure communication'];

  return (
    <div className="auth-root">
      {/* Left Panel */}
      <div className={`auth-panel-left ${theme}`}>
        <div className="auth-left-blob auth-left-blob-1" />
        <div className="auth-left-blob auth-left-blob-2" />
        <div className="auth-left-content animate-fade-in">
          <div className="auth-left-icon"><Icon size={44} /></div>
          <h1>{isDoctor ? 'Join as Doctor' : 'Join as Patient'}</h1>
          <p>{isDoctor
            ? 'Register your practice and start managing patients with our intelligent healthcare system.'
            : 'Create your health profile and get access to the best healthcare management tools.'
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
          <button className="auth-back-btn" onClick={() => navigate(`/${role}/login`)} id="btn-back-login">
            <ArrowLeft size={14} /> Back to Login
          </button>
          <div className={`auth-role-tag ${theme}`}><Icon size={11} /> {isDoctor ? 'Doctor' : 'Patient'} Registration</div>
          <h2>Create Account</h2>
          <p>Fill in your details to get started</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />{error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="section-label">Basic Information</div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="form-input-wrapper">
              <User size={16} className="form-input-icon" />
              <input id="input-name" type="text" name="name" className="form-input with-icon"
                placeholder="Dr. John Doe" value={form.name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <Mail size={16} className="form-input-icon" />
              <input id="input-email" type="email" name="email" className="form-input with-icon"
                placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrapper">
                <Lock size={16} className="form-input-icon" />
                <input id="input-password" type={showPassword ? 'text' : 'password'} name="password"
                  className="form-input with-icon" placeholder="Min 6 chars" value={form.password} onChange={handleChange} />
                <button type="button" className="form-input-right" id="btn-toggle-pw" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="form-input-wrapper">
                <Lock size={16} className="form-input-icon" />
                <input id="input-confirm-password" type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  className="form-input with-icon" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
                <button type="button" className="form-input-right" id="btn-toggle-cpw" onClick={() => setShowConfirm(!showConfirm)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Role-specific */}
          {isDoctor ? (
            <>
              <div className="section-label">Professional Details</div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <div className="form-input-wrapper" style={{ position: 'relative' }}>
                  <Briefcase size={16} className="form-input-icon" />
                  <select id="select-specialization" name="specialization" className="form-select with-icon" value={form.specialization} onChange={handleChange} style={{ paddingLeft: 44 }}>
                    <option value="">Select Specialization</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <div className="form-input-wrapper">
                    <IdCard size={16} className="form-input-icon" />
                    <input id="input-license" type="text" name="licenseNumber" className="form-input with-icon"
                      placeholder="MCI-XXXX" value={form.licenseNumber} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <div className="form-input-wrapper">
                    <Briefcase size={16} className="form-input-icon" />
                    <input id="input-experience" type="number" name="experience" className="form-input with-icon"
                      placeholder="e.g. 5" min="0" max="60" value={form.experience} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="section-label">Personal Health Details</div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <div className="form-input-wrapper">
                    <User size={16} className="form-input-icon" />
                    <input id="input-age" type="number" name="age" className="form-input with-icon"
                      placeholder="e.g. 28" min="1" max="120" value={form.age} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <div className="form-input-wrapper" style={{ position: 'relative' }}>
                    <Droplets size={16} className="form-input-icon" />
                    <select id="select-bloodgroup" name="bloodGroup" className="form-select with-icon" value={form.bloodGroup} onChange={handleChange} style={{ paddingLeft: 44 }}>
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="form-input-wrapper">
                  <Phone size={16} className="form-input-icon" />
                  <input id="input-phone" type="tel" name="phone" className="form-input with-icon"
                    placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <div className="form-input-wrapper">
                  <MapPin size={16} className="form-input-icon" />
                  <input id="input-address" type="text" name="address" className="form-input with-icon"
                    placeholder="Your home address" value={form.address} onChange={handleChange} />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            id="btn-signup-submit"
            disabled={loading}
            className={`btn btn-full btn-lg ${isDoctor ? 'btn-primary' : 'btn-patient'}`}
            style={{ marginTop: 12 }}
          >
            {loading ? <><span className="spinner" />Creating Account...</> : `Create ${isDoctor ? 'Doctor' : 'Patient'} Account`}
          </button>
        </form>

        <div className="auth-footer-link" style={{ marginTop: 16 }}>
          Already have an account?{' '}
          <button id="btn-go-login" onClick={() => navigate(`/${role}/login`)}>
            Sign In
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <Heart size={12} style={{ color: isDoctor ? 'var(--doctor-primary)' : 'var(--patient-primary)' }} />
          MediCare Pro — Secure & Private
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
