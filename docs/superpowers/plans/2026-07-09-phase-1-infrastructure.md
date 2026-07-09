# 阶段一：基础设施搭建 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建项目基础环境，包括 Docker 配置、数据库部署、Koa 服务初始化和数据模型定义。

**Architecture:** 使用 Docker Compose 编排 MongoDB、Redis 和 Node.js 服务，Koa 作为 API 框架，采用 MVC 架构。

**Tech Stack:** Docker, Docker Compose, MongoDB, Redis, Node.js, Koa2, Mongoose, ioredis

## Global Constraints

- Node.js 版本: >= 18.x
- MongoDB 版本: 6.x
- Redis 版本: 7.x
- 代码风格: ESLint + Prettier
- 所有代码必须包含详细注释
- 提交信息遵循 Conventional Commits 规范

---

## 项目结构总览

```
book-station/
├── docker-compose.yml          # Docker Compose 配置
├── .env.example                # 环境变量示例
├── backend/                    # Node.js Koa 后端
│   ├── package.json
│   ├── src/
│   │   ├── app.js              # Koa 应用入口
│   │   ├── config/             # 配置文件
│   │   │   ├── database.js     # MongoDB 配置
│   │   │   └── redis.js        # Redis 配置
│   │   ├── models/             # Mongoose 数据模型
│   │   │   ├── Novel.js
│   │   │   ├── Chapter.js
│   │   │   ├── User.js
│   │   │   ├── Bookshelf.js
│   │   │   ├── ReadHistory.js
│   │   │   └── CrawlSource.js
│   │   ├── middleware/         # 中间件
│   │   ├── routes/             # 路由
│   │   ├── controllers/        # 控制器
│   │   └── utils/              # 工具函数
│   └── tests/
├── crawler/                    # Python 爬虫
│   ├── requirements.txt
│   └── src/
└── frontend/                   # React 前端
    ├── package.json
    └── src/
```

---

### Task 1: Docker Compose 基础配置

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`

**Interfaces:**
- Produces: Docker Compose 编排配置，包含 mongodb、redis 服务

**Steps:**

- [ ] **Step 1: 创建 docker-compose.yml**

```yaml
version: '3.8'

services:
  # MongoDB 主数据库
  mongodb:
    image: mongo:6-jammy
    container_name: bookstation-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-password}
      MONGO_INITDB_DATABASE: ${MONGO_DATABASE:-bookstation}
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: bookstation-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD:-redis_password} --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local
```

- [ ] **Step 2: 创建 .env.example**

```env
# MongoDB Configuration
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USERNAME=admin
MONGO_PASSWORD=password
MONGO_DATABASE=bookstation

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Server Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Crawler Configuration
CRAWLER_CONCURRENCY=10
CRAWLER_DELAY_MIN=1000
CRAWLER_DELAY_MAX=3000
```

- [ ] **Step 3: 验证配置文件语法**

```bash
docker-compose config
```

Expected: No errors, displays parsed config

---

### Task 2: 启动数据库服务并验证连接

**Files:**
- Uses: `docker-compose.yml`

**Interfaces:**
- Consumes: Docker Compose 配置
- Produces: 运行中的 MongoDB 和 Redis 服务

**Steps:**

- [ ] **Step 1: 启动数据库服务**

```bash
docker-compose up -d mongodb redis
```

Expected: Services start successfully

- [ ] **Step 2: 等待服务健康检查通过**

```bash
docker-compose ps
```

Expected: Both services show "healthy" status

- [ ] **Step 3: 测试 MongoDB 连接**

```bash
docker exec -it bookstation-mongodb mongosh -u admin -p password --eval "db.adminCommand('ping')"
```

Expected: `{ ok: 1 }`

- [ ] **Step 4: 测试 Redis 连接**

```bash
docker exec -it bookstation-redis redis-cli -a redis_password ping
```

Expected: `PONG`

---

### Task 3: Koa 后端项目初始化

**Files:**
- Create: `backend/package.json`
- Create: `backend/.eslintrc.js`
- Create: `backend/.prettierrc`
- Create: `backend/src/app.js`
- Create: `backend/src/config/database.js`
- Create: `backend/src/config/redis.js`
- Create: `backend/src/config/index.js`

**Interfaces:**
- Produces: 可运行的 Koa 基础服务，连接 MongoDB 和 Redis

**Steps:**

- [ ] **Step 1: 创建 backend/package.json**

```json
{
  "name": "bookstation-backend",
  "version": "1.0.0",
  "description": "Novel reading website backend API",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "test": "jest"
  },
  "dependencies": {
    "koa": "^2.15.0",
    "koa-router": "^12.0.1",
    "koa-bodyparser": "^4.4.1",
    "koa-cors": "^0.0.16",
    "koa-logger": "^3.2.1",
    "mongoose": "^8.1.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.1",
    "joi": "^17.12.0",
    "dayjs": "^1.11.10"
  },
  "devDependencies": {
    "nodemon": "^3.0.3",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.2.4",
    "jest": "^29.7.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

- [ ] **Step 2: 创建 ESLint 和 Prettier 配置**

```javascript
// backend/.eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

```json
// backend/.prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 3: 创建配置文件**

```javascript
// backend/src/config/index.js
require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  apiPrefix: process.env.API_PREFIX || '/api',
  
  mongo: {
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || 27017,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    database: process.env.MONGO_DATABASE || 'bookstation',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret',
    expiresIn: '7d',
  },
};
```

```javascript
// backend/src/config/database.js
const mongoose = require('mongoose');
const config = require('./index');

const buildMongoUri = () => {
  const { host, port, username, password, database } = config.mongo;
  if (username && password) {
    return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;
  }
  return `mongodb://${host}:${port}/${database}`;
};

