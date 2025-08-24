import mongoose from 'mongoose'

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
  },
  pincode: { // Remember: Internationalisation (come country has pincode numbers and alphabets. So type is String)
    type: String,
    required: true
  },
  specializedIn: [
    {
      type: String,
      required: true
    }
  ],
  phoneNumber: {
    type: String,
    required: true,
    match: [/^\+?[0-9]{7,15}$/, "Please enter a valid phone number"]
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"] 
  },
  totalBeds:{
    type: Number,
    default: 0,
    required: true
  },
  availableBeds: {
    type: Number,
    default: 0,
    required: true
  },
  facilities: [
    {
    type: String,
    enum: ["ICU", "Emergency", "Pharmacy", "Lab", "Blood Bank", "Radiology"]
    }
  ],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numberOfReviews: {
    type: Number,
    default: 0
  }
}, {timestamps: true});

export const Hospital = mongoose.model('Hospital', hospitalSchema);
