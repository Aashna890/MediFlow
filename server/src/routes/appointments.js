import express from 'express';
import Appointment from '../models/Appointment.js';
import { protect } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(protect);
router.use(tenantContext);

// @route   GET /api/appointments
// @desc    Get all appointments for hospital
// @access  Private
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospitalId: req.hospitalId })
      .sort('-appointmentDate')
      .limit(500);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', async (req, res) => {
  try {
    const appointment = await Appointment.create({
      ...req.body,
      hospitalId: req.hospitalId
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;