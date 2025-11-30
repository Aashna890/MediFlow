import express from 'express';
import MedicalRecord from '../models/MedicalRecord.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/medical-records/search
// @desc    Search medical records by PAN or Aadhaar (for cross-hospital access)
// @access  Private
router.get('/search', async (req, res) => {
  try {
    const { panNumber, aadhaarNumber } = req.query;
    
    const query = { isShared: true };
    if (panNumber) query.patientPan = panNumber.toUpperCase();
    if (aadhaarNumber) query.patientAadhaar = aadhaarNumber;
    
    const records = await MedicalRecord.find(query)
      .sort('-recordDate')
      .limit(100);
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/medical-records
// @desc    Create medical record
// @access  Private
router.post('/', async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;