const Router = require('koa-router');
const config = require('../config');

const novelsRouter = require('./novels');
const chaptersRouter = require('./chapters');
const categoriesRouter = require('./categories');
const rankRouter = require('./rank');
const authRouter = require('./auth');
const userRouter = require('./user');
const bookshelfRouter = require('./bookshelf');
const historyRouter = require('./history');
const adminRouter = require('./admin');
const authorRouter = require('./author');

const router = new Router({ prefix: config.apiPrefix });

// 健康检查
router.get('/health', async (ctx) => {
  ctx.body = {
    code: 0,
    message: 'success',
    data: {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
    },
  };
});

// 公开路由
router.use(novelsRouter.routes(), novelsRouter.allowedMethods());
router.use(chaptersRouter.routes(), chaptersRouter.allowedMethods());
router.use(categoriesRouter.routes(), categoriesRouter.allowedMethods());
router.use(rankRouter.routes(), rankRouter.allowedMethods());
router.use(authRouter.routes(), authRouter.allowedMethods());

// 用户相关路由（需要登录）
router.use(userRouter.routes(), userRouter.allowedMethods());
router.use(bookshelfRouter.routes(), bookshelfRouter.allowedMethods());
router.use(historyRouter.routes(), historyRouter.allowedMethods());

// 作者专属路由
router.use(authorRouter.routes(), authorRouter.allowedMethods());

// 管理员专属路由
router.use(adminRouter.routes(), adminRouter.allowedMethods());

module.exports = router;
