import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patientPan: String,
  patientAadhaar: String,
  patientName: String,
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  hospitalName: String,
  recordType: {
    type: String,
    enum: ['DIAGNOSIS', 'PRESCRIPTION', 'LAB_REPORT', 'ADMISSION', 'DISCHARGE', 'SURGERY', 'ALLERGY', 'VACCINATION'],
    required: true
  },
  recordDate: {
    type: Date,
    default: Date.now
  },
  diagnosis: String,
  treatment: String,
  medicines: [mongoose.Schema.Types.Mixed],
  labResults: String,
  doctorName: String,
  department: String,
  notes: String,
  attachments: [String],
  isShared: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

medicalRecordSchema.index({ patientPan: 1 });
medicalRecordSchema.index({ patientAadhaar: 1 });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
