import mongoose from 'mongoose'

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  diagonsedWith: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  BloodGroup: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ["M", "F", "O"],
    required: true
  },

  // relations
  admittedIn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  },

  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
  },

  // admission/discharge
  admissionDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  dischargeDate: {
    type: Date
  },

  isDischarged: {
    type: Boolean,
    default: false
  },
  
  // billing

  totalBill: {
    type: Number,
    default: 0
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Partially Paid"],
    default: "Pending"
  }
}, {timestamps: true})

export const Patient = mongoose.model("Patient", patientSchema)

// here patient is a like thet user.
/*
-The phrase “diagnosed with” is used when a doctor or medical professional identifies a disease, condition, or disorder in a person.

-to be found to have a particular illness or condition after medical tests or examination
*/