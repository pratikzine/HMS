import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LogOut, Calendar, Users, Activity, Settings, Bell, ChevronRight, FilePlus, Heart, Edit2, Save, X, Plus } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const DoctorDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ patientId: '', date: new Date().toISOString().split('T')[0], diagnosis: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: '' });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [apptRes, pRes, rxRes, notifRes] = await Promise.all([
        axios.get(`${API_BASE}/doctor/appointments`),
        axios.get(`${API_BASE}/doctor/patients`),
        axios.get(`${API_BASE}/doctor/prescriptions`),
        axios.get(`${API_BASE}/notifications`)
      ]);
      setAppointments(apptRes.data.appointments);
      setPatients(pRes.data.patients);
      setPrescriptions(rxRes.data.prescriptions);
      setNotifications(notifRes.data.notifications || []);
    } catch (err) {
      console.error('Error fetching doctor dashboard data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      specialization: user?.specialization || '',
      licenseNumber: user?.licenseNumber || '',
      experience: user?.experience || ''
    });
  }, [user]);

  const handleLogout = () => logout();

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE}/doctor/profile`, profileForm);
      updateUser(res.data.user);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const handleAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/doctor/appointments/${id}/status`, { status });
      fetchDashboardData();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleAddMedication = () => {
    setPrescriptionForm({ ...prescriptionForm, medications: [...prescriptionForm.medications, { name: '', dosage: '', frequency: '', duration: '' }] });
  };

  const handleMedicationChange = (index, field, value) => {
    const meds = [...prescriptionForm.medications];
    meds[index][field] = value;
    setPrescriptionForm({ ...prescriptionForm, medications: meds });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/doctor/prescriptions`, prescriptionForm);
      setShowPrescriptionModal(false);
      setPrescriptionForm({ patientId: '', date: new Date().toISOString().split('T')[0], diagnosis: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: '' });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to create prescription:', err);
    }
  };

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (unreadCount > 0 && !showNotifications) {
      try {
        await axios.put(`${API_BASE}/notifications/read`);
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    }
  };

  // Renderers for tabs
  const renderDashboard = () => (
    <div className="page-content animate-fade-in">
      <div className="stat-grid stagger-children">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary-light)' }}><Calendar size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{appointments.filter(a => a.status === 'scheduled').length}</div>
            <div className="stat-label">Upcoming Appointments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><Users size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{patients.length}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><FilePlus size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{prescriptions.length}</div>
            <div className="stat-label">Prescriptions Issued</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="table-wrapper animate-slide-in">
          <div className="table-header">
            <div className="table-title">Today's Schedule</div>
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => setActiveTab('appointments')}>View All <ChevronRight size={14} /></button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Time</th><th>Patient</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.filter(a => a.status === 'scheduled').slice(0, 5).map(appt => (
                  <tr key={appt._id}>
                    <td className="font-semibold">{appt.time}</td>
                    <td>{appt.patient?.name || 'Unknown Patient'}</td>
                    <td className="text-muted">{appt.type}</td>
                    <td><span className="badge badge-warning">Scheduled</span></td>
                  </tr>
                ))}
                {appointments.filter(a => a.status === 'scheduled').length === 0 && (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No upcoming appointments</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="table-header" style={{ padding: '0 0 20px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
            <div className="table-title">Professional Details</div>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('settings')}>Edit Profile</button>
          </div>
          <div className="flex gap-4 mb-4" style={{ alignItems: 'center' }}>
            <div className="user-avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>
              {user?.name?.charAt(0).toUpperCase() || 'D'}
            </div>
            <div>
              <h2 className="text-lg font-bold">Dr. {user?.name}</h2>
              <p className="text-primary-light">{user?.specialization || 'General Practice'}</p>
            </div>
          </div>
          <div className="divider" />
          <div className="grid-2 mt-4" style={{ gap: 24 }}>
            <div><div className="text-xs text-muted mb-1 text-uppercase font-bold">License Number</div><div className="text-sm font-bold">{user?.licenseNumber || 'N/A'}</div></div>
            <div><div className="text-xs text-muted mb-1 text-uppercase font-bold">Experience</div><div className="text-sm">{user?.experience ? `${user.experience} Years` : 'N/A'}</div></div>
            <div><div className="text-xs text-muted mb-1 text-uppercase font-bold">Phone</div><div className="text-sm">{user?.phone || 'N/A'}</div></div>
            <div><div className="text-xs text-muted mb-1 text-uppercase font-bold">Email</div><div className="text-sm">{user?.email}</div></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="page-content animate-fade-in">
      <h2>Weekly Schedule</h2>
      <div className="table-wrapper mt-4">
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Patient Name</th><th>Type</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {appointments.map(appt => (
              <tr key={appt._id}>
                <td className="font-semibold">{appt.date}</td>
                <td>{appt.time}</td>
                <td>{appt.patient?.name || 'Unknown'}</td>
                <td>{appt.type}</td>
                <td className="text-muted">{appt.notes || 'None'}</td>
                <td>
                  <span className={`badge badge-${appt.status === 'completed' ? 'success' : appt.status === 'cancelled' ? 'error' : 'warning'}`}>{appt.status}</span>
                </td>
                <td>
                  {appt.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-outline text-success" style={{ borderColor: 'var(--success)' }} onClick={() => handleAppointmentStatus(appt._id, 'completed')}>Complete</button>
                      <button className="btn btn-sm btn-outline text-error" style={{ borderColor: 'var(--error)' }} onClick={() => handleAppointmentStatus(appt._id, 'cancelled')}>Cancel</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && <tr><td colSpan="7" className="text-center py-4">No appointments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="page-content animate-fade-in">
      <h2 className="mb-4">My Patients & Health Records</h2>
      <div className="grid-2 gap-4">
        {patients.map(hr => (
          <div key={hr._id} className="card">
            <div className="flex-between mb-4 border-b border-gray-700 pb-2">
              <div>
                <h3 className="font-bold text-lg">{hr.patient?.name || 'Unknown'}</h3>
                <div className="text-xs text-muted">Phone: {hr.patient?.phone || 'N/A'}</div>
              </div>
              <div className="badge badge-primary">{hr.patient?.age ? `${hr.patient.age} Yrs` : 'Age N/A'}</div>
            </div>
            
            <div className="grid-3 gap-2 mb-4">
              <div className="p-2 bg-gray-800 rounded"><div className="text-xs text-muted">Weight</div><div className="font-bold">{hr.patient?.weight || '--'} kg</div></div>
              <div className="p-2 bg-gray-800 rounded"><div className="text-xs text-muted">Height</div><div className="font-bold">{hr.patient?.height || '--'} cm</div></div>
              <div className="p-2 bg-gray-800 rounded"><div className="text-xs text-muted">Blood</div><div className="font-bold text-error">{hr.patient?.bloodGroup || '--'}</div></div>
            </div>

            <div className="text-sm mb-2"><strong>Known Diseases:</strong> {hr.diseases?.length > 0 ? hr.diseases.join(', ') : 'None reported'}</div>
            
            <div className="mt-4">
              <div className="text-xs text-muted uppercase font-bold mb-2">Previous Checkups</div>
              <div className="max-h-40 overflow-y-auto pr-2">
                {hr.checkups?.slice().reverse().map((chk, i) => (
                  <div key={i} className="mb-2 p-2 border border-gray-700 rounded text-sm">
                    <div className="flex-between"><span className="font-bold">{chk.date}</span><span className="text-xs text-info">{chk.type}</span></div>
                    {chk.diagnosis && <div className="mt-1"><strong>Diagnosis:</strong> {chk.diagnosis}</div>}
                    {chk.notes && <div className="mt-1 text-muted text-xs"><strong>Treatment/Notes:</strong> {chk.notes}</div>}
                  </div>
                ))}
                {(!hr.checkups || hr.checkups.length === 0) && <div className="text-sm text-muted">No checkups recorded.</div>}
              </div>
            </div>
          </div>
        ))}
        {patients.length === 0 && <div className="card">No patients found. Patients who book an appointment with you will appear here.</div>}
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="page-content animate-fade-in">
      <div className="flex-between mb-4">
        <h2>Prescriptions Issued</h2>
        <button className="btn btn-primary" onClick={() => setShowPrescriptionModal(true)}><Plus size={16} /> New Prescription</button>
      </div>
      <div className="grid-2">
        {prescriptions.map(rx => (
          <div key={rx._id} className="card">
            <div className="flex-between mb-4 border-b border-gray-700 pb-2">
              <div>
                <h3 className="font-bold">Patient: {rx.patient?.name || 'Unknown'}</h3>
                <div className="text-xs text-muted">Date: {rx.date}</div>
              </div>
              <div className="badge badge-info">{rx.diagnosis || 'General'}</div>
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
        {prescriptions.length === 0 && <div className="card">No prescriptions issued yet.</div>}
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
              <label className="form-label">Specialization</label>
              <input type="text" className="form-input" value={profileForm.specialization} onChange={e => setProfileForm({...profileForm, specialization: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="form-input" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input type="number" className="form-input" value={profileForm.experience} onChange={e => setProfileForm({...profileForm, experience: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">License Number</label>
              <input type="text" className="form-input" value={profileForm.licenseNumber} onChange={e => setProfileForm({...profileForm, licenseNumber: e.target.value})} disabled={!isEditingProfile} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Clinic Address</label>
              <textarea className="form-input" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} disabled={!isEditingProfile} rows="3"></textarea>
            </div>
          </div>
          {isEditingProfile && (
            <div className="mt-4 flex justify-end">
              <button type="submit" className="btn btn-primary"><Save size={16}/> Save Changes</button>
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
          <div className="sidebar-logo-icon"><Heart size={20} /></div>
          <div className="sidebar-logo-text"><div className="name">MediCare Pro</div><div className="tagline">Doctor Portal</div></div>
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-section-title">Main Menu</div>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Activity size={18} /> Dashboard</div>
          <div className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}><Calendar size={18} /> Appointments</div>
          <div className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}><Users size={18} /> Patients</div>
          <div className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}><FilePlus size={18} /> Prescriptions</div>
          
          <div className="sidebar-section-title" style={{ marginTop: 24 }}>System</div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /> Settings</div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">Dr</div>
            <div className="user-details"><div className="user-name">Dr. {user?.name}</div><div className="user-role">{user?.specialization || 'Doctor'}</div></div>
            <button onClick={handleLogout} className="btn-ghost" style={{ padding: 6, minWidth: 'auto' }} title="Logout"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="text-xl font-bold">Welcome back, Dr. {user?.name?.split(' ')[0]}!</h1>
            <p className="text-sm text-muted">{todayDate}</p>
          </div>
          <div className="flex gap-3" style={{ position: 'relative' }}>
            <button className="btn btn-outline btn-sm" onClick={handleNotificationClick} style={{ position: 'relative' }}>
              <Bell size={16} /> 
              {unreadCount > 0 && <span className="nav-badge" style={{ position: 'absolute', top: -5, right: -5 }}>{unreadCount}</span>}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowPrescriptionModal(true)}><FilePlus size={16} /> New Prescription</button>
            
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
            {activeTab === 'patients' && renderPatients()}
            {activeTab === 'prescriptions' && renderPrescriptions()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </main>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex-between mb-4">
              <h2 className="text-lg">Issue New Prescription</h2>
              <button className="btn-ghost" onClick={() => setShowPrescriptionModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleCreatePrescription}>
              <div className="grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Select Patient</label>
                  <select required className="form-select" value={prescriptionForm.patientId} onChange={e => setPrescriptionForm({...prescriptionForm, patientId: e.target.value})}>
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => <option key={p.patient._id} value={p.patient._id}>{p.patient.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" required className="form-input" value={prescriptionForm.date} onChange={e => setPrescriptionForm({...prescriptionForm, date: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Diagnosis</label>
                  <input type="text" required className="form-input" value={prescriptionForm.diagnosis} onChange={e => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})} placeholder="e.g. Viral Fever" />
                </div>
              </div>
              
              <div className="mt-4 border border-gray-700 rounded p-4">
                <div className="flex-between mb-2">
                  <h3 className="text-sm font-bold uppercase text-muted">Medications</h3>
                  <button type="button" className="btn btn-sm btn-outline" onClick={handleAddMedication}><Plus size={14}/> Add Med</button>
                </div>
                {prescriptionForm.medications.map((med, idx) => (
                  <div key={idx} className="grid-2 gap-2 mb-2 pb-2 border-b border-gray-800 last:border-0">
                    <input type="text" placeholder="Medicine Name" className="form-input p-2 text-sm" value={med.name} required onChange={e => handleMedicationChange(idx, 'name', e.target.value)} />
                    <input type="text" placeholder="Dosage (e.g. 500mg)" className="form-input p-2 text-sm" value={med.dosage} required onChange={e => handleMedicationChange(idx, 'dosage', e.target.value)} />
                    <input type="text" placeholder="Frequency (e.g. 1-0-1)" className="form-input p-2 text-sm" value={med.frequency} required onChange={e => handleMedicationChange(idx, 'frequency', e.target.value)} />
                    <input type="text" placeholder="Duration (e.g. 5 Days)" className="form-input p-2 text-sm" value={med.duration} required onChange={e => handleMedicationChange(idx, 'duration', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Additional Notes / Instructions</label>
                <textarea className="form-input" value={prescriptionForm.notes} onChange={e => setPrescriptionForm({...prescriptionForm, notes: e.target.value})} rows="2" placeholder="Rest for 3 days..."></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-full mt-4">Issue Prescription</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
