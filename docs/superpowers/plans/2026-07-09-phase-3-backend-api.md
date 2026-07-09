# 阶段三：后端 API 接口开发 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 Koa2 构建完整的 RESTful API 接口，包含小说相关接口、用户认证、书架功能、阅读历史等，集成 Redis 缓存提升高并发性能。

**Architecture:** 分层架构（路由-控制器-服务-模型），JWT 认证，Redis 缓存热点数据，统一响应格式，参数校验，全局错误处理。

**Tech Stack:** Node.js 18+, Koa2, koa-router, koa-jwt, koa-bodyparser, joi, bcryptjs, Redis, MongoDB

## Global Constraints

- API 统一前缀: `/api`
- 统一响应格式: `{ code: 0, message: 'success', data: {} }`
- JWT Token 有效期: 7 天
- 章节内容缓存 TTL: 24 小时
- 列表接口默认分页大小: 20
- 所有接口必须有参数校验

---

## 后端 API 结构

```
backend/src/
├── app.js                        # 应用入口
├── config/                       # 配置
│   ├── database.js
│   ├── redis.js
│   └── index.js
├── models/                       # 数据模型
│   ├── Novel.js
│   ├── Chapter.js
│   ├── User.js
│   ├── Bookshelf.js
│   ├── ReadHistory.js
│   └── index.js
├── routes/                       # 路由
│   ├── index.js
│   ├── novels.js
│   ├── chapters.js
│   ├── categories.js
│   ├── rank.js
│   ├── auth.js
│   ├── user.js
│   ├── bookshelf.js
│   └── history.js
├── controllers/                  # 控制器
│   ├── novelController.js
│   ├── chapterController.js
│   ├── authController.js
│   ├── userController.js
│   ├── bookshelfController.js
│   └── historyController.js
├── services/                     # 业务服务层
│   ├── novelService.js
│   ├── chapterService.js
│   ├── userService.js
│   ├── cacheService.js
│   └── index.js
├── middleware/                   # 中间件
│   ├── auth.js                   # JWT 认证
│   ├── errorHandler.js           # 错误处理
│   ├── responseFormatter.js     # 响应格式化
│   ├── rateLimit.js              # 限流
│   └── validator.js              # 参数校验
├── utils/                        # 工具函数
│   ├── response.js               # 响应工具
│   ├── pagination.js             # 分页工具
│   └── validation.js             # 校验规则
└── tests/                        # 测试
    └── api.test.js
```

---

### Task 1: 中间件与工具函数

**Files:**
- Create: `backend/src/middleware/auth.js`
- Create: `backend/src/middleware/errorHandler.js`
- Create: `backend/src/middleware/responseFormatter.js`
- Create: `backend/src/middleware/rateLimit.js`
- Create: `backend/src/middleware/validator.js`
- Create: `backend/src/utils/response.js`
- Create: `backend/src/utils/pagination.js`
- Create: `backend/src/utils/validation.js`

**Steps:**

- [ ] **Step 1: 创建响应工具**

```javascript
// backend/src/utils/response.js
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
```

- [ ] **Step 2: 创建分页工具**

```javascript
// backend/src/utils/pagination.js
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
  const skip = (page - 1) * pageSize;
  
  return {
    page,
    pageSize,
    skip,
    limit: pageSize,
  };
};

const getSortParams = (query, defaultSort = { createdAt: -1 }) => {
  if (!query.sortBy) return defaultSort;
  
  const sortField = query.sortBy;
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  
  return { [sortField]: sortOrder };
};

module.exports = {
  getPaginationParams,
  getSortParams,
};
```

- [ ] **Step 3: 创建校验规则**

