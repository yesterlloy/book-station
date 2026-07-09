const Router = require('koa-router');
const { getRank } = require('../controllers/novelController');

const router = new Router({ prefix: '/rank' });

// 获取排行榜
router.get('/:type', getRank);

module.exports = router;
