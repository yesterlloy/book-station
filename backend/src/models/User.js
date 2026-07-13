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
  // 角色字段：admin(管理员), author(作者), reader(普通读者)
  role: {
    type: String,
    enum: ['admin', 'author', 'reader'],
    default: 'reader',
    index: true,
  },
  // 作者专属字段
  authorProfile: {
    penName: { type: String, trim: true },  // 笔名
    bio: { type: String, trim: true },       // 作者简介
    signature: { type: String, trim: true }, // 签名
    totalNovels: { type: Number, default: 0 }, // 作品总数
    totalWords: { type: Number, default: 0 }, // 总字数
    isVerified: { type: Boolean, default: false }, // 是否认证作者
    joinDate: { type: Date }, // 成为作者日期
  },
  // 用户状态
  status: {
    type: String,
    enum: ['active', 'banned', 'pending'], // 正常/封禁/待审核
    default: 'active',
    index: true,
  },
  // 用户统计
  stats: {
    readCount: { type: Number, default: 0 },  // 阅读书籍数
    totalReadTime: { type: Number, default: 0 }, // 总阅读时长（分钟）
    favoriteCount: { type: Number, default: 0 }, // 收藏数
    commentCount: { type: Number, default: 0 },  // 评论数
  },
  // 阅读设置
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
    autoFlip: {
      type: Boolean,
      default: true, // 自动翻页
    },
    autoNextChapter: {
      type: Boolean,
      default: true, // 自动跳转下一章
    },
  },
  // VIP 相关
  vip: {
    isVip: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
    expireAt: { type: Date },
  },
  // 最后登录信息
  lastLoginAt: {
    type: Date,
  },
  lastLoginIp: {
    type: String,
  },
  // 注册 IP
  registerIp: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'users',
});

// 索引优化
userSchema.index({ username: 1, status: 1 });
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, status: 1 });

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

// 检查是否为管理员
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// 检查是否为作者（包含管理员）
userSchema.methods.isAuthor = function() {
  return this.role === 'author' || this.role === 'admin';
};

// 检查是否为普通读者
userSchema.methods.isReader = function() {
  return this.role === 'reader';
};

// 升级为作者
userSchema.methods.becomeAuthor = function(penName, bio) {
  this.role = 'author';
  this.authorProfile.penName = penName;
  this.authorProfile.bio = bio;
  this.authorProfile.joinDate = new Date();
  return this.save();
};

// 静态方法：获取角色统计
userSchema.statics.getRoleStats = function() {
  return this.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $project: { role: '$_id', count: 1, _id: 0 } }
  ]);
};

module.exports = mongoose.model('User', userSchema);