```javascript
// backend/src/utils/validation.js
const Joi = require('joi');

// 小说列表查询校验
const novelListSchema = Joi.object({
  category: Joi.string(),
  status: Joi.string().valid('连载中', '已完结'),
  keyword: Joi.string(),
  page: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100),
  sortBy: Joi.string(),
  sortOrder: Joi.string().valid('asc', 'desc'),
  isHot: Joi.boolean(),
});

// 小说详情查询校验
const novelDetailSchema = Joi.object({
  id: Joi.string().required(),
});

// 章节内容查询校验
const chapterContentSchema = Joi.object({
  id: Joi.string().required(),
});

// 注册校验
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
});

// 登录校验
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// 书架操作校验
const bookshelfSchema = Joi.object({
  novelId: Joi.string().required(),
});

// 阅读进度同步校验
const progressSchema = Joi.object({
  novelId: Joi.string().required(),
  chapterId: Joi.string().required(),
  chapterOrder: Joi.number().integer().min(1).required(),
  scrollPosition: Joi.number().min(0).default(0),
});

module.exports = {
  novelListSchema,
  novelDetailSchema,
  chapterContentSchema,
  registerSchema,
  loginSchema,
  bookshelfSchema,
  progressSchema,
};
```

- [ ] **Step 4: 创建 JWT 认证中间件**

```javascript
// backend/src/middleware/auth.js
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
```

- [ ] **Step 5: 创建参数校验中间件**

```javascript
// backend/src/middleware/validator.js
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
```

- [ ] **Step 6: 创建错误处理中间件**

```javascript
// backend/src/middleware/errorHandler.js
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
    
    // JWT 错误已在 auth 中间件处理
    
    // 开发环境返回详细错误
    if (config.env === 'development') {
      return error(ctx, err.message, 500, 500);
    }
    
    // 生产环境返回通用错误
    error(ctx, '服务器内部错误', 500, 500);
  }
};

module.exports = errorHandler;
```

- [ ] **Step 7: 创建限流中间件**

```javascript
// backend/src/middleware/rateLimit.js
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
```

---

### Task 2: 缓存服务层

**Files:**
- Create: `backend/src/services/cacheService.js`
- Create: `backend/src/services/index.js`

**Steps:**

- [ ] **Step 1: 创建缓存服务**

```javascript
// backend/src/services/cacheService.js
const { cache, getRedis } = require('../config/redis');

// 缓存键前缀
const PREFIXES = {
  CHAPTER: 'chapter:',
  NOVEL: 'novel:',
  NOVEL_CHAPTERS: 'novel_chapters:',
  CATEGORY: 'category:',
  RANK: 'rank:',
  HOT: 'hot:',
  USER_BOOKSHELF: 'user_bookshelf:',
};

// 缓存 TTL（秒）
const TTL = {
  CHAPTER: 24 * 60 * 60,      // 24 小时
  NOVEL: 60 * 60,              // 1 小时
  NOVEL_CHAPTERS: 30 * 60,     // 30 分钟
  CATEGORY: 2 * 60 * 60,       // 2 小时
  RANK: 60 * 60,                // 1 小时
  HOT: 30 * 60,                 // 30 分钟
  USER_BOOKSHELF: 10 * 60,      // 10 分钟
};

class CacheService {
  /**
   * 获取章节内容缓存
   */
  static async getChapter(chapterId) {
    return await cache.get(`${PREFIXES.CHAPTER}${chapterId}`);
  }

  /**
   * 设置章节内容缓存
   */
  static async setChapter(chapterId, data) {
    await cache.set(`${PREFIXES.CHAPTER}${chapterId}`, data, TTL.CHAPTER);
  }

  /**
   * 删除章节缓存
   */
  static async deleteChapter(chapterId) {
    await cache.del(`${PREFIXES.CHAPTER}${chapterId}`);
  }

  /**
   * 获取小说详情缓存
   */
  static async getNovel(novelId) {
    return await cache.get(`${PREFIXES.NOVEL}${novelId}`);
  }

  /**
   * 设置小说详情缓存
   */
  static async setNovel(novelId, data) {
    await cache.set(`${PREFIXES.NOVEL}${novelId}`, data, TTL.NOVEL);
  }

  /**
   * 删除小说相关缓存
   */
  static async deleteNovelCache(novelId) {
    const redis = getRedis();
    const keys = [
      `${PREFIXES.NOVEL}${novelId}`,
      `${PREFIXES.NOVEL_CHAPTERS}${novelId}`,
    ];
    await redis.del(...keys);
  }

  /**
   * 获取小说章节列表缓存
   */
  static async getNovelChapters(novelId, page = 1) {
    return await cache.get(`${PREFIXES.NOVEL_CHAPTERS}${novelId}:${page}`);
  }

  /**
   * 设置小说章节列表缓存
   */
  static async setNovelChapters(novelId, page, data) {
    await cache.set(
      `${PREFIXES.NOVEL_CHAPTERS}${novelId}:${page}`,
      data,
      TTL.NOVEL_CHAPTERS
    );
  }

  /**
   * 获取分类小说列表缓存
   */
  static async getCategoryList(category, page) {
    return await cache.get(`${PREFIXES.CATEGORY}${category}:${page}`);
  }

  /**
   * 设置分类小说列表缓存
   */
  static async setCategoryList(category, page, data) {
    await cache.set(
      `${PREFIXES.CATEGORY}${category}:${page}`,
      data,
      TTL.CATEGORY
    );
  }

  /**
   * 获取排行榜缓存
   */
  static async getRank(type, page) {
    return await cache.get(`${PREFIXES.RANK}${type}:${page}`);
  }

  /**
   * 设置排行榜缓存
   */
  static async setRank(type, page, data) {
    await cache.set(`${PREFIXES.RANK}${type}:${page}`, data, TTL.RANK);
  }

  /**
   * 获取热门小说缓存
   */
  static async getHotNovels() {
    return await cache.get(`${PREFIXES.HOT}novels`);
  }

  /**
   * 设置热门小说缓存
   */
  static async setHotNovels(data) {
    await cache.set(`${PREFIXES.HOT}novels`, data, TTL.HOT);
  }

  /**
   * 清除所有小说列表相关缓存（分类、排行榜、热门）
   */
  static async clearListCache() {
    const redis = getRedis();
    const keys = [];
    
    // 使用 scan 查找相关键
    // 生产环境建议更高效的方式
    for await (const key of redis.scanIterator({
      MATCH: `${PREFIXES.CATEGORY}*`,
      COUNT: 100,
    })) {
      keys.push(key);
    }
    
    for await (const key of redis.scanIterator({
      MATCH: `${PREFIXES.RANK}*`,
      COUNT: 100,
    })) {
      keys.push(key);
    }
    
    for await (const key of redis.scanIterator({
      MATCH: `${PREFIXES.HOT}*`,
      COUNT: 100,
    })) {
      keys.push(key);
    }
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  /**
   * 清除用户书架缓存
   */
  static async deleteUserBookshelf(userId) {
    await cache.del(`${PREFIXES.USER_BOOKSHELF}${userId}`);
  }
}

module.exports = CacheService;
```

