/**
 * 成功响应
 */
const success = (ctx, data = null, message = 'success', code = 0) => {
  ctx.status = 200;
  ctx.body = {
    code,
    message,
    data,
    timestamp: Date.now(),
  };
};

/**
 * 错误响应
 */
const error = (ctx, message = 'error', code = 400, status = 200) => {
  ctx.status = status;
  ctx.body = {
    code,
    message,
    data: null,
    timestamp: Date.now(),
  };
};

/**
 * 分页响应
 */
const paginate = (ctx, list, total, page = 1, pageSize = 20) => {
  success(ctx, {
    list,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

module.exports = {
  success,
  error,
  paginate,
};
