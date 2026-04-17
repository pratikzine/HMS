const User = require('../models/User');
const Appointment = require('../models/Appointment');
const HealthRecord = require('../models/HealthRecord');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');

// ─── PROFILE ────────────────────────────────────────────────────────────────

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name','phone','address','age','bloodGroup','height','weight'];
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
    const appointments = await Appointment.find({ patient: req.user._id }).sort({ date: 1, time: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { doctorName, doctorSpecialization, date, time, type, notes } = req.body;
    if (!doctorName || !date || !time)
      return res.status(400).json({ success: false, message: 'Doctor name, date and time are required' });

    const appt = await Appointment.create({
      patient: req.user._id, doctorName,
      doctorSpecialization: doctorSpecialization || 'General Practice',
      date, time, type: type || 'General Checkup', notes: notes || '',
    });

    // Notify patient
    await Notification.create({
      user: req.user._id,
      message: `Your appointment with Dr. ${doctorName} is scheduled for ${date} at ${time}.`
    });

    // Notify doctor
    const doctor = await User.findOne({ name: doctorName, role: 'doctor' });
    if (doctor) {
      await Notification.create({
        user: doctor._id,
        message: `New appointment scheduled with ${req.user.name} for ${date} at ${time}.`
      });
    }

    res.status(201).json({ success: true, appointment: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      { $set: req.body }, { new: true }
    );
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOneAndDelete({ _id: req.params.id, patient: req.user._id });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── HEALTH RECORDS ──────────────────────────────────────────────────────────

exports.getHealthRecord = async (req, res) => {
  try {
    let record = await HealthRecord.findOne({ patient: req.user._id });
    if (!record) record = await HealthRecord.create({ patient: req.user._id });
    res.json({ success: true, healthRecord: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndUpdate(
      { patient: req.user._id }, { $set: req.body }, { new: true, upsert: true }
    );
    res.json({ success: true, healthRecord: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addCheckup = async (req, res) => {
  try {
    const { date, doctorName, type, diagnosis, notes } = req.body;
    if (!date || !doctorName)
      return res.status(400).json({ success: false, message: 'Date and doctor name are required' });

    const record = await HealthRecord.findOneAndUpdate(
      { patient: req.user._id },
      { $push: { checkups: { date, doctorName, type: type || 'General Checkup', diagnosis: diagnosis || '', notes: notes || '' } } },
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
    const prescriptions = await Prescription.find({ patient: req.user._id }).sort({ date: -1 });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const { doctorName, doctorSpecialization, date, diagnosis, medications, notes } = req.body;
    if (!doctorName || !date)
      return res.status(400).json({ success: false, message: 'Doctor name and date are required' });

    const prescription = await Prescription.create({
      patient: req.user._id, doctorName,
      doctorSpecialization: doctorSpecialization || 'General Practice',
      date, diagnosis: diagnosis || '', medications: medications || [], notes: notes || '',
    });
    res.status(201).json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