```javascript
// backend/src/services/index.js
const CacheService = require('./cacheService');

module.exports = {
  CacheService,
};
```

---

### Task 3: 小说与章节控制器

**Files:**
- Create: `backend/src/controllers/novelController.js`
- Create: `backend/src/controllers/chapterController.js`

**Steps:**

- [ ] **Step 1: 创建小说控制器**

```javascript
// backend/src/controllers/novelController.js
const { Novel, Chapter } = require('../models');
const { success, paginate } = require('../utils/response');
const { getPaginationParams, getSortParams } = require('../utils/pagination');
const CacheService = require('../services/cacheService');

/**
 * @desc 获取小说列表
 * @route GET /api/novels
 * @access Public
 */
const getNovelList = async (ctx) => {
  const { category, status, keyword, isHot } = ctx.request.query;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);
  const sort = getSortParams(ctx.request.query, { 'lastChapter.updateTime': -1 });

  // 构建查询条件
  const query = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (isHot !== undefined) query.isHot = isHot === 'true';

  // 全文搜索
  if (keyword) {
    query.$text = { $search: keyword };
  }

  // 尝试从缓存获取（仅针对无搜索词的分类查询）
  let cachedData;
  if (!keyword && category) {
    cachedData = await CacheService.getCategoryList(category, page);
  } else if (!keyword && isHot) {
    cachedData = await CacheService.getHotNovels();
  }

  if (cachedData) {
    ctx.set('X-Cache', 'HIT');
    return paginate(ctx, cachedData.list, cachedData.total, page, pageSize);
  }

  ctx.set('X-Cache', 'MISS');

  // 执行查询
  const [list, total] = await Promise.all([
    Novel.find(query)
      .select('title author cover category status viewCount favoriteCount lastChapter')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Novel.countDocuments(query),
  ]);

  // 缓存结果
  if (!keyword) {
    if (category) {
      await CacheService.setCategoryList(category, page, { list, total });
    } else if (isHot) {
      await CacheService.setHotNovels({ list, total });
    }
  }

  paginate(ctx, list, total, page, pageSize);
};

/**
 * @desc 获取小说详情
 * @route GET /api/novels/:id
 * @access Public
 */
const getNovelDetail = async (ctx) => {
  const { id } = ctx.params;

  // 尝试从缓存获取
  const cachedNovel = await CacheService.getNovel(id);
  if (cachedNovel) {
    ctx.set('X-Cache', 'HIT');
    return success(ctx, cachedNovel);
  }

  ctx.set('X-Cache', 'MISS');

  const novel = await Novel.findById(id).lean();
  if (!novel) {
    ctx.throw(404, '小说不存在');
  }

  // 获取章节数量
  const chapterCount = await Chapter.countDocuments({ novelId: id });
  novel.chapterCount = chapterCount;

  // 增加阅读次数
  await Novel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

  // 缓存结果
  await CacheService.setNovel(id, novel);

  success(ctx, novel);
};

/**
 * @desc 获取小说章节列表
 * @route GET /api/novels/:id/chapters
 * @access Public
 */
const getNovelChapters = async (ctx) => {
  const { id } = ctx.params;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);

  // 尝试从缓存获取
  const cachedData = await CacheService.getNovelChapters(id, page);
  if (cachedData) {
    ctx.set('X-Cache', 'HIT');
    return paginate(ctx, cachedData.list, cachedData.total, page, pageSize);
  }

  ctx.set('X-Cache', 'MISS');

  const [list, total] = await Promise.all([
    Chapter.find({ novelId: id })
      .select('title order wordCount createdAt')
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Chapter.countDocuments({ novelId: id }),
  ]);

  // 缓存结果
  await CacheService.setNovelChapters(id, page, { list, total });

  paginate(ctx, list, total, page, pageSize);
};

/**
 * @desc 获取分类列表
 * @route GET /api/categories
 * @access Public
 */
const getCategories = async (ctx) => {
  const categories = [
    { id: '玄幻', name: '玄幻奇幻', count: 0 },
    { id: '都市', name: '都市言情', count: 0 },
    { id: '武侠', name: '武侠仙侠', count: 0 },
    { id: '科幻', name: '科幻灵异', count: 0 },
    { id: '历史', name: '历史军事', count: 0 },
    { id: '其他', name: '其他类型', count: 0 },
  ];

  // 统计每个分类的小说数量
  const stats = await Novel.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  stats.forEach((item) => {
    const category = categories.find((c) => c.id === item._id);
    if (category) {
      category.count = item.count;
    }
  });

  success(ctx, categories);
};

/**
 * @desc 获取排行榜
 * @route GET /api/rank/:type
 * @access Public
 */
const getRank = async (ctx) => {
  const { type } = ctx.params;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);

  let sortField = 'viewCount';
  if (type === 'hot') sortField = 'viewCount';
  if (type === 'new') sortField = 'lastChapter.updateTime';
  if (type === 'update') sortField = 'updatedAt';

  // 尝试从缓存获取
  const cachedData = await CacheService.getRank(type, page);
  if (cachedData) {
    ctx.set('X-Cache', 'HIT');
    return paginate(ctx, cachedData.list, cachedData.total, page, pageSize);
  }

  ctx.set('X-Cache', 'MISS');

  const [list, total] = await Promise.all([
    Novel.find({})
      .select('title author cover category status viewCount favoriteCount')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Novel.countDocuments({}),
  ]);

  // 缓存结果
  await CacheService.setRank(type, page, { list, total });

  paginate(ctx, list, total, page, pageSize);
};

module.exports = {
  getNovelList,
  getNovelDetail,
  getNovelChapters,
  getCategories,
  getRank,
};
```

