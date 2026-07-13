const Router = require('koa-router');
const {
  getUserList,
  getUserDetail,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  verifyAuthor,
  getSystemStats,
} = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/permission');

const router = new Router({ prefix: '/admin' });

// 所有管理员路由都需要管理员权限
router.use(requireAdmin);

// 用户管理
router.get('/users', getUserList);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// 作者管理
router.put('/users/:id/verify-author', verifyAuthor);

// 系统统计
router.get('/stats', getSystemStats);

module.exports = router;
