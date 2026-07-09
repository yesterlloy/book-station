const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
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
  order: {
    type: Number,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  sourceUrl: {
    type: String,
    trim: true,
  },
  isVip: {
    type: Boolean,
    default: false,
  },
  isFree: {
    type: Boolean,
    default: true,
  },
  hash: {
    type: String,
    index: true,
  },
  crawledAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'chapters',
});

// 复合唯一索引：同一小说同一序号只能有一章
chapterSchema.index({ novelId: 1, order: 1 }, { unique: true });

// 查询优化索引
chapterSchema.index({ novelId: 1, _id: 1 });

// 静态方法：获取小说的章节列表
chapterSchema.statics.getNovelChapters = function(novelId, page = 1, limit = 100) {
  return this.find({ novelId })
    .select('title order wordCount createdAt')
    .sort({ order: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// 静态方法：获取相邻章节
chapterSchema.statics.getAdjacentChapters = async function(novelId, order) {
  const [prev, next] = await Promise.all([
    this.findOne({ novelId, order: order - 1 }).select('_id title order'),
    this.findOne({ novelId, order: order + 1 }).select('_id title order'),
  ]);
  return { prev, next };
};

module.exports = mongoose.model('Chapter', chapterSchema);
