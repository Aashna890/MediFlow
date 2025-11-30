import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  prescriptionId: {
    type: String,
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
  diagnosis: String,
  symptoms: String,
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  notes: String,
  followUpDate: Date,
  status: {
    type: String,
    enum: ['ACTIVE', 'DISPENSED', 'COMPLETED', 'CANCELLED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

prescriptionSchema.index({ hospitalId: 1, patientId: 1 });

export default mongoose.model('Prescription', prescriptionSchema);
