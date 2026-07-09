const Koa = require('koa');
const cors = require('koa-cors');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const config = require('./config');
const connectDatabase = require('./config/database');
const { connectRedis } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('./middleware/rateLimit');
const router = require('./routes');

const app = new Koa();

// 信任代理
app.proxy = true;

// 中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
}));

// 请求日志（仅开发环境）
if (config.env === 'development') {
  app.use(logger());
}

// 限流中间件
app.use(rateLimit(100, 60)); // 每分钟 100 次

// 解析请求体
app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb',
}));

// 错误处理
app.use(errorHandler);

// 挂载路由
app.use(router.routes()).use(router.allowedMethods());

// 启动服务
const startServer = async () => {
  console.log('🚀 Starting BookStation Server...');
  console.log(`📦 Environment: ${config.env}`);

  // 连接数据库
  await connectDatabase();
  await connectRedis();

  // 启动 HTTP 服务
  app.listen(config.port, () => {
    console.log(`🌐 Server running on http://localhost:${config.port}`);
    console.log(`📡 Health check: http://localhost:${config.port}${config.apiPrefix}/health`);
  });
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
