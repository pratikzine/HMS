const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['doctor', 'patient'],
      required: [true, 'Role is required'],
    },
    // Doctor-specific fields
    specialization: {
      type: String,
      default: '',
    },
    licenseNumber: {
      type: String,
      default: '',
    },
    experience: {
      type: Number,
      default: 0,
    },
    // Patient-specific fields
    age: {
      type: Number,
      default: null,
    },
    bloodGroup: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    height: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    // Common optional fields
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
