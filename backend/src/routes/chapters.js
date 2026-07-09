const Router = require('koa-router');
const { getChapterContent } = require('../controllers/chapterController');
const validate = require('../middleware/validator');
const { chapterContentSchema } = require('../utils/validation');

const router = new Router({ prefix: '/chapters' });

// 获取章节内容
router.get('/:id', validate(chapterContentSchema, 'params'), getChapterContent);

module.exports = router;
