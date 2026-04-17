const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  updateProfile,
  getAppointments, updateAppointmentStatus,
  getPatients, addCheckup,
  getPrescriptions, createPrescription,
} = require('../controllers/doctorController');

router.use(protect, restrictTo('doctor'));

router.put('/profile', updateProfile);

router.get('/appointments', getAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

router.get('/patients', getPatients);
router.post('/patients/checkup', addCheckup);

router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', createPrescription);

module.exports = router;
