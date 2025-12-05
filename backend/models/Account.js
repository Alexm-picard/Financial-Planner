const mongoose = require('mongoose');

const monthlyPaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  linkedAccountId: {
    type: String,
    required: true
  },
  nextPaymentDate: {
    type: String,
    required: true
  }
}, { _id: false });

const incomeScheduleSchema = new mongoose.Schema({
  payDayDate: {
    type: String,
    required: true
  },
  estimatedEarnings: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly'],
    required: true
  }
}, { _id: false });

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  balance: {
    type: Number,
    required: [true, 'Balance is required'],
    default: 0
  },
  dueDate: {
    type: String,
    default: null
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['savings', 'debt'],
    required: [true, 'Account type is required']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  monthlyPayment: {
    type: monthlyPaymentSchema,
    default: null
  },
  incomeSchedule: {
    type: incomeScheduleSchema,
    default: null
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Indexes for common queries
accountSchema.index({ userId: 1, createdAt: -1 });
accountSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Account', accountSchema);
