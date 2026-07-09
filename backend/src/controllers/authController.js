const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const { success, error } = require('../utils/response');

/**
 * @desc 用户注册
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (ctx) => {
  const { username, email, password } = ctx.request.body;

  // 检查用户名是否已存在
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    return error(ctx, '用户名或邮箱已存在', 409);
  }

  // 创建用户
  const user = new User({
    username,
    email,
    password,
    nickname: username,
  });

  await user.save();

  // 生成 Token
  const token = jwt.sign(
    { userId: user._id, username: user.username },
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
    },
  }, '注册成功');
};

/**
 * @desc 用户登录
 * @route POST /api/auth/login
 * @access Public
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

  // 验证密码
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return error(ctx, '用户名或密码错误', 401);
  }

  // 更新登录时间
  await user.updateLoginTime(ctx.ip);

  // 生成 Token
  const token = jwt.sign(
    { userId: user._id, username: user.username },
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
      settings: user.settings,
    },
  }, '登录成功');
};

/**
 * @desc 获取当前用户信息
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = async (ctx) => {
  const user = ctx.state.user;
  success(ctx, {
    id: user._id,
    username: user.username,
    email: user.email,
    nickname: user.nickname,
    avatar: user.avatar,
    role: user.role,
    settings: user.settings,
    createdAt: user.createdAt,
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
