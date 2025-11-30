import express from 'express';
import HospitalStaff from '../models/HospitalStaff.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(protect);
router.use(tenantContext);

// @route   GET /api/staff
// @desc    Get all staff for hospital
// @access  Private
router.get('/', async (req, res) => {
  try {
    const staff = await HospitalStaff.find({ hospitalId: req.hospitalId })
      .sort('-createdAt');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/staff
// @desc    Create new staff member
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  try {
    const { userEmail, firstName, lastName, role, ...rest } = req.body;
    
    // Create user account if doesn't exist
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = await User.create({
        email: userEmail,
        password: 'Welcome@123', // Default password
        firstName,
        lastName
      });
    }
    
    // Create staff record
    const staff = await HospitalStaff.create({
      hospitalId: req.hospitalId,
      userEmail,
      firstName,
      lastName,
      role,
      status: 'ACTIVE',
      ...rest
    });
    
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const staff = await HospitalStaff.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;