- [ ] **Step 2: 创建章节控制器**

```javascript
// backend/src/controllers/chapterController.js
const { Chapter, Novel } = require('../models');
const { success } = require('../utils/response');
const CacheService = require('../services/cacheService');

/**
 * @desc 获取章节内容
 * @route GET /api/chapters/:id
 * @access Public
 */
const getChapterContent = async (ctx) => {
  const { id } = ctx.params;

  // 尝试从缓存获取
  const cachedChapter = await CacheService.getChapter(id);
  if (cachedChapter) {
    ctx.set('X-Cache', 'HIT');
    return success(ctx, cachedChapter);
  }

  ctx.set('X-Cache', 'MISS');

  const chapter = await Chapter.findById(id).lean();
  if (!chapter) {
    ctx.throw(404, '章节不存在');
  }

  // 获取相邻章节
  const [prevChapter, nextChapter] = await Promise.all([
    Chapter.findOne(
      { novelId: chapter.novelId, order: chapter.order - 1 },
      '_id title order'
    ).lean(),
    Chapter.findOne(
      { novelId: chapter.novelId, order: chapter.order + 1 },
      '_id title order'
    ).lean(),
  ]);

  const result = {
    ...chapter,
    prev: prevChapter,
    next: nextChapter,
  };

  // 缓存章节内容（热点数据，缓存时间长）
  await CacheService.setChapter(id, result);

  success(ctx, result);
};

/**
 * @desc 获取指定序号的章节
 * @route GET /api/novels/:novelId/chapters/:order
 * @access Public
 */
const getChapterByOrder = async (ctx) => {
  const { novelId, order } = ctx.params;

  const chapter = await Chapter.findOne({ novelId, order: parseInt(order) }).lean();
  if (!chapter) {
    ctx.throw(404, '章节不存在');
  }

  // 重定向到章节详情接口（利用缓存）
  ctx.params.id = chapter._id.toString();
  await getChapterContent(ctx);
};

module.exports = {
  getChapterContent,
  getChapterByOrder,
};
```

