import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HospitalStaff from '../models/HospitalStaff.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user changed password after token was issued
      if (req.user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({ 
          message: 'Password was recently changed. Please login again.',
          requireLogin: true
        });
      }

      // Check if password change is forced
      if (req.user.forcePasswordChange) {
        return res.status(403).json({ 
          message: 'Password change required',
          forcePasswordChange: true
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', requireLogin: true });
      }
      
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Get staff info from database
      const staff = await HospitalStaff.findOne({ userEmail: req.user.email });
      
      if (!staff) {
        return res.status(403).json({ 
          message: 'No hospital association found for this user' 
        });
      }

      if (!roles.includes(staff.role)) {
        return res.status(403).json({ 
          message: `User role ${staff.role} is not authorized to access this route` 
        });
      }

      req.staff = staff;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};