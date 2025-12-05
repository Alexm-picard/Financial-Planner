const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true // This automatically creates an index
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index: true // Index for faster email lookups
  },
  picture: {
    type: String,
    trim: true
  },
  customUserId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows multiple null values but enforces uniqueness for non-null values
    lowercase: true,
    minlength: [3, 'Custom User ID must be at least 3 characters'],
    maxlength: [50, 'Custom User ID cannot exceed 50 characters'],
    match: [/^[a-z0-9_-]+$/, 'Custom User ID can only contain lowercase letters, numbers, hyphens, and underscores']
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Note: customUserId already has an index from unique: true, so no need to add another

// Note: uid already has an index from unique: true, so no need to add another

module.exports = mongoose.model('User', userSchema);
