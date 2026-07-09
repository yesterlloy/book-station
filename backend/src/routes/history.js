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
