const { Novel, Chapter } = require('../models');
const { success, paginate } = require('../utils/response');
const { getPaginationParams, getSortParams } = require('../utils/pagination');
const CacheService = require('../services/cacheService');

/**
 * @desc 获取小说列表
 * @route GET /api/novels
 * @access Public
 */
const getNovelList = async (ctx) => {
  const { category, status, keyword, isHot } = ctx.request.query;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);
  const sort = getSortParams(ctx.request.query, { 'lastChapter.updateTime': -1 });

  // 构建查询条件
  const query = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (isHot !== undefined) query.isHot = isHot === 'true';

  // 全文搜索
  if (keyword) {
    query.$text = { $search: keyword };
  }

  // 尝试从缓存获取（仅针对无搜索词的分类查询）
  let cachedData;
  if (!keyword && category) {
    cachedData = await CacheService.getCategoryList(category, page);
  } else if (!keyword && isHot) {
    cachedData = await CacheService.getHotNovels();
  }

  if (cachedData) {
    ctx.set('X-Cache', 'HIT');
    return paginate(ctx, cachedData.list, cachedData.total, page, pageSize);
  }

  ctx.set('X-Cache', 'MISS');

  // 执行查询
  const [list, total] = await Promise.all([
    Novel.find(query)
      .select('title author cover category status viewCount favoriteCount lastChapter')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Novel.countDocuments(query),
  ]);

  // 缓存结果
  if (!keyword) {
    if (category) {
      await CacheService.setCategoryList(category, page, { list, total });
    } else if (isHot) {
      await CacheService.setHotNovels({ list, total });
    }
  }

  paginate(ctx, list, total, page, pageSize);
};

/**
 * @desc 获取小说详情
 * @route GET /api/novels/:id
 * @access Public
 */
const getNovelDetail = async (ctx) => {
  const { id } = ctx.params;

  // 尝试从缓存获取
  const cachedNovel = await CacheService.getNovel(id);
  if (cachedNovel) {
    ctx.set('X-Cache', 'HIT');
    return success(ctx, cachedNovel);
  }

  ctx.set('X-Cache', 'MISS');

  const novel = await Novel.findById(id).lean();
  if (!novel) {
    ctx.throw(404, '小说不存在');
  }

  // 获取章节数量
  const chapterCount = await Chapter.countDocuments({ novelId: id });
  novel.chapterCount = chapterCount;

  // 增加阅读次数
  await Novel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

  // 缓存结果
  await CacheService.setNovel(id, novel);

  success(ctx, novel);
};

/**
 * @desc 获取小说章节列表
 * @route GET /api/novels/:id/chapters
 * @access Public
 */
const getNovelChapters = async (ctx) => {
  const { id } = ctx.params;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);

  // 尝试从缓存获取
  const cachedData = await CacheService.getNovelChapters(id, page);
  if (cachedData) {
    ctx.set('X-Cache', 'HIT');
    return paginate(ctx, cachedData.list, cachedData.total, page, pageSize);
  }

  ctx.set('X-Cache', 'MISS');

  const [list, total] = await Promise.all([
    Chapter.find({ novelId: id })
      .select('title order wordCount createdAt')
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Chapter.countDocuments({ novelId: id }),
  ]);

  // 缓存结果
  await CacheService.setNovelChapters(id, page, { list, total });

  paginate(ctx, list, total, page, pageSize);
};

/**
 * @desc 获取分类列表
 * @route GET /api/categories
 * @access Public
 */
const getCategories = async (ctx) => {
  const categories = [
    { id: '玄幻', name: '玄幻奇幻', count: 0 },
    { id: '都市', name: '都市言情', count: 0 },
    { id: '武侠', name: '武侠仙侠', count: 0 },
    { id: '科幻', name: '科幻灵异', count: 0 },
    { id: '历史', name: '历史军事', count: 0 },
    { id: '其他', name: '其他类型', count: 0 },
  ];

  // 统计每个分类的小说数量
  const stats = await Novel.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  stats.forEach((item) => {
    const category = categories.find((c) => c.id === item._id);
    if (category) {
      category.count = item.count;
    }
  });

  success(ctx, categories);
};

/**
 * @desc 获取排行榜
 * @route GET /api/rank/:type
 * @access Public
 */
const getRank = async (ctx) => {
  const { type } = ctx.params;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);

  let sortField = 'viewCount';
  if (type === 'hot') sortField = 'viewCount';
  if (type === 'new') sortField = 'lastChapter.updateTime';
  if (type === 'update') sortField = 'updatedAt';

  // 尝试从缓存获取
  const cachedData = await CacheService.getRank(type, page);
  if (cachedData) {
    ctx.set('X-Cache', 'HIT');
    return paginate(ctx, cachedData.list, cachedData.total, page, pageSize);
  }

  ctx.set('X-Cache', 'MISS');

  const [list, total] = await Promise.all([
    Novel.find({})
      .select('title author cover category status viewCount favoriteCount')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Novel.countDocuments({}),
  ]);

  // 缓存结果
  await CacheService.setRank(type, page, { list, total });

  paginate(ctx, list, total, page, pageSize);
};

module.exports = {
  getNovelList,
  getNovelDetail,
  getNovelChapters,
  getCategories,
  getRank,
};
