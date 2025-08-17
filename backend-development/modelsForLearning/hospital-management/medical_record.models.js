import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  diagnosis: {
    type: String,
    required: true
  },

  medications: [
    {
      name: { type: String, required: true },  // e.g., "Paracetamol"
      dosage: { type: String, required: true }, // e.g., "500mg twice a day"
      duration: { type: String, required: true } // e.g., "5 days"
    }
  ],

  labTests: [
    {
      testName: { type: String, required: true },  // e.g., "Blood Test"
      result: { type: String },                    // e.g., "Normal"
      date: { type: Date, default: Date.now }
    }
  ],

  treatmentNotes: {
    type: String, // Free text notes by doctor
  },

  followUpDate: {
    type: Date
  },

}, { timestamps: true });

export const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
