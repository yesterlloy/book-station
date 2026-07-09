const Router = require('koa-router');
const { getCategories } = require('../controllers/novelController');

const router = new Router({ prefix: '/categories' });

// 获取分类列表
router.get('/', getCategories);

module.exports = router;
