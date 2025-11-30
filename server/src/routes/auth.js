import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import HospitalStaff from '../models/HospitalStaff.js';
import { protect } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Password validation middleware
const passwordValidation = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/).withMessage('Password must contain at least 1 lowercase letter')
    .matches(/^(?=.*[A-Z])/).withMessage('Password must contain at least 1 uppercase letter')
    .matches(/^(?=.*\d)/).withMessage('Password must contain at least 1 number')
    .matches(/^(?=.*[@$!%*?&#])/).withMessage('Password must contain at least 1 special character (@$!%*?&#)')
];

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  ...passwordValidation,
  body('hospitalId').notEmpty().withMessage('Hospital ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, hospitalId } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if staff exists
    const staff = await HospitalStaff.findOne({ userEmail: email, hospitalId });
    if (!staff) {
      return res.status(400).json({ 
        message: 'No staff record found. Please contact hospital administrator.' 
      });
    }

    // Create user
    user = await User.create({
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        forcePasswordChange: user.forcePasswordChange
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if staff record exists
    const staff = await HospitalStaff.findOne({ userEmail: email });
    if (!staff) {
      return res.status(403).json({ 
        message: 'No hospital association found for this user' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        forcePasswordChange: user.forcePasswordChange
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -passwordHistory');
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        forcePasswordChange: user.forcePasswordChange
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password - send reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - MediFlow HMS',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #14b8a6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br/>
          <p>Best regards,<br/>MediFlow HMS Team</p>
        `
      });

      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({ 
        message: 'Email could not be sent. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

// @route   POST /api/auth/reset-password/:resetToken
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:resetToken', passwordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Hash token to compare with stored hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.forcePasswordChange = false;
    
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: error.message || 'Error resetting password' 
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password (user must be authenticated)
// @access  Private
router.put('/change-password', protect, [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  ...passwordValidation
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, password } = req.body;

    const user = await User.findById(req.user.id);

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Set new password
    user.password = password;
    user.forcePasswordChange = false;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password changed successfully',
      token
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ 
      message: error.message || 'Error changing password' 
    });
  }
});

// @route   PUT /api/auth/force-password-change/:userId
// @desc    Admin force password change
// @access  Private (Admin only)
router.put('/force-password-change/:userId', protect, async (req, res) => {
  try {
    // Check if requester is admin
    const requesterStaff = await HospitalStaff.findOne({ 
      userEmail: req.user.email 
    });
    
    if (!requesterStaff || requesterStaff.role !== 'HOSPITAL_ADMIN') {
      return res.status(403).json({ 
        message: 'Only hospital administrators can force password changes' 
      });
    }

    const targetUser = await User.findOne({ 
      email: req.params.userId 
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if target user is in same hospital
    const targetStaff = await HospitalStaff.findOne({ 
      userEmail: req.params.userId 
    });
    
    if (!targetStaff || targetStaff.hospitalId !== requesterStaff.hospitalId) {
      return res.status(403).json({ 
        message: 'You can only manage users in your hospital' 
      });
    }

    targetUser.forcePasswordChange = true;
    await targetUser.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'User will be required to change password on next login'
    });
  } catch (error) {
    console.error('Force password change error:', error);
    res.status(500).json({ message: 'Error forcing password change' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Public
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;