---

### Task 4: 用户认证与书架控制器

**Files:**
- Create: `backend/src/controllers/authController.js`
- Create: `backend/src/controllers/userController.js`
- Create: `backend/src/controllers/bookshelfController.js`
- Create: `backend/src/controllers/historyController.js`

**Steps:**

- [ ] **Step 1: 创建认证控制器**

```javascript
// backend/src/controllers/authController.js
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
```

- [ ] **Step 2: 创建用户控制器**

```javascript
// backend/src/controllers/userController.js
const { User } = require('../models');
const { success } = require('../utils/response');

/**
 * @desc 更新用户信息
 * @route PUT /api/user/profile
 * @access Private
 */
const updateProfile = async (ctx) => {
  const { nickname, avatar } = ctx.request.body;
  const userId = ctx.state.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { nickname, avatar },
    { new: true, runValidators: true }
  ).select('-password');

  success(ctx, user, '更新成功');
};

/**
 * @desc 更新阅读设置
 * @route PUT /api/user/settings
 * @access Private
 */
const updateSettings = async (ctx) => {
  const { fontSize, theme, bgColor, lineHeight } = ctx.request.body;
  const userId = ctx.state.user._id;

  const updateData = {};
  if (fontSize !== undefined) updateData['settings.fontSize'] = fontSize;
  if (theme !== undefined) updateData['settings.theme'] = theme;
  if (bgColor !== undefined) updateData['settings.bgColor'] = bgColor;
  if (lineHeight !== undefined) updateData['settings.lineHeight'] = lineHeight;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  ).select('-password');

  success(ctx, user.settings, '设置更新成功');
};

module.exports = {
  updateProfile,
  updateSettings,
};
```

- [ ] **Step 3: 创建书架控制器**

