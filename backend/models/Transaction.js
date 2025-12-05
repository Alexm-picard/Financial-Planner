const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: [true, 'Account ID is required']
  },
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: [true, 'Transaction type is required']
  },
  previousBalance: {
    type: Number,
    default: null
  },
  newBalance: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Indexes for common queries
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ accountId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