const connectDatabase = async () => {
  try {
    const uri = buildMongoUri();
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${config.mongo.database}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// 连接错误处理
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📤 MongoDB connection closed');
  process.exit(0);
});

module.exports = connectDatabase;
```

```javascript
// backend/src/config/redis.js
const Redis = require('ioredis');
const config = require('./index');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error.message);
    process.exit(1);
  }
};

// 获取 Redis 客户端
const getRedis = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis first.');
  }
  return redisClient;
};

// 缓存辅助函数
const cache = {
  async get(key) {
    const value = await getRedis().get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key, value, ttl = 3600) {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttl);
  },

  async del(key) {
    await getRedis().del(key);
  },

  async exists(key) {
    return (await getRedis().exists(key)) === 1;
  },
};

module.exports = { connectRedis, getRedis, cache };
```

- [ ] **Step 4: 创建 Koa 应用入口**

```javascript
// backend/src/app.js
const Koa = require('koa');
const cors = require('koa-cors');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const config = require('./config');
const connectDatabase = require('./config/database');
const { connectRedis } = require('./config/redis');

const app = new Koa();
const router = new Router({ prefix: config.apiPrefix });

// 中间件
app.use(cors());
app.use(logger());
app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb',
}));

// 健康检查路由
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

// 404 处理
app.use(async (ctx, next) => {
  await next();
  if (ctx.status === 404) {
    ctx.body = {
      code: 404,
      message: 'Not Found',
      data: null,
    };
  }
});

// 统一响应格式化
app.use(async (ctx, next) => {
  try {
    await next();
    // 如果响应已经设置，不做处理
    if (ctx.body && !ctx.body.code) {
      ctx.body = {
        code: 0,
        message: 'success',
        data: ctx.body,
        timestamp: Date.now(),
      };
    }
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      code: err.code || ctx.status,
      message: err.message || 'Internal Server Error',
      data: null,
      timestamp: Date.now(),
    };
    // 仅在开发环境打印错误堆栈
    if (config.env === 'development') {
      console.error(err);
    }
  }
});

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
```

- [ ] **Step 5: 安装依赖并测试启动**

```bash
cd backend && npm install
```

- [ ] **Step 6: 启动开发服务器**

```bash
npm run dev
```

Expected: Server starts, shows "MongoDB connected", "Redis connected", "Server running on http://localhost:3000"

- [ ] **Step 7: 测试健康检查接口**

```bash
curl http://localhost:3000/api/health
```

Expected: `{"code":0,"message":"success","data":{"status":"ok",...}}`

---

### Task 4: MongoDB 数据模型定义

**Files:**
- Create: `backend/src/models/Novel.js`
- Create: `backend/src/models/Chapter.js`
- Create: `backend/src/models/User.js`
- Create: `backend/src/models/Bookshelf.js`
- Create: `backend/src/models/ReadHistory.js`
- Create: `backend/src/models/CrawlSource.js`
- Create: `backend/src/models/index.js`

**Interfaces:**
- Consumes: Mongoose 连接
- Produces: 完整的数据模型定义和索引

**Steps:**

- [ ] **Step 1: 创建 Novel 模型**

```javascript
// backend/src/models/Novel.js
const mongoose = require('mongoose');

const novelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  cover: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['玄幻', '都市', '言情', '科幻', '历史', '武侠', '仙侠', '游戏', '悬疑', '其他'],
    default: '其他',
    index: true,
  },
  status: {
    type: String,
    enum: ['连载中', '已完结'],
    default: '连载中',
    index: true,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  chapterCount: {
    type: Number,
    default: 0,
  },
  lastChapter: {
    title: String,
    id: mongoose.Schema.Types.ObjectId,
    updateTime: Date,
  },
  source: {
    name: String,
    url: String,
    novelId: String,
  },
  tags: [{
    type: String,
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
    index: true,
  },
  favoriteCount: {
    type: Number,
    default: 0,
  },
  isHot: {
    type: Boolean,
    default: false,
    index: true,
  },
  isRecommend: {
    type: Boolean,
    default: false,
  },
  lastCrawledAt: {
    type: Date,
  },
}, {
  timestamps: true,
  collection: 'novels',
});

