const Joi = require('joi');

// 小说列表查询校验
const novelListSchema = Joi.object({
  category: Joi.string(),
  status: Joi.string(),
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
