const { error } = require('../utils/response');

/**
 * 请求参数校验中间件生成器
 */
const validate = (schema, source = 'body') => {
  return async (ctx, next) => {
    const data = source === 'query' ? ctx.request.query :
                 source === 'params' ? ctx.params :
                 ctx.request.body;

    const { error: validationError, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (validationError) {
      const errors = validationError.details.map(d => d.message);
      return error(ctx, `参数校验失败: ${errors.join(', ')}`, 400);
    }

    // 将校验后的值挂到 ctx 上
    ctx.state.validatedData = value;
    await next();
  };
};

module.exports = validate;
