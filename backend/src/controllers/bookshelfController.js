const { Bookshelf, Novel } = require('../models');
const { success, paginate, error } = require('../utils/response');
const { getPaginationParams } = require('../utils/pagination');
const CacheService = require('../services/cacheService');

/**
 * @desc 获取用户书架
 * @route GET /api/bookshelf
 * @access Private
 */
const getBookshelf = async (ctx) => {
  const userId = ctx.state.user._id;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);

  const [list, total] = await Promise.all([
    Bookshelf.find({ userId })
      .sort({ lastReadAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Bookshelf.countDocuments({ userId }),
  ]);

  paginate(ctx, list, total, page, pageSize);
};

/**
 * @desc 添加到书架
 * @route POST /api/bookshelf
 * @access Private
 */
const addToBookshelf = async (ctx) => {
  const { novelId } = ctx.request.body;
  const userId = ctx.state.user._id;

  // 检查小说是否存在
  const novel = await Novel.findById(novelId);
  if (!novel) {
    return error(ctx, '小说不存在', 404);
  }

  // 检查是否已在书架
  const existing = await Bookshelf.findOne({ userId, novelId });
  if (existing) {
    return error(ctx, '已在书架中', 409);
  }

  // 添加到书架
  const bookshelf = new Bookshelf({
    userId,
    novelId,
    novelTitle: novel.title,
    author: novel.author,
    cover: novel.cover,
    lastReadAt: new Date(),
  });

  await bookshelf.save();

  // 清除缓存
  await CacheService.deleteUserBookshelf(userId);

  success(ctx, bookshelf, '添加成功');
};

/**
 * @desc 从书架移除
 * @route DELETE /api/bookshelf/:novelId
 * @access Private
 */
const removeFromBookshelf = async (ctx) => {
  const { novelId } = ctx.params;
  const userId = ctx.state.user._id;

  await Bookshelf.findOneAndDelete({ userId, novelId });

  // 清除缓存
  await CacheService.deleteUserBookshelf(userId);

  success(ctx, null, '移除成功');
};

/**
 * @desc 更新阅读进度
 * @route PUT /api/bookshelf/:novelId/progress
 * @access Private
 */
const updateReadProgress = async (ctx) => {
  const { novelId } = ctx.params;
  const { chapterId, chapterTitle, chapterOrder, progress } = ctx.request.body;
  const userId = ctx.state.user._id;

  await Bookshelf.findOneAndUpdate(
    { userId, novelId },
    {
      $set: {
        lastReadChapter: { id: chapterId, title: chapterTitle, order: chapterOrder },
        lastReadAt: new Date(),
        readProgress: progress || 0,
      },
    },
    { upsert: true }
  );

  success(ctx, null, '进度更新成功');
};

module.exports = {
  getBookshelf,
  addToBookshelf,
  removeFromBookshelf,
  updateReadProgress,
};
