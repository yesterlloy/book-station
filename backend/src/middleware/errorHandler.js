const config = require('../config');
const { error } = require('../utils/response');

const errorHandler = async (ctx, next) => {
  try {
    await next();

    // 404 处理
    if (ctx.status === 404 && !ctx.body) {
      error(ctx, '接口不存在', 404, 404);
    }
  } catch (err) {
    // 记录错误日志
    console.error('❌ Error:', err);

    // MongoDB 校验错误
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return error(ctx, `数据校验失败: ${errors.join(', ')}`, 400);
    }

    // MongoDB 重复键错误
    if (err.code === 11000) {
      const key = Object.keys(err.keyPattern)[0];
      return error(ctx, `${key} 已存在`, 409);
    }

    // 开发环境返回详细错误
    if (config.env === 'development') {
      return error(ctx, err.message, 500, 500);
    }

    // 生产环境返回通用错误
    error(ctx, '服务器内部错误', 500, 500);
  }
};

module.exports = errorHandler;
