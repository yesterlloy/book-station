const { ReadHistory } = require('../models');
const { success, paginate } = require('../utils/response');
const { getPaginationParams } = require('../utils/pagination');

/**
 * @desc 获取阅读历史
 * @route GET /api/history
 * @access Private/Optional
 */
const getHistory = async (ctx) => {
  const user = ctx.state.user;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);

  let query = {};
  if (user) {
    query.userId = user._id;
  } else {
    // 未登录用户使用 deviceId（从 header 或 query 获取）
    const deviceId = ctx.headers['x-device-id'] || ctx.request.query.deviceId;
    if (deviceId) {
      query.deviceId = deviceId;
    } else {
      return paginate(ctx, [], 0, page, pageSize);
    }
  }

  const [list, total] = await Promise.all([
    ReadHistory.find(query)
      .sort({ readAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('novelId', 'title author cover status')
      .lean(),
    ReadHistory.countDocuments(query),
  ]);

  paginate(ctx, list, total, page, pageSize);
};

/**
 * @desc 同步阅读进度
 * @route POST /api/history/progress
 * @access Private/Optional
 */
const syncProgress = async (ctx) => {
  const { novelId, chapterId, chapterOrder, scrollPosition } = ctx.request.body;
  const user = ctx.state.user;
  const deviceId = ctx.headers['x-device-id'];

  const query = {};
  if (user) {
    query.userId = user._id;
  } else if (deviceId) {
    query.deviceId = deviceId;
  } else {
    return success(ctx, null, '无需同步');
  }

  // 更新或创建历史记录
  await ReadHistory.findOneAndUpdate(
    { ...query, novelId },
    {
      novelId,
      chapterId,
      chapterOrder,
      scrollPosition,
      readAt: new Date(),
    },
    { upsert: true, new: true }
  );

  success(ctx, null, '进度同步成功');
};

module.exports = {
  getHistory,
  syncProgress,
};
