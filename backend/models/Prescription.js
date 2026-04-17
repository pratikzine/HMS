const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, default: '' },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  doctorSpecialization: { type: String, default: 'General Practice' },
  date: { type: String, required: true },
  diagnosis: { type: String, default: '' },
  medications: [medicationSchema],
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
