const Redis = require('ioredis');
const config = require('./index');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error.message);
    process.exit(1);
  }
};

// 获取 Redis 客户端
const getRedis = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis first.');
  }
  return redisClient;
};

// 缓存辅助函数
const cache = {
  async get(key) {
    const value = await getRedis().get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key, value, ttl = 3600) {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttl);
  },

  async del(key) {
    await getRedis().del(key);
  },

  async exists(key) {
    return (await getRedis().exists(key)) === 1;
  },
};

module.exports = { connectRedis, getRedis, cache };
