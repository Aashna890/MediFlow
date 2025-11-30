import HospitalStaff from '../models/HospitalStaff.js';

export const tenantContext = async (req, res, next) => {
  try {
    // Get hospital context from authenticated user
    if (req.user) {
      const staff = await HospitalStaff.findOne({ userEmail: req.user.email });
      
      if (!staff) {
        return res.status(403).json({ 
          message: 'No hospital association found for this user' 
        });
      }
      
      req.hospitalId = staff.hospitalId;
      req.staff = staff;
    }
    next();
  } catch (error) {
    console.error('Tenant context error:', error);
    res.status(500).json({ message: 'Error setting tenant context' });
  }
};
