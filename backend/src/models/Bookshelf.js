const mongoose = require('mongoose');

const bookshelfSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  novelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true,
    index: true,
  },
  novelTitle: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
  },
  lastReadChapter: {
    id: mongoose.Schema.Types.ObjectId,
    title: String,
    order: Number,
  },
  lastReadAt: {
    type: Date,
    default: Date.now,
  },
  readProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  totalChapters: {
    type: Number,
    default: 0,
  },
  isNotify: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'bookshelves',
});

// 复合唯一索引：同一用户不能重复收藏同一小说
bookshelfSchema.index({ userId: 1, novelId: 1 }, { unique: true });

// 查询优化索引
bookshelfSchema.index({ userId: 1, lastReadAt: -1 });
bookshelfSchema.index({ userId: 1, createdAt: -1 });

// 静态方法：获取用户书架
bookshelfSchema.statics.getUserBookshelf = function(userId, page = 1, limit = 20) {
  return this.find({ userId })
    .sort({ lastReadAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

module.exports = mongoose.model('Bookshelf', bookshelfSchema);
