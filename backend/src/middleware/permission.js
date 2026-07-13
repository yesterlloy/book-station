/**
 * 权限验证中间件
 */

const { error } = require('../utils/response');

/**
 * 角色枚举
 */
const ROLES = {
  ADMIN: 'admin',
  AUTHOR: 'author',
  READER: 'reader',
};

/**
 * 权限层级：级别越高权限越大
 */
const ROLE_HIERARCHY = {
  [ROLES.READER]: 1,
  [ROLES.AUTHOR]: 2,
  [ROLES.ADMIN]: 3,
};

/**
 * 检查用户是否拥有指定角色权限（含层级继承）
 * @param {string} userRole - 用户的角色
 * @param {string} requiredRole - 需要的最低角色权限
 * @returns {boolean}
 */
function hasRolePermission(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * 中间件：需要管理员权限
 */
function requireAdmin(ctx, next) {
  const user = ctx.state.user;

  if (!user) {
    return error(ctx, '请先登录', 401, 401);
  }

  if (user.role !== 'admin') {
    return error(ctx, '需要管理员权限', 403, 403);
  }

  return next();
}

/**
 * 中间件：需要作者权限（管理员也可以）
 */
function requireAuthor(ctx, next) {
  const user = ctx.state.user;

  if (!user) {
    return error(ctx, '请先登录', 401, 401);
  }

  if (user.role !== 'author' && user.role !== 'admin') {
    return error(ctx, '需要作者权限', 403, 403);
  }

  return next();
}

/**
 * 中间件：需要登录（任意已登录用户）
 */
function requireLogin(ctx, next) {
  if (!ctx.state.user) {
    return error(ctx, '请先登录', 401, 401);
  }
  return next();
}

/**
 * 中间件：验证是否是本人或管理员
 * @param {string} userIdParam - 用户ID在请求参数中的字段名
 */
function requireSelfOrAdmin(userIdParam = 'id') {
  return async function(ctx, next) {
    const user = ctx.state.user;

    if (!user) {
      return error(ctx, '请先登录', 401, 401);
    }

    // 管理员可以操作
    if (user.role === 'admin') {
      return next();
    }

    // 检查是否是本人
    const targetUserId = ctx.params[userIdParam] || ctx.request.body[userIdParam];
    if (targetUserId && user._id.toString() === targetUserId) {
      return next();
    }

    return error(ctx, '无权限执行此操作', 403, 403);
  };
}

/**
 * 中间件：检查用户状态是否正常
 */
function checkUserStatus(ctx, next) {
  const user = ctx.state.user;

  if (user && user.status === 'banned') {
    return error(ctx, '账号已被封禁', 403, 403);
  }

  if (user && user.status === 'pending') {
    return error(ctx, '账号待审核中', 403, 403);
  }

  return next();
}

/**
 * 中间件：自定义角色权限验证
 * @param {Array<string>} allowedRoles - 允许的角色列表
 */
function allowRoles(allowedRoles) {
  return function(ctx, next) {
    const user = ctx.state.user;

    if (!user) {
      return error(ctx, '请先登录', 401, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return error(ctx, `需要 ${allowedRoles.join('/')} 权限`, 403, 403);
    }

    return next();
  };
}

module.exports = {
  ROLES,
  hasRolePermission,
  requireAdmin,
  requireAuthor,
  requireLogin,
  requireSelfOrAdmin,
  checkUserStatus,
  allowRoles,
};
