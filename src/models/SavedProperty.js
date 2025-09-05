const mongoose = require('mongoose');

const savedPropertySchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

savedPropertySchema.index({ tenant: 1 });
savedPropertySchema.index({ tenant: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('SavedProperty', savedPropertySchema);