```javascript
// backend/src/controllers/bookshelfController.js
const { Bookshelf, Novel } = require('../models');
const { success, paginate, error } = require('../utils/response');
const { getPaginationParams } = require('../utils/pagination');
const CacheService = require('../services/cacheService');

/**
 * @desc 获取用户书架
 * @route GET /api/bookshelf
 * @access Private
 */
const getBookshelf = async (ctx) => {
  const userId = ctx.state.user._id;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);

  const [list, total] = await Promise.all([
    Bookshelf.find({ userId })
      .sort({ lastReadAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Bookshelf.countDocuments({ userId }),
  ]);

  paginate(ctx, list, total, page, pageSize);
};

/**
 * @desc 添加到书架
 * @route POST /api/bookshelf
 * @access Private
 */
const addToBookshelf = async (ctx) => {
  const { novelId } = ctx.request.body;
  const userId = ctx.state.user._id;

  // 检查小说是否存在
  const novel = await Novel.findById(novelId);
  if (!novel) {
    return error(ctx, '小说不存在', 404);
  }

  // 检查是否已在书架
  const existing = await Bookshelf.findOne({ userId, novelId });
  if (existing) {
    return error(ctx, '已在书架中', 409);
  }

  // 添加到书架
  const bookshelf = new Bookshelf({
    userId,
    novelId,
    novelTitle: novel.title,
    author: novel.author,
    cover: novel.cover,
    lastReadAt: new Date(),
  });

  await bookshelf.save();

  // 清除缓存
  await CacheService.deleteUserBookshelf(userId);

  success(ctx, bookshelf, '添加成功');
};

/**
 * @desc 从书架移除
 * @route DELETE /api/bookshelf/:novelId
 * @access Private
 */
const removeFromBookshelf = async (ctx) => {
  const { novelId } = ctx.params;
  const userId = ctx.state.user._id;

  await Bookshelf.findOneAndDelete({ userId, novelId });

  // 清除缓存
  await CacheService.deleteUserBookshelf(userId);

  success(ctx, null, '移除成功');
};

/**
 * @desc 更新阅读进度
 * @route PUT /api/bookshelf/:novelId/progress
 * @access Private
 */
const updateReadProgress = async (ctx) => {
  const { novelId } = ctx.params;
  const { chapterId, chapterTitle, chapterOrder, progress } = ctx.request.body;
  const userId = ctx.state.user._id;

  await Bookshelf.findOneAndUpdate(
    { userId, novelId },
    {
      $set: {
        lastReadChapter: { id: chapterId, title: chapterTitle, order: chapterOrder },
        lastReadAt: new Date(),
        readProgress: progress || 0,
      },
    },
    { upsert: true }
  );

  success(ctx, null, '进度更新成功');
};

module.exports = {
  getBookshelf,
  addToBookshelf,
  removeFromBookshelf,
  updateReadProgress,
};
```

- [ ] **Step 4: 创建阅读历史控制器**

```javascript
// backend/src/controllers/historyController.js
const { ReadHistory, Novel, Chapter } = require('../models');
const { success, paginate } = require('../utils/response');
const { getPaginationParams } = require('../utils/pagination');

/**
 * @desc 获取阅读历史
 * @route GET /api/history
 * @access Private/Optional
 */
const getHistory = async (ctx) => {
  const user = ctx.state.user;
  const { page, pageSize, skip, limit } = getPaginationParams(ctx.request.query);

  let query = {};
  if (user) {
    query.userId = user._id;
  } else {
    // 未登录用户使用 deviceId（从 header 或 query 获取）
    const deviceId = ctx.headers['x-device-id'] || ctx.request.query.deviceId;
    if (deviceId) {
      query.deviceId = deviceId;
    } else {
      return paginate(ctx, [], 0, page, pageSize);
    }
  }

  const [list, total] = await Promise.all([
    ReadHistory.find(query)
      .sort({ readAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('novelId', 'title author cover status')
      .lean(),
    ReadHistory.countDocuments(query),
  ]);

  paginate(ctx, list, total, page, pageSize);
};

/**
 * @desc 同步阅读进度
 * @route POST /api/history/progress
 * @access Private/Optional
 */
const syncProgress = async (ctx) => {
  const { novelId, chapterId, chapterOrder, scrollPosition } = ctx.request.body;
  const user = ctx.state.user;
  const deviceId = ctx.headers['x-device-id'];

  const query = {};
  if (user) {
    query.userId = user._id;
  } else if (deviceId) {
    query.deviceId = deviceId;
  } else {
    return success(ctx, null, '无需同步');
  }

  // 更新或创建历史记录
  await ReadHistory.findOneAndUpdate(
    { ...query, novelId },
    {
      novelId,
      chapterId,
      chapterOrder,
      scrollPosition,
      readAt: new Date(),
    },
    { upsert: true, new: true }
  );

  success(ctx, null, '进度同步成功');
};

module.exports = {
  getHistory,
  syncProgress,
};
```

---

### Task 5: 路由配置

