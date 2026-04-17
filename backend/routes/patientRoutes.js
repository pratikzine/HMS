const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  updateProfile,
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
  getHealthRecord, updateHealthRecord, addCheckup,
  getPrescriptions, createPrescription,
} = require('../controllers/patientController');

router.use(protect, restrictTo('patient'));

router.put('/profile', updateProfile);

router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.put('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);

router.get('/health-record', getHealthRecord);
router.put('/health-record', updateHealthRecord);
router.post('/health-record/checkup', addCheckup);

router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', createPrescription);

module.exports = router;
