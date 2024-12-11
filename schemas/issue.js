const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: String,
  description: String,
  latitude: Number,
  longitude: Number,
  location: String,
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  type: String
});

module.exports = mongoose.model('Issue', issueSchema);
