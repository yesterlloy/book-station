const mongoose = require('mongoose');

const novelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  cover: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['玄幻', '都市', '言情', '科幻', '历史', '武侠', '仙侠', '游戏', '悬疑', '其他'],
    default: '其他',
    index: true,
  },
  status: {
    type: String,
    enum: ['连载中', '已完结'],
    default: '连载中',
    index: true,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  chapterCount: {
    type: Number,
    default: 0,
  },
  lastChapter: {
    title: String,
    id: mongoose.Schema.Types.ObjectId,
    updateTime: Date,
  },
  // 作者信息（原创作者）
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  source: {
    name: String,
    url: String,
    novelId: String,
    isOriginal: {
      type: Boolean,
      default: false,
    },
  },
  tags: [{
    type: String,
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
    index: true,
  },
  favoriteCount: {
    type: Number,
    default: 0,
  },
  isHot: {
    type: Boolean,
    default: false,
    index: true,
  },
  isRecommend: {
    type: Boolean,
    default: false,
  },
  lastCrawledAt: {
    type: Date,
  },
}, {
  timestamps: true,
  collection: 'novels',
});

// 全文搜索索引
novelSchema.index(
  { title: 'text', author: 'text', description: 'text' },
  { weights: { title: 10, author: 5, description: 1 } }
);

// 唯一索引：同一作者的小说不能重名
novelSchema.index({ title: 1, author: 1 }, { unique: true });

// 静态方法：按分类获取列表
novelSchema.statics.findByCategory = function(category, page = 1, limit = 20) {
  return this.find({ category })
    .sort({ 'lastChapter.updateTime': -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// 静态方法：搜索小说
novelSchema.statics.search = function(keyword, page = 1, limit = 20) {
  return this.find({ $text: { $search: keyword } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(limit);
};

// 增加阅读次数
novelSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('Novel', novelSchema);