**Files:**
- Create: `backend/src/routes/novels.js`
- Create: `backend/src/routes/chapters.js`
- Create: `backend/src/routes/categories.js`
- Create: `backend/src/routes/rank.js`
- Create: `backend/src/routes/auth.js`
- Create: `backend/src/routes/user.js`
- Create: `backend/src/routes/bookshelf.js`
- Create: `backend/src/routes/history.js`
- Create: `backend/src/routes/index.js`
- Update: `backend/src/app.js`

**Steps:**

- [ ] **Step 1: 创建各模块路由**

```javascript
// backend/src/routes/novels.js
const Router = require('koa-router');
const { 
  getNovelList, 
  getNovelDetail, 
  getNovelChapters 
} = require('../controllers/novelController');
const validate = require('../middleware/validator');
const { novelListSchema, novelDetailSchema } = require('../utils/validation');

const router = new Router({ prefix: '/novels' });

// 获取小说列表
router.get('/', validate(novelListSchema, 'query'), getNovelList);

// 获取小说详情
router.get('/:id', validate(novelDetailSchema, 'params'), getNovelDetail);

// 获取小说章节列表
router.get('/:id/chapters', getNovelChapters);

// 获取指定序号的章节
router.get('/:novelId/chapters/:order', require('../controllers/chapterController').getChapterByOrder);

module.exports = router;
```

```javascript
// backend/src/routes/chapters.js
const Router = require('koa-router');
const { getChapterContent } = require('../controllers/chapterController');
const validate = require('../middleware/validator');
const { chapterContentSchema } = require('../utils/validation');

const router = new Router({ prefix: '/chapters' });

// 获取章节内容
router.get('/:id', validate(chapterContentSchema, 'params'), getChapterContent);

module.exports = router;
```

```javascript
// backend/src/routes/categories.js
const Router = require('koa-router');
const { getCategories } = require('../controllers/novelController');

const router = new Router({ prefix: '/categories' });

// 获取分类列表
router.get('/', getCategories);

module.exports = router;
```

```javascript
// backend/src/routes/rank.js
const Router = require('koa-router');
const { getRank } = require('../controllers/novelController');

const router = new Router({ prefix: '/rank' });

// 获取排行榜
router.get('/:type', getRank);

module.exports = router;
```

```javascript
// backend/src/routes/auth.js
const Router = require('koa-router');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { registerSchema, loginSchema } = require('../utils/validation');

const router = new Router({ prefix: '/auth' });

// 注册
router.post('/register', validate(registerSchema), register);

// 登录
router.post('/login', validate(loginSchema), login);

// 获取当前用户信息
router.get('/me', auth, getCurrentUser);

module.exports = router;
```

```javascript
// backend/src/routes/user.js
const Router = require('koa-router');
const { updateProfile, updateSettings } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = new Router({ prefix: '/user' });

// 更新用户信息
router.put('/profile', auth, updateProfile);

// 更新阅读设置
router.put('/settings', auth, updateSettings);

module.exports = router;
```

```javascript
// backend/src/routes/bookshelf.js
const Router = require('koa-router');
const { 
  getBookshelf, 
  addToBookshelf, 
  removeFromBookshelf,
  updateReadProgress 
} = require('../controllers/bookshelfController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { bookshelfSchema } = require('../utils/validation');

const router = new Router({ prefix: '/bookshelf' });

// 获取书架
router.get('/', auth, getBookshelf);

// 添加到书架
router.post('/', auth, validate(bookshelfSchema), addToBookshelf);

// 从书架移除
router.delete('/:novelId', auth, removeFromBookshelf);

// 更新阅读进度
router.put('/:novelId/progress', auth, updateReadProgress);

module.exports = router;
```

```javascript
// backend/src/routes/history.js
const Router = require('koa-router');
const { getHistory, syncProgress } = require('../controllers/historyController');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { progressSchema } = require('../utils/validation');

const router = new Router({ prefix: '/history' });

// 获取阅读历史
router.get('/', optionalAuth, getHistory);

// 同步阅读进度
router.post('/progress', optionalAuth, validate(progressSchema), syncProgress);

module.exports = router;
```

- [ ] **Step 2: 创建路由总入口**

