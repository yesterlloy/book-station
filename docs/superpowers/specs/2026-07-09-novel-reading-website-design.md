# 小说阅读网站设计文档

**日期：** 2026-07-09
**版本：** v1.0
**作者：** AI Architect

## 1. 项目概述

### 1.1 项目目标
构建一个高并发、快速加载、全自动小说数据抓取、简洁无广告的小说阅读网站。

### 1.2 核心需求
- ✅ 高并发访问支持
- ✅ 页面快速加载
- ✅ 全自动小说数据抓取
- ✅ 简洁无广告的阅读体验
- ✅ 多端适配（PC + H5）

### 1.3 目标规模
- 日访问量：< 1万 PV
- 部署方式：单机部署

---

## 2. 技术选型与架构设计

### 2.1 技术栈选择

| 层级 | 技术选型 | 选型理由 |
|------|---------|---------|
| **爬虫** | Python + Aiohttp + Asyncio | Python爬虫生态最丰富，异步IO适合高并发抓取 |
| **后端API** | Node.js + Koa2 | 高性能异步框架，适合IO密集型API服务 |
| **主数据库** | MongoDB | 文档型数据库，适合存储小说章节大文本，Schema灵活 |
| **缓存** | Redis | 高性能内存数据库，用于章节内容缓存、热点数据 |
| **前端** | React + 原生HTML/JS混合 | React管理复杂页面，阅读页面用原生实现极致性能 |
| **反向代理** | Nginx | 静态资源缓存、API反向代理、Gzip压缩 |
| **部署** | Docker + Docker Compose | 一键部署，环境隔离 |

### 2.2 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                            │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                        Nginx (反向代理)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │   静态资源缓存   │  │   API 反向代理   │  │  Gzip 压缩   │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
└────────────────────┬────────────────────┬───────────────────┘
                     │                    │
        ┌────────────▼───────────┐        │       ┌──────────────────┐
        │   React 前端应用        │        │       │  原生阅读页面     │
        │   (主页/搜索/书架)      │        │       │  (纯HTML/JS)      │
        └─────────────────────────┘        │       └──────────────────┘
                                          │
                              ┌───────────▼───────────┐
                              │   Koa API 服务        │
                              │   (Node.js)           │
                              └───────────┬───────────┘
                                          │
                        ┌─────────────────┼─────────────────┐
                        │                 │                 │
              ┌─────────▼────────┐  ┌────▼─────┐  ┌────────▼────────┐
              │   MongoDB        │  │  Redis   │  │  爬虫调度器      │
              │   (主存储)       │  │  (缓存)   │  │  (Python)        │
              └──────────────────┘  └───────────┘  └─────────────────┘
```

### 2.3 模块划分

1. **爬虫模块** - 负责小说数据抓取、清洗、去重、入库
2. **API服务模块** - 提供RESTful接口，处理业务逻辑
3. **缓存模块** - Redis缓存热点章节内容，加速响应
4. **前端模块** - React管理页 + 原生阅读器
5. **Nginx模块** - 反向代理、静态缓存、负载均衡

---

## 3. 数据库设计

### 3.1 MongoDB 集合设计

#### 3.1.1 novels 集合（小说主表）

```javascript
{
  _id: ObjectId,
  title: String,        // 小说标题
  author: String,       // 作者名
  cover: String,        // 封面图片URL
  description: String,  // 小说简介
  category: String,     // 分类：玄幻、都市、言情、科幻、历史等
  status: String,       // 状态：连载中、已完结
  wordCount: Number,    // 总字数
  chapterCount: Number, // 章节总数
  lastChapter: {        // 最新章节
    title: String,
    id: ObjectId,
    updateTime: Date
  },
  source: {             // 来源网站信息
    name: String,
    url: String,
    novelId: String     // 源网站小说ID
  },
  tags: [String],       // 标签
  rating: Number,       // 评分 0-5
  viewCount: Number,    // 阅读次数
  favoriteCount: Number,// 收藏次数
  isHot: Boolean,       // 是否热门
  isRecommend: Boolean, // 是否推荐
  createdAt: Date,
  updatedAt: Date,
  lastCrawledAt: Date   // 最后爬取时间
}

