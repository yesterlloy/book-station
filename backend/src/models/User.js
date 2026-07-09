const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // 默认不返回密码字段
  },
  avatar: {
    type: String,
    trim: true,
  },
  nickname: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  settings: {
    fontSize: {
      type: Number,
      default: 18,
      min: 12,
      max: 28,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'sepia'],
      default: 'light',
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
    lineHeight: {
      type: Number,
      default: 1.6,
      min: 1.2,
      max: 2.5,
    },
  },
  lastLoginAt: {
    type: Date,
  },
  lastLoginIp: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'users',
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 更新登录时间
userSchema.methods.updateLoginTime = function(ip) {
  this.lastLoginAt = new Date();
  this.lastLoginIp = ip;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
