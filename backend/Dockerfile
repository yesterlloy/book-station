# ============================================
# 构建阶段 - 安装依赖
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖，使用国内镜像加速
RUN npm config set registry https://registry.npmmirror.com && \
    npm ci --only=production && \
    npm cache clean --force

# ============================================
# 开发阶段
# ============================================
FROM node:20-alpine AS development
WORKDIR /app

# 复制生产依赖
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# 安装开发依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --only=development

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 6001

# 启动开发服务器
CMD ["npm", "run", "dev"]

# ============================================
# 生产阶段
# ============================================
FROM node:20-alpine AS production
WORKDIR /app

# 设置时区
RUN apk add --no-cache tzdata curl && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 使用非 root 用户运行
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 复制生产依赖
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# 复制源代码
COPY . .

# 设置权限
RUN chown -R nodejs:nodejs /app && \
    mkdir -p /app/logs /app/uploads && \
    chown -R nodejs:nodejs /app/logs /app/uploads

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 6001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:6001/api/health || exit 1

# 启动生产服务器
CMD ["node", "src/app.js"]
