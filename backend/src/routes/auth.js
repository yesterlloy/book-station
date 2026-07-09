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
