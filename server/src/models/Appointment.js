import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: String,
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalStaff',
    required: true
  },
  doctorName: String,
  department: String,
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: String,
  type: {
    type: String,
    enum: ['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE_CHECKUP'],
    default: 'CONSULTATION'
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  },
  notes: String,
  reason: String
}, {
  timestamps: true
});

appointmentSchema.index({ hospitalId: 1, appointmentDate: 1 });

export default mongoose.model('Appointment', appointmentSchema);
