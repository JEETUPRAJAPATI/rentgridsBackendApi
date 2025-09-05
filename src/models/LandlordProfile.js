const mongoose = require('mongoose');

const landlordProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dob: Date,
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'studio', 'pg', 'hostel']
  },
  totalProperties: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LandlordProfile', landlordProfileSchema);