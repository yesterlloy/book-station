const { User, Novel, Chapter } = require('../models');
const { success, error } = require('../utils/response');
const { getPaginationParams } = require('../utils/pagination');

/**
 * 管理员获取用户列表
 * GET /api/admin/users
 */
const getUserList = async (ctx) => {
  const { page, limit, skip } = getPaginationParams(ctx.query);
  const { role, status, keyword } = ctx.query;

  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (keyword) {
    query.$or = [
      { username: new RegExp(keyword, 'i') },
      { email: new RegExp(keyword, 'i') },
      { nickname: new RegExp(keyword, 'i') },
    ];
  }

  const [list, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  success(ctx, {
    list,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

/**
 * 管理员获取单个用户详情
 * GET /api/admin/users/:id
 */
const getUserDetail = async (ctx) => {
  const { id } = ctx.params;

  const user = await User.findById(id).select('-password').lean();
  if (!user) {
    return error(ctx, '用户不存在', 404);
  }

  success(ctx, user);
};

/**
 * 修改用户角色
 * PUT /api/admin/users/:id/role
 */
const updateUserRole = async (ctx) => {
  const { id } = ctx.params;
  const { role } = ctx.request.body;

  if (!['admin', 'author', 'reader'].includes(role)) {
    return error(ctx, '无效的角色类型', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    return error(ctx, '用户不存在', 404);
  }

  // 不能修改自己的角色
  if (user._id.toString() === ctx.state.user._id.toString()) {
    return error(ctx, '不能修改自己的角色', 400);
  }

  const oldRole = user.role;
  user.role = role;

  // 如果升级为作者，初始化作者资料
  if (role === 'author' && oldRole !== 'author') {
    user.authorProfile = user.authorProfile || {};
    user.authorProfile.penName = user.authorProfile.penName || user.nickname || user.username;
    user.authorProfile.joinDate = new Date();
  }

  await user.save();

  success(ctx, { userId: user._id, oldRole, newRole: role }, '角色修改成功');
};

/**
 * 修改用户状态
 * PUT /api/admin/users/:id/status
 */
const updateUserStatus = async (ctx) => {
  const { id } = ctx.params;
  const { status } = ctx.request.body;

  if (!['active', 'banned', 'pending'].includes(status)) {
    return error(ctx, '无效的状态类型', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    return error(ctx, '用户不存在', 404);
  }

  // 不能修改自己的状态
  if (user._id.toString() === ctx.state.user._id.toString()) {
    return error(ctx, '不能修改自己的状态', 400);
  }

  const oldStatus = user.status;
  user.status = status;
  await user.save();

  success(ctx, { userId: user._id, oldStatus, newStatus: status }, '状态修改成功');
};

/**
 * 删除用户
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (ctx) => {
  const { id } = ctx.params;

  // 不能删除自己
  if (id === ctx.state.user._id.toString()) {
    return error(ctx, '不能删除自己', 400);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return error(ctx, '用户不存在', 404);
  }

  success(ctx, { userId: id }, '用户删除成功');
};

/**
 * 审核作者认证
 * PUT /api/admin/users/:id/verify-author
 */
const verifyAuthor = async (ctx) => {
  const { id } = ctx.params;
  const { isVerified } = ctx.request.body;

  const user = await User.findById(id);
  if (!user) {
    return error(ctx, '用户不存在', 404);
  }

  if (user.role !== 'author') {
    return error(ctx, '该用户不是作者', 400);
  }

  user.authorProfile.isVerified = isVerified;
  await user.save();

  success(ctx, {
    userId: user._id,
    isVerified,
    penName: user.authorProfile.penName,
  }, isVerified ? '作者认证通过' : '已取消作者认证');
};

/**
 * 获取系统统计
 * GET /api/admin/stats
 */
const getSystemStats = async (ctx) => {
  const [
    totalUsers,
    totalNovels,
    totalChapters,
    todayUsers,
    roleStats,
  ] = await Promise.all([
    User.countDocuments(),
    Novel.countDocuments(),
    Chapter.countDocuments(),
    User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    User.getRoleStats(),
  ]);

  success(ctx, {
    users: {
      total: totalUsers,
      todayNew: todayUsers,
      byRole: roleStats.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    },
    novels: {
      total: totalNovels,
    },
    chapters: {
      total: totalChapters,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getUserList,
  getUserDetail,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  verifyAuthor,
  getSystemStats,
};
