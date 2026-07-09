const mongoose = require('mongoose');

const readHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  deviceId: {
    type: String,
    index: true,
  },
  novelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true,
    index: true,
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  },
  chapterOrder: {
    type: Number,
    required: true,
  },
  scrollPosition: {
    type: Number,
    default: 0,
  },
  readAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'read_history',
});

// 复合唯一索引：登录用户
readHistorySchema.index({ userId: 1, novelId: 1 }, { unique: true, sparse: true });

// 复合唯一索引：未登录用户
readHistorySchema.index({ deviceId: 1, novelId: 1 }, { unique: true, sparse: true });

// 查询优化索引
readHistorySchema.index({ userId: 1, readAt: -1 });

// 静态方法：获取用户阅读历史
readHistorySchema.statics.getUserHistory = function(userId, deviceId, page = 1, limit = 20) {
  const query = userId ? { userId } : { deviceId };
  return this.find(query)
    .sort({ readAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('novelId', 'title author cover status');
};

module.exports = mongoose.model('ReadHistory', readHistorySchema);
