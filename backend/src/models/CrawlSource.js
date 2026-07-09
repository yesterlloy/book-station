const mongoose = require('mongoose');

const crawlSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  baseUrl: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  enabled: {
    type: Boolean,
    default: true,
    index: true,
  },
  priority: {
    type: Number,
    default: 10,
    index: true,
  },
  rateLimit: {
    type: Number,
    default: 1000, // ms
  },
  selectors: {
    novelList: String,
    novelTitle: String,
    novelAuthor: String,
    novelCover: String,
    novelDesc: String,
    novelCategory: String,
    novelStatus: String,
    chapterList: String,
    chapterTitle: String,
    chapterContent: String,
  },
  headers: {
    type: Map,
    of: String,
    default: {},
  },
  proxies: [{
    type: String,
  }],
  lastCrawledAt: {
    type: Date,
  },
}, {
  timestamps: true,
  collection: 'crawl_sources',
});

// 查询优化索引
crawlSourceSchema.index({ enabled: 1, priority: 1 });

// 静态方法：获取启用的源列表
crawlSourceSchema.statics.getEnabledSources = function() {
  return this.find({ enabled: true }).sort({ priority: 1 });
};

module.exports = mongoose.model('CrawlSource', crawlSourceSchema);
