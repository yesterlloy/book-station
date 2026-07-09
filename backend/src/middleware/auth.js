const jwt = require('jsonwebtoken');
const config = require('../config');
const { error } = require('../utils/response');
const { User } = require('../models');

/**
 * JWT 认证中间件
 */
const auth = async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return error(ctx, '未提供认证令牌', 401, 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return error(ctx, '用户不存在', 401, 401);
    }

    ctx.state.user = user;
    await next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(ctx, '令牌已过期', 401, 401);
    }
    return error(ctx, '无效的认证令牌', 401, 401);
  }
};

/**
 * 可选认证中间件（登录状态下附加用户信息）
 */
const optionalAuth = async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId).select('-password');
      ctx.state.user = user;
    } catch (err) {
      // Token 无效也继续，不抛出错误
    }
  }

  await next();
};

module.exports = {
  auth,
  optionalAuth,
};
