import express from 'express';
import Hospital from '../models/Hospital.js';
import HospitalStaff from '../models/HospitalStaff.js';
import User from '../models/User.js';

const router = express.Router();

// Generate unique tenant ID
const generateTenantId = () => {
  return 'HOSP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// @route   POST /api/hospitals
// @desc    Register a new hospital
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { 
      name, licenseNumber, address, city, state, phone, email, 
      adminEmail, adminFirstName, adminLastName, adminPhone, departments 
    } = req.body;

    // Check if license number already exists
    const existingHospital = await Hospital.findOne({ licenseNumber });
    if (existingHospital) {
      return res.status(400).json({ message: 'Hospital with this license number already exists' });
    }

    // Generate tenant ID
    const tenantId = generateTenantId();

    // Create hospital
    const hospital = await Hospital.create({
      name,
      licenseNumber,
      tenantId,
      address,
      city,
      state,
      phone,
      email,
      adminEmail,
      departments: departments || [],
      status: 'PENDING'
    });

    // Create admin user if doesn't exist
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        email: adminEmail,
        password: 'Welcome@123', // Default password
        firstName: adminFirstName,
        lastName: adminLastName
      });
    }

    // Create admin staff record
    await HospitalStaff.create({
      hospitalId: hospital._id,
      userEmail: adminEmail,
      firstName: adminFirstName,
      lastName: adminLastName,
      phone: adminPhone,
      role: 'HOSPITAL_ADMIN',
      status: 'ACTIVE'
    });

    res.status(201).json({
      message: 'Hospital registered successfully',
      hospital
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/hospitals
// @desc    Get hospitals (filtered by query params)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.id) query._id = req.query.id;
    if (req.query.license_number) query.licenseNumber = req.query.license_number;
    
    const hospitals = await Hospital.find(query);
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/hospitals/:id
// @desc    Get hospital by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/hospitals/:id
// @desc    Update hospital
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;