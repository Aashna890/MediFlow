import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  passwordHistory: [{
    password: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  forcePasswordChange: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  passwordChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

// Validate password strength before saving
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Check password policy
  if (!passwordRegex.test(this.password)) {
    return next(new Error('Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#)'));
  }

  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Store old password in history before hashing new one
    if (this.isModified('password') && !this.isNew) {
      // Check if new password matches any of last 3 passwords
      const last3Passwords = this.passwordHistory.slice(-3);
      for (const oldPass of last3Passwords) {
        const isMatch = await bcrypt.compare(this.password, oldPass.password);
        if (isMatch) {
          return next(new Error('New password cannot be same as last 3 passwords'));
        }
      }

      // Add current password to history before updating
      this.passwordHistory.push({
        password: await bcrypt.hash(this.password, 10),
        changedAt: new Date()
      });

      // Keep only last 5 passwords in history
      if (this.passwordHistory.length > 5) {
        this.passwordHistory = this.passwordHistory.slice(-5);
      }
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
    
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire (1 hour)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  
  return resetToken;
};

// Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;