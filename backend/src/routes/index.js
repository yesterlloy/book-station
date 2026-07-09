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

// 挂载子路由
router.use(novelsRouter.routes(), novelsRouter.allowedMethods());
router.use(chaptersRouter.routes(), chaptersRouter.allowedMethods());
router.use(categoriesRouter.routes(), categoriesRouter.allowedMethods());
router.use(rankRouter.routes(), rankRouter.allowedMethods());
router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(userRouter.routes(), userRouter.allowedMethods());
router.use(bookshelfRouter.routes(), bookshelfRouter.allowedMethods());
router.use(historyRouter.routes(), historyRouter.allowedMethods());

module.exports = router;
