import express from 'express';
import Patient from '../models/Patient.js';
import { protect } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

// All routes require authentication and tenant context
router.use(protect);
router.use(tenantContext);

// @route   GET /api/patients
// @desc    Get all patients for hospital
// @access  Private
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find({ hospitalId: req.hospitalId })
      .sort('-createdAt')
      .limit(500);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      hospitalId: req.hospitalId
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/patients
// @desc    Create new patient
// @access  Private
router.post('/', async (req, res) => {
  try {
    const patientCount = await Patient.countDocuments({ hospitalId: req.hospitalId });
    const patientId = `P-${String(patientCount + 1).padStart(5, '0')}`;
    
    const patient = await Patient.create({
      ...req.body,
      hospitalId: req.hospitalId,
      patientId,
      status: 'ACTIVE',
      admissionDate: req.body.patientType === 'IPD' ? new Date() : null
    });
    
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({
      _id: req.params.id,
      hospitalId: req.hospitalId
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/patients/search/pan-aadhaar
// @desc    Search patients by PAN or Aadhaar (for record transfer)
// @access  Private
router.get('/search/pan-aadhaar', async (req, res) => {
  try {
    const { panNumber, aadhaarNumber } = req.query;
    
    const query = {};
    if (panNumber) query.panNumber = panNumber.toUpperCase();
    if (aadhaarNumber) query.aadhaarNumber = aadhaarNumber;
    
    const patients = await Patient.find(query).limit(10);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;