const Router = require('koa-router');
const { updateProfile, updateSettings } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = new Router({ prefix: '/user' });

// 更新用户信息
router.put('/profile', auth, updateProfile);

// 更新阅读设置
router.put('/settings', auth, updateSettings);

module.exports = router;