// 全文搜索索引
novelSchema.index(
  { title: 'text', author: 'text', description: 'text' },
  { weights: { title: 10, author: 5, description: 1 } }
);

// 唯一索引：同一作者的小说不能重名
novelSchema.index({ title: 1, author: 1 }, { unique: true });

// 静态方法：按分类获取列表
novelSchema.statics.findByCategory = function(category, page = 1, limit = 20) {
  return this.find({ category })
    .sort({ 'lastChapter.updateTime': -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// 静态方法：搜索小说
novelSchema.statics.search = function(keyword, page = 1, limit = 20) {
  return this.find({ $text: { $search: keyword } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(limit);
};

// 增加阅读次数
novelSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('Novel', novelSchema);
```

- [ ] **Step 2: 创建 Chapter 模型**

```javascript
// backend/src/models/Chapter.js
const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  novelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true,
    index: true,
  },
  novelTitle: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  sourceUrl: {
    type: String,
    trim: true,
  },
  isVip: {
    type: Boolean,
    default: false,
  },
  isFree: {
    type: Boolean,
    default: true,
  },
  hash: {
    type: String,
    index: true,
  },
  crawledAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'chapters',
});

// 复合唯一索引：同一小说同一序号只能有一章
chapterSchema.index({ novelId: 1, order: 1 }, { unique: true });

// 查询优化索引
chapterSchema.index({ novelId: 1, _id: 1 });

// 静态方法：获取小说的章节列表
chapterSchema.statics.getNovelChapters = function(novelId, page = 1, limit = 100) {
  return this.find({ novelId })
    .select('title order wordCount createdAt')
    .sort({ order: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// 静态方法：获取相邻章节
chapterSchema.statics.getAdjacentChapters = async function(novelId, order) {
  const [prev, next] = await Promise.all([
    this.findOne({ novelId, order: order - 1 }).select('_id title order'),
    this.findOne({ novelId, order: order + 1 }).select('_id title order'),
  ]);
  return { prev, next };
};

module.exports = mongoose.model('Chapter', chapterSchema);
```

- [ ] **Step 3: 创建 User 模型**

```javascript
// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // 默认不返回密码字段
  },
  avatar: {
    type: String,
    trim: true,
  },
  nickname: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  settings: {
    fontSize: {
      type: Number,
      default: 18,
      min: 12,
      max: 28,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'sepia'],
      default: 'light',
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
    lineHeight: {
      type: Number,
      default: 1.6,
      min: 1.2,
      max: 2.5,
    },
  },
  lastLoginAt: {
    type: Date,
  },
  lastLoginIp: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'users',
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 更新登录时间
userSchema.methods.updateLoginTime = function(ip) {
  this.lastLoginAt = new Date();
  this.lastLoginIp = ip;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
```

- [ ] **Step 4: 创建 Bookshelf 模型**

```javascript
// backend/src/models/Bookshelf.js
const mongoose = require('mongoose');

const bookshelfSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  novelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true,
    index: true,
  },
  novelTitle: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
  },
  lastReadChapter: {
    id: mongoose.Schema.Types.ObjectId,
    title: String,
    order: Number,
  },
  lastReadAt: {
    type: Date,
    default: Date.now,
  },
  readProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  totalChapters: {
    type: Number,
    default: 0,
  },
  isNotify: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'bookshelves',
});

// 复合唯一索引：同一用户不能重复收藏同一小说
bookshelfSchema.index({ userId: 1, novelId: 1 }, { unique: true });

// 查询优化索引
bookshelfSchema.index({ userId: 1, lastReadAt: -1 });
bookshelfSchema.index({ userId: 1, createdAt: -1 });

// 静态方法：获取用户书架
bookshelfSchema.statics.getUserBookshelf = function(userId, page = 1, limit = 20) {
  return this.find({ userId })
    .sort({ lastReadAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

module.exports = mongoose.model('Bookshelf', bookshelfSchema);
```

- [ ] **Step 5: 创建 ReadHistory 模型**

```javascript
// backend/src/models/ReadHistory.js
const mongoose = require('mongoose');

const readHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  deviceId: {
    type: String,
    index: true,
  },
  novelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true,
    index: true,
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  },
  chapterOrder: {
    type: Number,
    required: true,
  },
  scrollPosition: {
    type: Number,
    default: 0,
  },
  readAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'read_history',
});

// 复合唯一索引：登录用户
readHistorySchema.index({ userId: 1, novelId: 1 }, { unique: true, sparse: true });

// 复合唯一索引：未登录用户
readHistorySchema.index({ deviceId: 1, novelId: 1 }, { unique: true, sparse: true });

// 查询优化索引
readHistorySchema.index({ userId: 1, readAt: -1 });

// 静态方法：获取用户阅读历史
readHistorySchema.statics.getUserHistory = function(userId, deviceId, page = 1, limit = 20) {
  const query = userId ? { userId } : { deviceId };
  return this.find(query)
    .sort({ readAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('novelId', 'title author cover status');
};

module.exports = mongoose.model('ReadHistory', readHistorySchema);
```

- [ ] **Step 6: 创建 CrawlSource 模型**

```javascript
// backend/src/models/CrawlSource.js
const mongoose = require('mongoose');

const crawlSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  baseUrl: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  enabled: {
    type: Boolean,
    default: true,
    index: true,
  },
  priority: {
    type: Number,
    default: 10,
    index: true,
  },
  rateLimit: {
    type: Number,
    default: 1000, // ms
  },
  selectors: {
    novelList: String,
    novelTitle: String,
    novelAuthor: String,
    novelCover: String,
    novelDesc: String,
    novelCategory: String,
    novelStatus: String,
    chapterList: String,
    chapterTitle: String,
    chapterContent: String,
  },
  headers: {
    type: Map,
    of: String,
    default: {},
  },
  proxies: [{
    type: String,
  }],
  lastCrawledAt: {
    type: Date,
  },
}, {
  timestamps: true,
  collection: 'crawl_sources',
});

// 查询优化索引
crawlSourceSchema.index({ enabled: 1, priority: 1 });

// 静态方法：获取启用的源列表
crawlSourceSchema.statics.getEnabledSources = function() {
  return this.find({ enabled: true }).sort({ priority: 1 });
};

module.exports = mongoose.model('CrawlSource', crawlSourceSchema);
```

- [ ] **Step 7: 创建模型导出入口**

```javascript
// backend/src/models/index.js
const Novel = require('./Novel');
const Chapter = require('./Chapter');
const User = require('./User');
const Bookshelf = require('./Bookshelf');
const ReadHistory = require('./ReadHistory');
const CrawlSource = require('./CrawlSource');

module.exports = {
  Novel,
  Chapter,
  User,
  Bookshelf,
  ReadHistory,
  CrawlSource,
};
```

- [ ] **Step 8: 验证模型定义**

创建测试脚本 `backend/test-models.js`:

```javascript
require('./src/config/database')();
const { Novel, Chapter, User } = require('./src/models');

setTimeout(async () => {
  console.log('Models loaded:', Object.keys(require('./src/models')));
  console.log('✅ All models defined correctly');
  process.exit(0);
}, 2000);
```

```bash
cd backend && node test-models.js
```

Expected: "✅ All models defined correctly"

---

### Task 5: 创建 .gitignore 和项目基础文档

**Files:**
- Create: `.gitignore`
- Create: `README.md`

**Steps:**

- [ ] **Step 1: 创建 .gitignore**

```
# Dependencies
node_modules/
**/node_modules/

# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.env

# Environment variables
.env
.env.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
.nyc_output/

# Build directories
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Docker volumes
mongodb_data/
redis_data/
```

- [ ] **Step 2: 创建 README.md**

```markdown
# BookStation - 小说阅读网站

一个高并发、快速加载、全自动小说数据抓取的小说阅读网站。

## 技术栈

- **后端**: Node.js + Koa2
- **爬虫**: Python + Aiohttp
- **数据库**: MongoDB + Redis
- **前端**: React + 原生HTML/JS

## 快速开始

### 1. 启动数据库

```bash
docker-compose up -d mongodb redis
```

### 2. 启动后端服务

```bash
cd backend
npm install
npm run dev
```

### 3. 验证服务

```bash
curl http://localhost:3000/api/health
```

## 项目结构

```
book-station/
├── backend/          # Node.js Koa 后端
├── crawler/          # Python 爬虫
├── frontend/         # React 前端
├── docs/             # 文档
└── docker-compose.yml
```

## 开发文档

详细设计文档请查看 [docs/superpowers/specs/2026-07-09-novel-reading-website-design.md](docs/superpowers/specs/2026-07-09-novel-reading-website-design.md)

## License

MIT
```

---

## 阶段一验收标准

- [ ] Docker Compose 配置正确，MongoDB 和 Redis 可正常启动
- [ ] Koa 服务能正常启动，健康检查接口返回成功
- [ ] MongoDB 和 Redis 连接正常
- [ ] 所有数据模型定义正确，包含必要的索引和方法
- [ ] 项目基础文档完整

---

**计划结束**
