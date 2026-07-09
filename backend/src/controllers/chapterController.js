const { Chapter } = require('../models');
const { success } = require('../utils/response');
const CacheService = require('../services/cacheService');

/**
 * @desc 获取章节内容
 * @route GET /api/chapters/:id
 * @access Public
 */
const getChapterContent = async (ctx) => {
  const { id } = ctx.params;

  // 尝试从缓存获取
  const cachedChapter = await CacheService.getChapter(id);
  if (cachedChapter) {
    ctx.set('X-Cache', 'HIT');
    return success(ctx, cachedChapter);
  }

  ctx.set('X-Cache', 'MISS');

  const chapter = await Chapter.findById(id).lean();
  if (!chapter) {
    ctx.throw(404, '章节不存在');
  }

  // 获取相邻章节
  const [prevChapter, nextChapter] = await Promise.all([
    Chapter.findOne(
      { novelId: chapter.novelId, order: chapter.order - 1 },
      '_id title order'
    ).lean(),
    Chapter.findOne(
      { novelId: chapter.novelId, order: chapter.order + 1 },
      '_id title order'
    ).lean(),
  ]);

  const result = {
    ...chapter,
    prev: prevChapter,
    next: nextChapter,
  };

  // 缓存章节内容（热点数据，缓存时间长）
  await CacheService.setChapter(id, result);

  success(ctx, result);
};

/**
 * @desc 获取指定序号的章节
 * @route GET /api/novels/:novelId/chapters/:order
 * @access Public
 */
const getChapterByOrder = async (ctx) => {
  const { novelId, order } = ctx.params;

  const chapter = await Chapter.findOne({ novelId, order: parseInt(order) }).lean();
  if (!chapter) {
    ctx.throw(404, '章节不存在');
  }

  // 重定向到章节详情接口（利用缓存）
  ctx.params.id = chapter._id.toString();
  await getChapterContent(ctx);
};

module.exports = {
  getChapterContent,
  getChapterByOrder,
};
