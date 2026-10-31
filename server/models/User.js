const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    password_hash: {
      type: String,
      required: [true, 'Password is required'],
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    avatar: {
      type: String,
      default: 'doge',
    },
    // New profile fields
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: 400,
    },
    year: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    lookingFor: {
      type: [String],
      default: [],
    },
    // Saved items
    savedTopics: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    }],
    savedActivities: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
    }],
    reputation_pts: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password_hash')) return;
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
