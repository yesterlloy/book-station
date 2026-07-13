const Router = require('koa-router');
const {
  applyAuthor,
  getAuthorProfile,
  updateAuthorProfile,
  createNovel,
  getAuthorNovels,
  updateNovel,
  addChapter,
  updateChapter,
  getNovelChapters,
} = require('../controllers/authorController');
const { requireAuthor, requireLogin } = require('../middleware/permission');

const router = new Router({ prefix: '/author' });

// 申请成为作者（需要登录）
router.post('/apply', requireLogin, applyAuthor);

// 获取作者资料
router.get('/profile', requireAuthor, getAuthorProfile);
router.put('/profile', requireAuthor, updateAuthorProfile);

// 作者小说管理
router.post('/novels', requireAuthor, createNovel);
router.get('/novels', requireAuthor, getAuthorNovels);
router.put('/novels/:id', requireAuthor, updateNovel);

// 作者章节管理
router.get('/novels/:novelId/chapters', requireAuthor, getNovelChapters);
router.post('/novels/:novelId/chapters', requireAuthor, addChapter);
router.put('/chapters/:id', requireAuthor, updateChapter);

module.exports = router;
