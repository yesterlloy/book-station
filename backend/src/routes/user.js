const Router = require('koa-router');
const {
  updateProfile,
  updateSettings,
  getSettings,
  changePassword,
  getPublicProfile,
} = require('../controllers/userController');
const { requireLogin } = require('../middleware/permission');

const router = new Router({ prefix: '/user' });

// 获取用户公开信息（不需要登录，或需要登录看其他用户）
router.get('/profile/:id', getPublicProfile);

// 以下需要登录
router.put('/profile', requireLogin, updateProfile);
router.get('/settings', requireLogin, getSettings);
router.put('/settings', requireLogin, updateSettings);
router.put('/password', requireLogin, changePassword);

module.exports = router;
