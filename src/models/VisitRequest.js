const mongoose = require('mongoose');

const visitRequestSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'scheduled', 'completed'],
    default: 'pending'
  },
  scheduledDate: Date,
  scheduledTime: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

visitRequestSchema.index({ landlord: 1, status: 1 });
visitRequestSchema.index({ tenant: 1, status: 1 });

module.exports = mongoose.model('VisitRequest', visitRequestSchema);