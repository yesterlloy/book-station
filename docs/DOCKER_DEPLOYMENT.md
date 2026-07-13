# 🐳 BookStation Docker 部署指南

## 📋 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [服务架构](#服务架构)
- [管理后台说明](#管理后台说明)
- [常用命令](#常用命令)
- [数据备份与恢复](#数据备份与恢复)
- [生产环境部署](#生产环境部署)
- [故障排查](#故障排查)

---

## 🖥️ 环境要求

- Docker >= 20.10.0
- Docker Compose >= 2.0.0
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

### 检查 Docker 环境

```bash
docker --version
docker compose version
```

---

## 🚀 快速开始

### 方式一：一键部署（推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd book-station

# 2. 构建镜像
chmod +x scripts/*.sh
./scripts/docker-build.sh

# 3. 启动服务
./scripts/docker-up.sh

# 4. 初始化测试数据（可选）
./scripts/docker-seed.sh
```

### 方式二：手动部署

```bash
# 1. 复制环境变量
cp .env.production .env

# 2. 构建并启动
docker compose up -d

# 3. 等待服务启动
docker compose ps

# 4. 初始化数据
docker compose exec backend node seed-data.js
```

部署完成后访问：
- 前端首页: http://localhost:6002
- 阅读器: http://localhost:6002/reader/
- 管理后台: http://localhost:6003
- 后端 API: http://localhost:6001

---

## ⚙️ 配置说明

### 环境变量配置

项目提供三种环境配置文件：

| 文件 | 用途 |
|------|------|
| `.env.development` | 开发环境配置 |
| `.env.production` | 生产环境配置 |
| `.env.example` | 配置模板 |

#### 主要配置项

```env
# 服务端口
HTTP_PORT=6002          # Nginx HTTP 端口（前端首页）
HTTPS_PORT=443          # Nginx HTTPS 端口
BACKEND_PORT=6001       # 后端 API 端口
ADMIN_PORT=6003         # 管理后台端口

# MongoDB 配置
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password
MONGO_DATABASE=bookstation

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password

# JWT 配置（生产环境必须修改）
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 日志级别
LOG_LEVEL=info

# Docker 构建目标
NODE_ENV=production
```

### 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|---------|---------|------|
| Nginx | 80 | 6002 | 前端静态服务 + API 代理 |
| Backend | 6001 | 6001 | 后端 API 服务 |
| Admin | 80 | 6003 | 管理后台（React + Nginx） |
| MongoDB | 27017 | 27017 | 数据库 |
| Redis | 6379 | 6380 | 缓存 |

---

## 🏗️ 服务架构

```
                        ┌─────────────────┐
                        │     用户        │
                        └────────┬────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
  │   Nginx 主站    │   │  Admin 管理后台 │   │  后端 API 服务   │
  │  (端口 6002)    │   │  (端口 6003)    │   │  (端口 6001)    │
  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
           │                     │                     │
           ▼                     ▼                     ▼
  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
  │ 前端首页静态   │    │ React 管理后台  │    │  Node.js API    │
  │  阅读器静态    │    │  (独立 Nginx)   │    │  (业务逻辑)     │
  └────────────────┘    └────────────────┘    └────────┬────────┘
                                                         │
                                              ┌──────────┴──────────┐
                                              │                     │
                                              ▼                     ▼
                                     ┌──────────────┐      ┌──────────────┐
                                     │   MongoDB    │      │    Redis     │
                                     │   (数据库)   │      │    (缓存)    │
                                     └──────────────┘      └──────────────┘
```

### 服务说明

1. **Nginx 主站** - 反向代理服务器（端口 6002）
   - 提供前端静态文件服务
   - 阅读器静态文件服务
   - API 请求代理到后端服务
   - Gzip 压缩、浏览器缓存
   - 安全头配置

2. **Admin 管理后台** - 独立容器（端口 6003）
   - React 应用 + Nginx 静态服务
   - 独立 API 代理到后端服务
   - 用户管理、书籍管理、爬虫管理等功能
   - 健康检查端点

3. **Backend** - Node.js API 服务（端口 6001）
   - RESTful API 接口
   - 用户认证与授权
   - 小说/章节数据服务
   - 书架、阅读历史功能
   - 爬虫任务管理

4. **MongoDB** - 主数据库
   - 存储用户、小说、章节、书架等数据
   - 持久化存储，数据卷挂载

5. **Redis** - 缓存服务
   - 热点数据缓存
   - 会话存储
   - API 响应缓存

---

## 🔧 管理后台说明

### 功能模块

| 模块 | 说明 |
|------|------|
| **仪表盘** | 数据统计概览、用户增长、热门小说 |
| **用户管理** | 用户列表、角色管理、状态管理、密码重置 |
| **书籍管理** | 小说列表、分类管理、章节管理、封面上传 |
| **爬虫管理** | 爬虫状态监控、任务管理、日志查看、数据源配置 |
| **系统设置** | 网站配置、安全设置、爬虫参数调整 |

### 默认账号

- **用户名**: `admin`
- **密码**: `admin123`

### 技术栈

- **框架**: React 18
- **构建工具**: Vite 5
- **UI 组件**: Ant Design 6.x
- **路由**: React Router 6
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **日期处理**: Day.js

### 独立部署特性

管理后台使用独立容器部署，具有以下特点：

1. **独立 Nginx 服务** - 不依赖主站 Nginx，可单独访问
2. **内置 API 代理** - 容器内 Nginx 自动代理 `/api/` 请求到后端服务
3. **Docker DNS 解析** - 使用 Docker 内置 DNS 解析 backend 服务名
4. **健康检查** - 内置 `/health` 端点用于容器健康检查
5. **资源限制** - CPU/内存限制，避免资源过度占用

### 访问地址

- **Docker 部署**: http://localhost:6003
- **开发环境**: http://localhost:6003 (npm run dev)
- **Nginx 代理**: http://localhost:6002/admin/ (可选)

---

## 📝 常用命令

### 服务管理

| 命令 | 说明 |
|------|------|
| `./scripts/docker-build.sh` | 构建所有 Docker 镜像 |
| `./scripts/docker-up.sh` | 启动所有服务 |
| `./scripts/docker-down.sh` | 停止服务 |
| `./scripts/docker-restart.sh` | 重启服务 |
| `./scripts/docker-logs.sh` | 查看日志 |
| `./scripts/status.sh` | 查看服务状态 |
| `./scripts/build-admin.sh` | 单独构建管理后台 |

### 管理后台相关

```bash
# 仅构建管理后台镜像
docker compose build admin

# 仅启动管理后台
docker compose up -d admin

# 重启管理后台
docker compose restart admin

# 查看管理后台日志
docker compose logs -f admin

# 进入管理后台容器
docker compose exec admin sh
```

### 数据管理

| 命令 | 说明 |
|------|------|
| `./scripts/docker-seed.sh` | 初始化测试数据 |
| `./scripts/docker-backup.sh` | 备份数据库 |
| `./scripts/docker-prune.sh` | 清理 Docker 空间 |

### Docker Compose 原生命令

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
docker compose logs -f backend
docker compose logs -f mongodb

# 进入容器
docker compose exec backend sh
docker compose exec mongodb mongosh
docker compose exec redis redis-cli

# 重启单个服务
docker compose restart backend

# 重新构建并启动
docker compose up -d --build backend

# 查看资源使用
docker compose stats
```

---

## 💾 数据备份与恢复

### 备份数据

```bash
# 使用备份脚本（推荐）
./scripts/docker-backup.sh

# 手动备份 MongoDB
docker compose exec mongodb mongodump --username admin --password <password> --db bookstation --gzip --archive > backup/mongodb_$(date +%Y%m%d).archive.gz

# 手动备份 Redis
docker compose exec redis redis-cli -a <password> BGSAVE
docker compose cp redis:/data/dump.rdb backup/redis_$(date +%Y%m%d).rdb
```

### 恢复数据

```bash
# 恢复 MongoDB
docker compose exec -T mongodb mongorestore --username admin --password <password> --db bookstation --gzip --archive < backup/mongodb_20240101.archive.gz

# 恢复 Redis
docker compose stop redis
docker compose cp backup/redis_20240101.rdb redis:/data/dump.rdb
docker compose start redis
```

---

## 🔒 生产环境部署

### 1. 安全配置

```bash
# 1. 使用强密码
# 修改 .env 文件中的密码配置
MONGO_PASSWORD=your_very_strong_mongo_password
REDIS_PASSWORD=your_very_strong_redis_password
JWT_SECRET=your_super_secure_jwt_secret_at_least_64_chars

# 2. 关闭不必要的端口映射
# 在 docker-compose.yml 中注释掉：
# - MongoDB 端口 (27017)
# - Redis 端口 (6380)
# - 后端端口 (6001)  # 所有请求通过 Nginx 代理
```

### 2. 配置 HTTPS

```bash
# 1. 准备 SSL 证书
mkdir -p docker/nginx/ssl
cp your_cert.pem docker/nginx/ssl/cert.pem
cp your_key.pem docker/nginx/ssl/key.pem

# 2. 修改 nginx 配置文件启用 HTTPS
# 参考 docker/nginx/conf.d/default-ssl.conf.example
```

### 3. 配置日志轮转

```bash
# 配置日志轮转
cat > /etc/logrotate.d/bookstation << EOF
/var/lib/docker/volumes/bookstation-*/_data/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}
EOF
```

### 4. 资源限制

docker-compose.yml 已配置默认资源限制，可根据服务器配置调整：

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### 5. 健康检查与自动恢复

Docker Compose 已配置健康检查，服务异常时自动重启：

```yaml
restart: unless-stopped
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:6001/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🔍 故障排查

### 服务无法启动

```bash
# 1. 查看服务状态
docker compose ps

# 2. 查看具体服务日志
docker compose logs backend
docker compose logs mongodb

# 3. 检查端口占用
netstat -tlnp | grep -E "6001|6002|27017|6380"

# 4. 检查磁盘空间
df -h
docker system df
```

### MongoDB 连接失败

```bash
# 1. 检查 MongoDB 容器状态
docker compose ps mongodb

# 2. 查看 MongoDB 日志
docker compose logs mongodb

# 3. 测试连接
docker compose exec mongodb mongosh --username admin --password <password>

# 4. 检查认证配置
# 确认用户名密码与 .env 文件一致
```

### Redis 连接失败

```bash
# 1. 检查 Redis 容器状态
docker compose ps redis

# 2. 查看 Redis 日志
docker compose logs redis

# 3. 测试连接
docker compose exec redis redis-cli -a <password> ping
```

### 前端无法访问 API

```bash
# 1. 检查 Nginx 配置
docker compose exec nginx nginx -t

# 2. 查看 Nginx 日志
docker compose logs nginx

# 3. 检查后端服务健康状态
curl http://localhost:6001/api/health

# 4. 检查网络连通性
docker compose exec nginx ping backend
```

### 性能问题

```bash
# 1. 查看资源使用
docker compose stats

# 2. 查看慢查询日志（MongoDB）
docker compose exec mongodb mongosh --eval "db.currentOp({'secs_running': {$gte: 1}})"

# 3. 查看 Redis 性能
docker compose exec redis redis-cli -a <password> INFO stats

# 4. 清理空间
./scripts/docker-prune.sh
```

---

## 📞 技术支持

如遇问题，请：

1. 查看服务日志: `./scripts/docker-logs.sh`
2. 检查服务状态: `./scripts/status.sh`
3. 参考本文档的故障排查部分
4. 提交 Issue 到项目仓库

---

## 📄 许可证

MIT License
