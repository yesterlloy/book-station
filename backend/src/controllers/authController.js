const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const { success, error } = require('../utils/response');

/**
 * 用户注册
 * POST /api/auth/register
 */
const register = async (ctx) => {
  const { username, email, password, role } = ctx.request.body;

  // 检查用户名是否已存在
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    return error(ctx, '用户名或邮箱已存在', 409);
  }

  // 默认角色是 reader，不允许直接注册为 admin
  const userRole = role === 'author' ? 'author' : 'reader';

  // 创建用户
  const user = new User({
    username,
    email,
    password,
    nickname: username,
    role: userRole,
    registerIp: ctx.ip,
    // 如果是作者，初始化作者资料
    authorProfile: userRole === 'author' ? {
      penName: username,
      joinDate: new Date(),
    } : undefined,
  });

  await user.save();

  // 生成 Token
  const token = jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  success(ctx, {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
    },
  }, '注册成功');
};

/**
 * 用户登录
 * POST /api/auth/login
 */
const login = async (ctx) => {
  const { username, password } = ctx.request.body;

  // 查找用户
  const user = await User.findOne({
    $or: [{ username }, { email: username }]
  }).select('+password');

  if (!user) {
    return error(ctx, '用户名或密码错误', 401);
  }

  // 检查用户状态
  if (user.status === 'banned') {
    return error(ctx, '账号已被封禁', 403);
  }
  if (user.status === 'pending') {
    return error(ctx, '账号待审核中', 403);
  }

  // 验证密码
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return error(ctx, '用户名或密码错误', 401);
  }

  // 更新登录时间
  await user.updateLoginTime(ctx.ip);

  // 生成 Token
  const token = jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  success(ctx, {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      settings: user.settings,
    },
  }, '登录成功');
};

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
const getCurrentUser = async (ctx) => {
  const user = ctx.state.user;

  // 获取完整的用户信息
  const fullUser = await User.findById(user._id);

  success(ctx, {
    id: fullUser._id,
    username: fullUser.username,
    email: fullUser.email,
    nickname: fullUser.nickname,
    avatar: fullUser.avatar,
    role: fullUser.role,
    status: fullUser.status,
    settings: fullUser.settings,
    authorProfile: fullUser.role === 'author' ? fullUser.authorProfile : undefined,
    vip: fullUser.vip,
    stats: fullUser.stats,
    createdAt: fullUser.createdAt,
    lastLoginAt: fullUser.lastLoginAt,
  });
};

/**
 * 刷新 Token
 * POST /api/auth/refresh
 */
const refreshToken = async (ctx) => {
  const user = ctx.state.user;

  // 生成新 Token
  const token = jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  success(ctx, { token }, 'Token 刷新成功');
};

/**
 * 用户登出（客户端清除 token 即可，服务端不需要操作）
 * POST /api/auth/logout
 */
const logout = async (ctx) => {
  success(ctx, null, '登出成功');
};

module.exports = {
  register,
  login,
  getCurrentUser,
  refreshToken,
  logout,
};
