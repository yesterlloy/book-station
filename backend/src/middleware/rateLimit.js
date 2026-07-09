const { getRedis } = require('../config/redis');
const { error } = require('../utils/response');

/**
 * 简单的限流中间件（基于 Redis）
 */
const rateLimit = (maxRequests = 100, windowSeconds = 60) => {
  return async (ctx, next) => {
    const redis = getRedis();
    const ip = ctx.ip || ctx.request.ip;
    const key = `rate_limit:${ip}`;

    try {
      const requests = await redis.incr(key);

      if (requests === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (requests > maxRequests) {
        const ttl = await redis.ttl(key);
        ctx.set('Retry-After', ttl);
        return error(ctx, '请求过于频繁，请稍后再试', 429, 429);
      }

      ctx.set('X-RateLimit-Limit', maxRequests);
      ctx.set('X-RateLimit-Remaining', maxRequests - requests);

      await next();
    } catch (err) {
      // Redis 出错时不阻止请求
      await next();
    }
  };
};

module.exports = rateLimit;
