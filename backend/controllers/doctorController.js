const User = require('../models/User');
const Appointment = require('../models/Appointment');
const HealthRecord = require('../models/HealthRecord');
const Prescription = require('../models/Prescription');

// ─── PROFILE ────────────────────────────────────────────────────────────────

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'address', 'specialization', 'licenseNumber', 'experience'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(
      req.user._id, { $set: updates }, { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── APPOINTMENTS ────────────────────────────────────────────────────────────

exports.getAppointments = async (req, res) => {
  try {
    // Find appointments assigned to this doctor
    const appointments = await Appointment.find({ doctorName: req.user.name })
      .populate('patient', 'name age bloodGroup phone')
      .sort({ date: 1, time: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorName: req.user.name },
      { $set: { status } }, { new: true }
    );
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATIENTS & HEALTH RECORDS ───────────────────────────────────────────────

exports.getPatients = async (req, res) => {
  try {
    // Get unique patient IDs from appointments where doctorName matches
    const appointments = await Appointment.find({ doctorName: req.user.name }).select('patient');
    const patientIds = [...new Set(appointments.map(a => a.patient.toString()))];

    const records = await HealthRecord.find({ patient: { $in: patientIds } })
      .populate('patient', 'name age bloodGroup height weight phone address');

    res.json({ success: true, patients: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addCheckup = async (req, res) => {
  try {
    const { patientId, date, type, diagnosis, notes } = req.body;
    if (!patientId || !date)
      return res.status(400).json({ success: false, message: 'Patient ID and date are required' });

    const record = await HealthRecord.findOneAndUpdate(
      { patient: patientId },
      { $push: { checkups: { date, doctorName: req.user.name, type: type || 'General Checkup', diagnosis: diagnosis || '', notes: notes || '' } } },
      { new: true, upsert: true }
    );
    res.json({ success: true, healthRecord: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PRESCRIPTIONS ───────────────────────────────────────────────────────────

exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorName: req.user.name })
      .populate('patient', 'name age')
      .sort({ date: -1 });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, date, diagnosis, medications, notes } = req.body;
    if (!patientId || !date)
      return res.status(400).json({ success: false, message: 'Patient ID and date are required' });

    const prescription = await Prescription.create({
      patient: patientId, doctorName: req.user.name,
      doctorSpecialization: req.user.specialization || 'General Practice',
      date, diagnosis: diagnosis || '', medications: medications || [], notes: notes || '',
    });
    res.status(201).json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
