const mongoose = require('mongoose');

const checkupSchema = new mongoose.Schema({
  date: { type: String, required: true },
  doctorName: { type: String, required: true },
  type: { type: String, default: 'General Checkup' },
  diagnosis: { type: String, default: '' },
  notes: { type: String, default: '' },
});

const healthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  diseases: [{ type: String }],
  allergies: [{ type: String }],
  latestVitals: {
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    bloodPressure: { type: String, default: '' },
    heartRate: { type: Number, default: null },
    temperature: { type: Number, default: null },
    recordedAt: { type: Date, default: null },
  },
  checkups: [checkupSchema],
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
