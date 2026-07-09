const Router = require('koa-router');
const {
  getNovelList,
  getNovelDetail,
  getNovelChapters,
} = require('../controllers/novelController');
const { getChapterByOrder } = require('../controllers/chapterController');
const validate = require('../middleware/validator');
const { novelListSchema, novelDetailSchema } = require('../utils/validation');

const router = new Router({ prefix: '/novels' });

// 获取小说列表
router.get('/', validate(novelListSchema, 'query'), getNovelList);

// 获取小说详情
router.get('/:id', validate(novelDetailSchema, 'params'), getNovelDetail);

// 获取小说章节列表
router.get('/:id/chapters', getNovelChapters);

// 获取指定序号的章节
router.get('/:novelId/chapters/:order', getChapterByOrder);

module.exports = router;