// 索引
db.novels.createIndex({ title: 1, author: 1 }, { unique: true })
db.novels.createIndex({ category: 1 })
db.novels.createIndex({ status: 1 })
db.novels.createIndex({ viewCount: -1 })
db.novels.createIndex({ isHot: 1 })
db.novels.createIndex({ 'lastChapter.updateTime': -1 })
db.novels.createIndex({ title: 'text', author: 'text', description: 'text' })
```

#### 3.1.2 chapters 集合（章节表）

```javascript
{
  _id: ObjectId,
  novelId: ObjectId,    // 所属小说ID
  novelTitle: String,   // 小说标题（冗余，方便查询）
  order: Number,        // 章节序号（从1开始）
  title: String,        // 章节标题
  content: String,      // 章节内容（大文本）
  wordCount: Number,    // 本章字数
  sourceUrl: String,    // 源URL
  isVip: Boolean,       // 是否VIP章节
  isFree: Boolean,      // 是否免费
  crawledAt: Date,      // 爬取时间
  createdAt: Date,
  updatedAt: Date,
  hash: String          // 内容哈希（用于去重）
}

// 索引
db.chapters.createIndex({ novelId: 1, order: 1 }, { unique: true })
db.chapters.createIndex({ novelId: 1, _id: 1 })
db.chapters.createIndex({ hash: 1 })
db.chapters.createIndex({ createdAt: -1 })
```

#### 3.1.3 users 集合（用户表）

```javascript
{
  _id: ObjectId,
  username: String,     // 用户名
  email: String,        // 邮箱
  password: String,     // 密码哈希
  avatar: String,       // 头像
  nickname: String,     // 昵称
  role: {               // 角色
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  settings: {           // 用户设置
    fontSize: Number,   // 字体大小
    theme: String,      // 主题：light/dark/sepia
    bgColor: String,    // 背景色
    lineHeight: Number  // 行高
  },
  lastLoginAt: Date,
  lastLoginIp: String,
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
```

#### 3.1.4 bookshelves 集合（书架/收藏表）

```javascript
{
  _id: ObjectId,
  userId: ObjectId,     // 用户ID
  novelId: ObjectId,    // 小说ID
  novelTitle: String,   // 小说标题（冗余）
  author: String,       // 作者（冗余）
  cover: String,        // 封面（冗余）
  lastReadChapter: {    // 最后阅读章节
    id: ObjectId,
    title: String,
    order: Number
  },
  lastReadAt: Date,     // 最后阅读时间
  readProgress: Number, // 阅读进度（百分比）
  totalChapters: Number,// 总章节数
  isNotify: Boolean,    // 更新是否通知
  addedAt: Date,        // 加入书架时间
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.bookshelves.createIndex({ userId: 1, novelId: 1 }, { unique: true })
db.bookshelves.createIndex({ userId: 1, lastReadAt: -1 })
db.bookshelves.createIndex({ userId: 1, addedAt: -1 })
```

#### 3.1.5 read_history 集合（阅读历史表）

```javascript
{
  _id: ObjectId,
  userId: ObjectId,     // 用户ID（未登录可为null）
  deviceId: String,     // 设备ID（用于未登录用户）
  novelId: ObjectId,    // 小说ID
  chapterId: ObjectId,  // 章节ID
  chapterOrder: Number, // 章节序号
  scrollPosition: Number, // 滚动位置（像素或百分比）
  readAt: Date,         // 阅读时间
  createdAt: Date
}

// 索引
db.read_history.createIndex({ userId: 1, novelId: 1 }, { unique: true })
db.read_history.createIndex({ deviceId: 1, novelId: 1 }, { unique: true })
db.read_history.createIndex({ userId: 1, readAt: -1 })
```

#### 3.1.6 crawl_sources 集合（爬虫源配置表）

```javascript
{
  _id: ObjectId,
  name: String,         // 源名称
  baseUrl: String,      // 基础URL
  enabled: Boolean,     // 是否启用
  priority: Number,     // 优先级（越小越高）
  rateLimit: Number,    // 请求间隔（ms）
  selectors: {          // CSS选择器配置
    novelList: String,
    novelTitle: String,
    novelAuthor: String,
    novelCover: String,
    novelDesc: String,
    chapterList: String,
    chapterTitle: String,
    chapterContent: String
  },
  headers: Object,      // 默认请求头
  proxies: [String],    // 代理IP池
  lastCrawledAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.crawl_sources.createIndex({ baseUrl: 1 }, { unique: true })
db.crawl_sources.createIndex({ enabled: 1, priority: 1 })
```

### 3.2 Redis 缓存设计

#### 3.2.1 缓存键设计

| 键模式 | 类型 | 过期时间 | 说明 |
|--------|------|---------|------|
| `chapter:{chapterId}` | string | 24h | 章节内容缓存 |
| `novel:{novelId}:chapters` | hash | 1h | 小说目录列表 |
| `novel:{novelId}:detail` | string | 1h | 小说详情 |
| `category:{category}:list` | list | 30m | 分类小说列表 |
| `rank:{type}:list` | list | 1h | 排行榜列表 |
| `hot:novels` | list | 30m | 热门小说 |
| `new:novels` | list | 15m | 最新更新 |
| `user:{userId}:bookshelf` | set | 10m | 用户书架 |
| `rate_limit:{ip}` | string | 1m | API限流 |

#### 3.2.2 缓存策略
- **读写穿透**：先读缓存，未命中读DB，然后写缓存
- **缓存预热**：热门小说、最新章节主动预热
- **缓存淘汰**：LRU策略，优先保留热点数据
- **缓存更新**：章节内容更新时主动删除旧缓存

---

## 4. 爬虫模块设计

### 4.1 爬虫架构

```
┌─────────────────────────────────────────────────────────────┐
│                        爬虫调度器                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 任务队列    │  │ 并发控制    │  │  失败重试机制       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ 目录抓取器    │  │  章节抓取器      │  │  内容清洗器      │
│ (小说列表)    │  │  (并发下载)      │  │  (去广告/去重)   │
└───────┬───────┘  └────────┬────────┘  └────────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   数据入库      │
                    │  (MongoDB)      │
                    └─────────────────┘
```

### 4.2 核心功能

1. **异步并发抓取** - Aiohttp + Asyncio，支持100+并发
2. **代理IP池** - 自动切换代理，应对反爬
3. **随机User-Agent** - 每次请求随机UA
4. **请求延迟抖动** - 固定间隔 + 随机抖动
5. **失败重试** - 指数退避重试机制
6. **内容清洗** - 正则过滤广告、垃圾文本
7. **内容去重** - MD5哈希比对，避免重复章节
8. **增量更新** - 只抓取更新的章节
9. **断点续爬** - 爬虫中断后可从断点继续

### 4.3 防爬虫策略

| 策略 | 实现方式 | 效果 |
|------|---------|------|
| **代理IP池** | 维护可用代理列表，自动检测可用性 | 避免IP被封 |
| **随机User-Agent** | 从数百个UA中随机选择 | 隐藏爬虫特征 |
| **请求延迟** | 随机延迟 1-3 秒 | 避免请求过于频繁 |
| **请求头伪装** | 完整的浏览器Headers，包含Referer、Cookie等 | 模拟真实浏览器 |
| **Cookie池** | 维护多个会话Cookie | 避免单一Cookie被识别 |
| **分布式抓取** | 多机器/多进程分布式 | 分散请求来源 |

---

## 5. 后端 API 设计

### 5.1 RESTful API 接口

#### 5.1.1 小说相关接口

| 方法 | 路径 | 说明 | 缓存 |
|------|------|------|------|
| GET | `/api/novels` | 获取小说列表（支持分类、搜索、分页） | 30m |
| GET | `/api/novels/:id` | 获取小说详情 | 1h |
| GET | `/api/novels/:id/chapters` | 获取小说目录列表 | 1h |
| GET | `/api/chapters/:id` | 获取章节内容 | 24h |
| GET | `/api/categories` | 获取分类列表 | 24h |
| GET | `/api/rank/:type` | 获取排行榜 | 1h |

#### 5.1.2 用户相关接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | - |
| POST | `/api/auth/login` | 用户登录 | - |
| GET | `/api/user/profile` | 获取用户信息 | 是 |
| PUT | `/api/user/profile` | 更新用户信息 | 是 |
| PUT | `/api/user/settings` | 更新阅读设置 | 是 |

#### 5.1.3 书架/阅读历史接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/bookshelf` | 获取用户书架 | 是 |
| POST | `/api/bookshelf` | 加入书架 | 是 |
| DELETE | `/api/bookshelf/:novelId` | 移出书架 | 是 |
| GET | `/api/history` | 获取阅读历史 | 可选 |
| POST | `/api/history/progress` | 同步阅读进度 | 可选 |

### 5.2 API 响应格式

```javascript
// 成功响应
{
  code: 0,
  message: 'success',
  data: { ... },
  timestamp: 1234567890
}

// 错误响应
{
  code: 40001,
  message: '参数错误',
  errors: [ ... ],
  timestamp: 1234567890
}
```

---

## 6. 前端设计

### 6.1 技术栈

- **复杂页面**（首页、搜索、书架）：React 18 + Vite
- **阅读页面**：原生 HTML + CSS + JS（零依赖，极致性能）

### 6.2 阅读页面核心功能

1. **夜间模式** - 一键切换日/夜/护眼模式
2. **字体调节** - 12px-24px 无级调节
3. **背景切换** - 纯白、护眼绿、羊皮纸、夜间黑
4. **阅读进度** - 自动记录到 LocalStorage，登录后同步到云端
5. **预加载下一章** - 阅读到 80% 时自动预加载下一章
6. **目录侧边栏** - 点击唤出章节列表
7. **上下翻页** - 支持键盘 ← → 翻页
8. **字号记忆** - 保存用户偏好设置

### 6.3 响应式设计

- **PC端**：宽屏布局，左右留白，内容居中
- **平板端**：自适应宽度，适当调整字体
- **手机端**：全屏内容，触摸友好的按钮

---

## 7. 部署方案

### 7.1 Docker 部署架构

```
┌─────────────────────────────────────────────────┐
│                  Docker Host                    │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Nginx   │──│  Koa API │──│   MongoDB    │  │
│  │  (80/443)│  │  (3000)  │  │  (27017)    │  │
│  └──────────┘  └──────────┘  └──────┬───────┘  │
│        │             │               │          │
│        │             │          ┌────▼───────┐  │
│        │             └──────────│   Redis    │  │
│        │                        │  (6379)    │  │
│  ┌─────▼──────┐                 └────────────┘  │
│  │  React 前端│                                 │
│  │  (静态)    │                                 │
│  └────────────┘                                 │
└─────────────────────────────────────────────────┘
```

### 7.2 Nginx 缓存配置

```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# 阅读页面缓存
location ~* ^/read/ {
    expires 1h;
    add_header Cache-Control "public";
}

# API 响应缓存
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_valid 404 1m;
    proxy_pass http://koa_api:3000;
}
```

### 7.3 服务器配置要求

| 资源 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2核 | 4核 |
| 内存 | 4GB | 8GB |
| 硬盘 | 50GB SSD | 200GB SSD |
| 带宽 | 5Mbps | 20Mbps |

---

## 8. 分阶段实施计划

### 阶段一：基础设施搭建（1-2天）
- [ ] Docker 环境配置
- [ ] MongoDB + Redis 部署
- [ ] Koa 项目初始化
- [ ] 数据库连接、模型定义

### 阶段二：爬虫模块开发（3-4天）
- [ ] 通用爬虫框架编写
- [ ] 代理IP池集成
- [ ] 内容清洗、去重逻辑
- [ ] 增量更新机制
- [ ] 爬虫测试与调优

### 阶段三：API 接口开发（2-3天）
- [ ] 小说列表/详情/目录接口
- [ ] 章节内容接口（Redis缓存）
- [ ] 用户认证接口
- [ ] 书架/阅读历史接口
- [ ] 搜索/排行榜接口

### 阶段四：前端开发（3-4天）
- [ ] React 项目初始化
- [ ] 首页/分类/搜索页面
- [ ] 小说详情页
- [ ] 原生阅读器页面（核心）
- [ ] 书架/个人中心

### 阶段五：部署与优化（1-2天）
- [ ] Docker Compose 编排
- [ ] Nginx 配置优化
- [ ] 性能压测与优化
- [ ] 日志监控配置

**预计总工期：10-15天**

---

## 9. 风险与应对

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|---------|
| 目标网站反爬虫加强 | 高 | 中 | 代理池、UA池、分布式抓取 |
| 数据库性能瓶颈 | 中 | 低 | 索引优化、读写分离、Redis缓存 |
| 内容版权问题 | 高 | 中 | 仅做技术演示，添加免责声明 |
| 服务器被封 | 中 | 低 | CDN加速、多域名备份 |

---

**文档结束**
