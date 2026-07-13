const Router = require('koa-router');
const { register, login, getCurrentUser, refreshToken, logout } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validator');
const Joi = require('joi');

const router = new Router({ prefix: '/auth' });

// 注册校验
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
  role: Joi.string().valid('reader', 'author').default('reader'),
});

// 登录校验
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// 注册
router.post('/register', validate(registerSchema), register);

// 登录
router.post('/login', validate(loginSchema), login);

// 获取当前用户信息
router.get('/me', auth, getCurrentUser);

// 刷新 Token
router.post('/refresh', auth, refreshToken);

// 登出
router.post('/logout', auth, logout);

module.exports = router;