```javascript
// backend/src/routes/index.js
const Router = require('koa-router');
const config = require('../config');

const novelsRouter = require('./novels');
const chaptersRouter = require('./chapters');
const categoriesRouter = require('./categories');
const rankRouter = require('./rank');
const authRouter = require('./auth');
const userRouter = require('./user');
const bookshelfRouter = require('./bookshelf');
const historyRouter = require('./history');

const router = new Router({ prefix: config.apiPrefix });

// 健康检查
router.get('/health', async (ctx) => {
  ctx.body = {
    code: 0,
    message: 'success',
    data: {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
    },
  };
});

// 挂载子路由
router.use(novelsRouter.routes(), novelsRouter.allowedMethods());
router.use(chaptersRouter.routes(), chaptersRouter.allowedMethods());
router.use(categoriesRouter.routes(), categoriesRouter.allowedMethods());
router.use(rankRouter.routes(), rankRouter.allowedMethods());
router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(userRouter.routes(), userRouter.allowedMethods());
router.use(bookshelfRouter.routes(), bookshelfRouter.allowedMethods());
router.use(historyRouter.routes(), historyRouter.allowedMethods());

module.exports = router;
```

- [ ] **Step 3: 更新 app.js 集成所有中间件和路由**

替换 `backend/src/app.js` 的内容：

```javascript
const Koa = require('koa');
const cors = require('koa-cors');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const config = require('./config');
const connectDatabase = require('./config/database');
const { connectRedis } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('./middleware/rateLimit');
const router = require('./routes');

const app = new Koa();

// 信任代理
app.proxy = true;

// 中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
}));

// 请求日志（仅开发环境）
if (config.env === 'development') {
  app.use(logger());
}

// 限流中间件
app.use(rateLimit(100, 60)); // 每分钟 100 次

// 解析请求体
app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb',
}));

// 错误处理
app.use(errorHandler);

// 挂载路由
app.use(router.routes()).use(router.allowedMethods());

// 启动服务
const startServer = async () => {
  console.log('🚀 Starting BookStation Server...');
  console.log(`📦 Environment: ${config.env}`);

  // 连接数据库
  await connectDatabase();
  await connectRedis();

  // 启动 HTTP 服务
  app.listen(config.port, () => {
    console.log(`🌐 Server running on http://localhost:${config.port}`);
    console.log(`📡 Health check: http://localhost:${config.port}${config.apiPrefix}/health`);
    console.log(`📚 API docs: http://localhost:${config.port}${config.apiPrefix}/`);
  });
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
```

---

### Task 6: API 测试

**Files:**
- Create: `backend/test-api.sh`

**Steps:**

- [ ] **Step 1: 创建 API 测试脚本**

```bash
#!/bin/bash
# API 测试脚本

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing BookStation API..."
echo ""

# 1. 健康检查
echo "1️⃣ Testing health check..."
curl -s "$BASE_URL/health" | head -100
echo ""
echo ""

# 2. 获取分类列表
echo "2️⃣ Testing categories..."
curl -s "$BASE_URL/categories"
echo ""
echo ""

# 3. 获取小说列表
echo "3️⃣ Testing novel list..."
curl -s "$BASE_URL/novels?page=1&pageSize=5"
echo ""
echo ""

# 4. 用户注册
echo "4️⃣ Testing user register..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
  }')
echo $REGISTER_RESPONSE
echo ""
echo ""

# 5. 用户登录
echo "5️⃣ Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456"
  }')
echo $LOGIN_RESPONSE

# 提取 Token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo ""
echo "🔑 Token: ${TOKEN:0:50}..."
echo ""

# 6. 获取当前用户信息
echo "6️⃣ Testing get current user..."
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "✅ API tests completed!"
```

- [ ] **Step 2: 运行测试**

```bash
cd backend
npm install  # 确保依赖安装
npm run dev  # 启动服务

# 新开终端运行测试
chmod +x test-api.sh
./test-api.sh
```

---

## 阶段三验收标准

- [ ] 所有中间件实现完整（认证、限流、错误处理、参数校验）
- [ ] 缓存服务层实现（Redis 缓存策略）
- [ ] 小说列表/详情/章节接口正常工作
- [ ] 分类、排行榜接口正常工作
- [ ] 用户注册/登录/认证功能正常
- [ ] 书架功能（增删查）正常工作
- [ ] 阅读历史/进度同步功能正常
- [ ] API 响应格式统一，错误处理完善
- [ ] 限流功能生效
- [ ] Redis 缓存命中率符合预期

---

**计划结束**
