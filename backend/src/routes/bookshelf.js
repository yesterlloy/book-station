const Router = require('koa-router');
const {
  getBookshelf,
  addToBookshelf,
  removeFromBookshelf,
  updateReadProgress,
} = require('../controllers/bookshelfController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { bookshelfSchema } = require('../utils/validation');

const router = new Router({ prefix: '/bookshelf' });

// 获取书架
router.get('/', auth, getBookshelf);

// 添加到书架
router.post('/', auth, validate(bookshelfSchema), addToBookshelf);

// 从书架移除
router.delete('/:novelId', auth, removeFromBookshelf);

// 更新阅读进度
router.put('/:novelId/progress', auth, updateReadProgress);

module.exports = router;
