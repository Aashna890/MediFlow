import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  patientId: {
    type: String,
    required: true
  },
  panNumber: String,
  aadhaarNumber: String,
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
  },
  phone: String,
  email: String,
  address: String,
  city: String,
  emergencyContactName: String,
  emergencyContactPhone: String,
  emergencyContactRelation: String,
  patientType: {
    type: String,
    enum: ['OPD', 'IPD'],
    default: 'OPD'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DISCHARGED', 'TRANSFERRED', 'DECEASED'],
    default: 'ACTIVE'
  },
  assignedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalStaff'
  },
  department: String,
  photoUrl: String,
  medicalHistory: String,
  allergies: String,
  admissionDate: Date,
  dischargeDate: Date,
  roomNumber: String,
  bedNumber: String,
  importedFromHospital: String,
  importedRecords: [mongoose.Schema.Types.Mixed]
}, {
  timestamps: true
});

// Compound index for tenant isolation
patientSchema.index({ hospitalId: 1, patientId: 1 });
patientSchema.index({ panNumber: 1 });
patientSchema.index({ aadhaarNumber: 1 });

export default mongoose.model('Patient', patientSchema);
