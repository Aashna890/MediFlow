import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tenantId: {
    type: String,
    required: true,
    unique: true
  },
  address: String,
  city: String,
  state: String,
  phone: String,
  email: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  departments: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
    default: 'PENDING'
  },
  logoUrl: String,
  settings: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

export default mongoose.model('Hospital', hospitalSchema);
