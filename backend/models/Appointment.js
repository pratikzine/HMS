const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  doctorSpecialization: { type: String, default: 'General Practice' },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  time: { type: String, required: true }, // "10:30 AM"
  type: { type: String, default: 'General Checkup' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
