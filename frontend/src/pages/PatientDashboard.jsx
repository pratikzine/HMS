import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, Calendar, Activity, User as UserIcon, Heart, Settings, Bell, ChevronRight, FilePlus, ShieldPlus, Edit2, Save, X, Plus } from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [appointments, setAppointments] = useState([]);
  const [healthRecord, setHealthRecord] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ doctorName: '', date: '', time: '', type: '', notes: '' });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [apptRes, hrRes, rxRes, notifRes] = await Promise.all([
        api.get('/patient/appointments'),
        api.get('/patient/health-record'),
        api.get('/patient/prescriptions'),
        api.get('/notifications')
      ]);
      setAppointments(apptRes.data.appointments);
      setHealthRecord(hrRes.data.healthRecord);
      setPrescriptions(rxRes.data.prescriptions);
      setNotifications(notifRes.data.notifications || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      age: user?.age || '',
      bloodGroup: user?.bloodGroup || '',
      height: user?.height || '',
      weight: user?.weight || ''
    });
  }, [user]);

  const handleLogout = () => logout();

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/patient/profile', profileForm);
      updateUser(res.data.user);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patient/appointments', appointmentForm);
      setShowAppointmentModal(false);
      setAppointmentForm({ doctorName: '', date: '', time: '', type: '', notes: '' });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to book appointment:', err);
    }
  };

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (unreadCount > 0 && !showNotifications) {
      try {
        await api.put('/notifications/read');
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    }
  };

  // Renderers for different tabs
  const renderDashboard = () => (
    <div className="page-content animate-fade-in">
      <div className="stat-grid stagger-children">
        <div className="stat-card" style={{ '--doctor-gradient': 'var(--patient-gradient)' }}>
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><Calendar size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{appointments.filter(a => a.status === 'scheduled').length}</div>
            <div className="stat-label">Upcoming Appointments</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--doctor-gradient': 'var(--patient-gradient)' }}>
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><Activity size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{healthRecord?.checkups?.length || 0}</div>
            <div className="stat-label">Past Checkups</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--doctor-gradient': 'var(--patient-gradient)' }}>
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><ShieldPlus size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{prescriptions.length}</div>
            <div className="stat-label">Prescriptions</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="table-wrapper animate-slide-in">
          <div className="table-header">
            <div className="table-title">Recent Medical History</div>
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => setActiveTab('health')}>View Full History <ChevronRight size={14} /></button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Date</th><th>Doctor</th><th>Type</th><th>Diagnosis</th></tr></thead>
              <tbody>
                {healthRecord?.checkups?.slice(-5).reverse().map((record, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{record.date}</td>
                    <td>{record.doctorName}</td>
                    <td className="text-muted">{record.type}</td>
                    <td>{record.diagnosis || 'N/A'}</td>
                  </tr>
                ))}
                {(!healthRecord?.checkups || healthRecord.checkups.length === 0) && (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No recent history</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="table-header" style={{ padding: '0 0 20px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
            <div className="table-title">Personal Details</div>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('settings')}>Edit Profile</button>
          </div>
          
          <div className="flex gap-4 mb-4" style={{ alignItems: 'center' }}>
            <div className="user-avatar" style={{ width: 80, height: 80, fontSize: '2rem', background: 'var(--patient-gradient)' }}>
              {user?.name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <h2 className="text-lg font-bold">{user?.name}</h2>
              <p className="text-info">Patient ID: #{user?._id?.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <div className="divider" />
          <div className="grid-2 mt-4" style={{ gap: 24 }}>
            <div><div className="text-xs text-muted mb-1 text-uppercase font-bold">Age</div><div className="text-sm">{user?.age ? `${user.age} Years` : 'N/A'}</div></div>
            <div><div className="text-xs text-muted mb-1 text-uppercase font-bold">Blood Group</div><div className="text-sm font-bold text-error">{user?.bloodGroup || 'N/A'}</div></div>
            <div><div className="text-xs text-muted mb-1 text-uppercase font-bold">Height</div><div className="text-sm">{user?.height ? `${user.height} cm` : 'N/A'}</div></div>
            <div><div className="text-xs text-muted mb-1 text-uppercase font-bold">Weight</div><div className="text-sm">{user?.weight ? `${user.weight} kg` : 'N/A'}</div></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="page-content animate-fade-in">
      <div className="flex-between mb-4">
        <h2>My Schedule</h2>
        <button className="btn btn-patient" onClick={() => setShowAppointmentModal(true)}><Plus size={16} /> Book Appointment</button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Doctor Name</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>
            {appointments.map(appt => (
              <tr key={appt._id}>
                <td className="font-semibold">{appt.date}</td>
                <td>{appt.time}</td>
                <td>{appt.doctorName}</td>
                <td>{appt.type}</td>
                <td><span className={`badge badge-${appt.status === 'scheduled' ? 'warning' : 'success'}`}>{appt.status}</span></td>
              </tr>
            ))}
            {appointments.length === 0 && <tr><td colSpan="5" className="text-center py-4">No appointments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHealthRecords = () => (
    <div className="page-content animate-fade-in">
      <div className="grid-2 mb-4">
        <div className="card">
          <h3 className="mb-4 text-info"><Activity className="inline-block mr-2"/> Vitals & Conditions</h3>
          <div className="grid-2 gap-4">
            <div><div className="text-xs text-muted">Height</div><div className="font-bold">{user?.height || '--'} cm</div></div>
            <div><div className="text-xs text-muted">Weight</div><div className="font-bold">{user?.weight || '--'} kg</div></div>
            <div><div className="text-xs text-muted">Blood Group</div><div className="font-bold text-error">{user?.bloodGroup || '--'}</div></div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-muted mb-2">Known Diseases</div>
            <div className="flex gap-2 flex-wrap">
              {healthRecord?.diseases?.length > 0 ? healthRecord.diseases.map((d, i) => <span key={i} className="badge badge-warning">{d}</span>) : 'None reported'}
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-header"><div className="table-title">Past Checkups</div></div>
        <table>
          <thead><tr><th>Date</th><th>Doctor Name</th><th>Type</th><th>Diagnosis</th><th>Notes</th></tr></thead>
          <tbody>
            {healthRecord?.checkups?.slice().reverse().map((chk, i) => (
              <tr key={i}>
                <td>{chk.date}</td>
                <td>{chk.doctorName}</td>
                <td>{chk.type}</td>
                <td>{chk.diagnosis}</td>
                <td>{chk.notes}</td>
              </tr>
            ))}
            {(!healthRecord?.checkups || healthRecord.checkups.length === 0) && <tr><td colSpan="5" className="text-center py-4">No checkups recorded.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="page-content animate-fade-in">
      <h2 className="mb-4">Past Prescriptions</h2>
      <div className="grid-2">
        {prescriptions.map(rx => (
          <div key={rx._id} className="card">
            <div className="flex-between mb-4 border-b border-gray-700 pb-2">
              <div>
                <h3 className="font-bold">{rx.doctorName}</h3>
                <div className="text-xs text-muted">{rx.date}</div>
              </div>
              <div className="badge badge-primary">{rx.diagnosis || 'General'}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase font-bold mb-2">Medications:</div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {rx.medications?.map((med, i) => (
                  <li key={i} className="mb-2 p-2 bg-gray-800 rounded text-sm">
                    <strong>{med.name}</strong> - {med.dosage} ({med.frequency}) for {med.duration}
                  </li>
                ))}
              </ul>
            </div>
            {rx.notes && <div className="mt-4 text-sm text-muted"><strong>Notes:</strong> {rx.notes}</div>}
          </div>
        ))}
        {prescriptions.length === 0 && <div className="card">No prescriptions found.</div>}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="page-content animate-fade-in">
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="flex-between mb-4">
          <h2>Profile Settings</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setIsEditingProfile(!isEditingProfile)}>
            {isEditingProfile ? <><X size={16}/> Cancel</> : <><Edit2 size={16}/> Edit</>}
          </button>
        </div>
        <form onSubmit={handleProfileUpdate}>
          <div className="grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="form-input" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" className="form-input" value={profileForm.age} onChange={e => setProfileForm({...profileForm, age: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <input type="text" className="form-input" value={profileForm.bloodGroup} onChange={e => setProfileForm({...profileForm, bloodGroup: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input type="number" className="form-input" value={profileForm.height} onChange={e => setProfileForm({...profileForm, height: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input type="number" className="form-input" value={profileForm.weight} onChange={e => setProfileForm({...profileForm, weight: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address</label>
              <textarea className="form-input" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} disabled={!isEditingProfile} rows="3"></textarea>
            </div>
          </div>
          {isEditingProfile && (
            <div className="mt-4 flex justify-end">
              <button type="submit" className="btn btn-patient"><Save size={16}/> Save Changes</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper animate-fade-in">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'var(--patient-gradient)', boxShadow: '0 4px 16px var(--patient-glow)' }}><Heart size={20} /></div>
          <div className="sidebar-logo-text"><div className="name">MediCare Pro</div><div className="tagline">Patient Portal</div></div>
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-section-title">Main Menu</div>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Activity size={18} /> Dashboard</div>
          <div className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}><Calendar size={18} /> Appointments</div>
          <div className={`nav-item ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}><ShieldPlus size={18} /> Health Records</div>
          <div className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}><FilePlus size={18} /> Prescriptions</div>
          
          <div className="sidebar-section-title" style={{ marginTop: 24 }}>System</div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /> Settings</div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" style={{ background: 'var(--patient-gradient)' }}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details"><div className="user-name">{user?.name}</div><div className="user-role">Patient</div></div>
            <button onClick={handleLogout} className="btn-ghost" style={{ padding: 6, minWidth: 'auto' }} title="Logout"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="text-xl font-bold">Good morning, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-sm text-muted">{todayDate}</p>
          </div>
          <div className="flex gap-3" style={{ position: 'relative' }}>
            <button className="btn btn-outline btn-sm" onClick={handleNotificationClick} style={{ position: 'relative' }}>
              <Bell size={16} /> 
              {unreadCount > 0 && <span className="nav-badge" style={{ position: 'absolute', top: -5, right: -5 }}>{unreadCount}</span>}
            </button>
            <button className="btn btn-patient btn-sm" onClick={() => setShowAppointmentModal(true)}><Calendar size={16} /> Book Appointment</button>
            
            {showNotifications && (
              <div className="card animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: 320, zIndex: 50, marginTop: 10, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}><h3 className="text-sm font-bold m-0">Notifications</h3></div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.length === 0 ? <div className="p-4 text-center text-sm text-muted">No notifications</div> :
                    notifications.map(n => (
                      <div key={n._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: n.isRead ? 'transparent' : 'var(--bg-hover)' }}>
                        <div className="text-sm">{n.message}</div>
                        <div className="text-xs text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </header>

        {loading ? <div className="page-content flex-center"><div className="spinner"></div></div> : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'appointments' && renderAppointments()}
            {activeTab === 'health' && renderHealthRecords()}
            {activeTab === 'prescriptions' && renderPrescriptions()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </main>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 400 }}>
            <div className="flex-between mb-4">
              <h2 className="text-lg">Book Appointment</h2>
              <button className="btn-ghost" onClick={() => setShowAppointmentModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label className="form-label">Doctor Name</label>
                <input type="text" required className="form-input" value={appointmentForm.doctorName} onChange={e => setAppointmentForm({...appointmentForm, doctorName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" required className="form-input" value={appointmentForm.date} onChange={e => setAppointmentForm({...appointmentForm, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" required className="form-input" value={appointmentForm.time} onChange={e => setAppointmentForm({...appointmentForm, time: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Type of Visit</label>
                <input type="text" className="form-input" placeholder="e.g. General Checkup" value={appointmentForm.type} onChange={e => setAppointmentForm({...appointmentForm, type: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-patient btn-full mt-4">Confirm Booking</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
