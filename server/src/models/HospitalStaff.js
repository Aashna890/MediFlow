import mongoose from 'mongoose';

const hospitalStaffSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: String,
  role: {
    type: String,
    enum: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST', 'RECEPTIONIST'],
    default: 'RECEPTIONIST'
  },
  department: String,
  specialization: String,
  licenseNumber: String,
  shift: {
    type: String,
    enum: ['MORNING', 'AFTERNOON', 'NIGHT', 'FLEXIBLE']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'LOCKED'],
    default: 'ACTIVE'
  },
  profilePhoto: String
}, {
  timestamps: true
});

// Compound index for tenant isolation
hospitalStaffSchema.index({ hospitalId: 1, userEmail: 1 });

export default mongoose.model('HospitalStaff', hospitalStaffSchema);