import express from 'express';
import Prescription from '../models/Prescription.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Patient from '../models/Patient.js';
import Hospital from '../models/Hospital.js';
import { protect } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(protect);
router.use(tenantContext);

// @route   GET /api/prescriptions
// @desc    Get all prescriptions for hospital
// @access  Private
router.get('/', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ hospitalId: req.hospitalId })
      .sort('-createdAt')
      .limit(500);
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/prescriptions
// @desc    Create new prescription
// @access  Private
router.post('/', async (req, res) => {
  try {
    const count = await Prescription.countDocuments({ hospitalId: req.hospitalId });
    const prescriptionId = `RX-${String(count + 1).padStart(5, '0')}`;
    
    const prescription = await Prescription.create({
      ...req.body,
      hospitalId: req.hospitalId,
      prescriptionId
    });
    
    // Create shareable medical record for cross-hospital access
    const patient = await Patient.findById(req.body.patientId);
    const hospital = await Hospital.findById(req.hospitalId);
    
    if (patient && (patient.panNumber || patient.aadhaarNumber)) {
      await MedicalRecord.create({
        patientPan: patient.panNumber,
        patientAadhaar: patient.aadhaarNumber,
        patientName: `${patient.firstName} ${patient.lastName}`,
        hospitalId: req.hospitalId,
        hospitalName: hospital?.name || 'Unknown Hospital',
        recordType: 'PRESCRIPTION',
        recordDate: new Date(),
        diagnosis: req.body.diagnosis,
        treatment: req.body.symptoms,
        medicines: req.body.medicines,
        doctorName: req.body.doctorName,
        department: patient.department,
        notes: req.body.notes,
        isShared: true
      });
    }
    
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
