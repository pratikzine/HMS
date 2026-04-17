import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, Shield, Activity, Clock, Star, ChevronRight, Heart, Zap, Mail, Globe, Phone } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const features = [
    { icon: Shield, label: 'Secure & Private', desc: 'HIPAA-compliant end-to-end encryption for all patient data.' },
    { icon: Activity, label: 'Real-time Updates', desc: 'Instant health monitoring, alerts, and live notifications.' },
    { icon: Clock, label: '24/7 Access', desc: 'Round the clock care management and appointment booking.' },
    { icon: Star, label: 'Premium Care', desc: 'Connect with top-rated, certified medical professionals.' },
  ];

  return (
    <div className="landing-root">
      <div className="grid-overlay" />

      {/* Navbar */}
      <nav className="landing-nav animate-fade-in">
        <div className="landing-nav-logo">
          <div className="nav-logo-icon"><Heart size={20} /></div>
          <span className="nav-logo-text">MediCare <span>Pro</span></span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#about">About Us</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/health-blog'); }}>Health Blog</a>
          <a href="#portals">Portals</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="landing-hero">
        {/* Video Background */}
        <video className="video-background" autoPlay loop muted playsInline>
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="landing-overlay" />
        
        <div className="hero-badge animate-fade-in">
          <Zap size={14} />
          <span>Next-Generation Healthcare Platform</span>
        </div>
        <h1 className="hero-title animate-fade-in">
          Smart Healthcare,<br />
          <span className="gradient-text">Beautifully Connected</span>
        </h1>
        <p className="hero-subtitle animate-fade-in">
          Experience the future of medical management. A stunning unified platform bringing doctors and patients together for seamless care, dynamic scheduling, and real-time communication.
        </p>

        {/* Portal Cards */}
        <div className="portal-cards stagger-children" id="portals">
          {/* Doctor Portal */}
          <div className="portal-card portal-doctor">
            <div className="portal-icon-wrapper doctor-icon"><Stethoscope size={32} /></div>
            <h2>Doctor Portal</h2>
            <p>Empower your practice. Manage patient records, dynamic schedules, and issue instant prescriptions from a state-of-the-art dashboard.</p>
            <ul className="portal-features">
              <li><ChevronRight size={16} /> Advanced Patient Records</li>
              <li><ChevronRight size={16} /> Smart Scheduling System</li>
              <li><ChevronRight size={16} /> Digital Prescriptions</li>
            </ul>
            <div className="portal-actions">
              <button className="btn btn-primary btn-full" onClick={() => navigate('/doctor/login')}>Login as Doctor</button>
              <button className="btn btn-outline btn-full" onClick={() => navigate('/doctor/signup')} style={{ background: 'rgba(255,255,255,0.2)', color: 'black', fontWeight: '800' }}>Create Doctor Account</button>
            </div>
          </div>

          {/* Divider */}
          <div className="portal-divider">
            <div className="divider-line" />
            <div className="divider-circle">OR</div>
            <div className="divider-line" />
          </div>

          {/* Patient Portal */}
          <div className="portal-card portal-patient">
            <div className="portal-icon-wrapper patient-icon"><User size={32} /></div>
            <h2>Patient Portal</h2>
            <p>Take control of your health journey. Book appointments instantly, track vital signs, and access your complete medical history anywhere.</p>
            <ul className="portal-features">
              <li><ChevronRight size={16} /> 1-Click Appointments</li>
              <li><ChevronRight size={16} /> Track Health Vitals</li>
              <li><ChevronRight size={16} /> Secure Medical History</li>
            </ul>
            <div className="portal-actions">
              <button className="btn btn-patient btn-full" onClick={() => navigate('/patient/login')}>Login as Patient</button>
              <button className="btn btn-outline btn-full" onClick={() => navigate('/patient/signup')} style={{ background: 'rgba(255,255,255,0.2)', color: 'black', fontWeight: '800' }}>Create Patient Account</button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="scroll-indicator animate-bounce">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <p>Scroll Down</p>
        </div>
      </header>

      {/* Features */}
      <section className="landing-features stagger-children" id="features">
        {features.map(({ icon: Icon, label, desc }) => (
          <div className="feature-card" key={label}>
            <div className="feature-icon"><Icon size={24} /></div>
            <h3>{label}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </section>

      {/* About Us */}
      <section className="landing-about" id="about">
        <div className="about-container">
          <div className="about-content">
            <span className="about-badge">Our Mission</span>
            <h2>Transforming the <br/><span className="gradient-text">Healthcare Experience</span></h2>
            <p>At MediCare Pro, we believe that the relationship between a doctor and a patient is sacred. Our mission is to remove the friction of traditional hospital management and replace it with a fluid, beautiful, and highly intuitive digital experience.</p>
            <p>We leverage cutting-edge web technologies to ensure your medical data is encrypted, instantly accessible, and meticulously organized. Whether you're a leading physician or a patient seeking care, we bring the hospital of the future directly to your screen.</p>
          </div>
          <div className="about-image-wrapper">
            <div className="about-glow" />
            <img 
              src="/doctor-patient.jpg" 
              alt="Doctor and Patient" 
              className="about-image" 
            />
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="modern-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="landing-nav-logo mb-4">
              <div className="nav-logo-icon"><Heart size={20} /></div>
              <span className="nav-logo-text">MediCare <span>Pro</span></span>
            </div>
            <p>Bridging the gap between medical professionals and patients through state-of-the-art technology.</p>
            <div className="footer-socials">
              <a href="#" className="social-icon"><Globe size={18}/></a>
              <a href="#" className="social-icon"><Mail size={18}/></a>
              <a href="#" className="social-icon"><Phone size={18}/></a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Portals</h4>
            <ul className="footer-links">
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/doctor/login'); }}>Doctor Login</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/patient/login'); }}>Patient Login</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/doctor/signup'); }}>Join as Doctor</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/patient/signup'); }}>Register as Patient</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Stay Updated</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Subscribe to our newsletter for the latest healthcare tech news.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="newsletter-input" required />
              <button type="submit" className="newsletter-btn"><Mail size={18}/></button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 MediCare Pro. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Built with React & Node.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
