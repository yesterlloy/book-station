#!/bin/bash
# ============================================
# BookStation 启动脚本
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════╗
║           📚 BookStation 小说阅读网站 - 启动脚本               ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env 文件不存在，正在从 .env.example 创建...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  请编辑 .env 文件配置密码和密钥${NC}"
fi

# 创建必要目录
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p docker/nginx/logs
mkdir -p docker/nginx/ssl

echo -e "${BLUE}📦 构建和启动服务...${NC}"
echo ""

# 拉取并构建镜像
docker compose build --pull

# 启动服务
docker compose up -d

echo ""
echo -e "${GREEN}✅ 服务启动完成！${NC}"
echo ""
echo -e "${BLUE}📊 服务状态:${NC}"
docker compose ps
echo ""

echo -e "${BLUE}📝 日志查看:${NC}"
echo "   全部日志: docker compose logs -f"
echo "   后端日志: docker compose logs -f backend"
echo "   MongoDB 日志: docker compose logs -f mongodb"
echo "   Redis 日志: docker compose logs -f redis"
echo "   Nginx 日志: docker compose logs -f nginx"
echo ""

echo -e "${BLUE}🌐 访问地址:${NC}"
echo "   首页: http://localhost"
echo "   阅读器: http://localhost/reader/"
echo "   API 健康检查: http://localhost/api/health"
echo ""

echo -e "${BLUE}💡 其他命令:${NC}"
echo "   停止服务: ./scripts/stop.sh"
echo "   重启服务: ./scripts/restart.sh"
echo "   查看状态: ./scripts/status.sh"
echo ""

# 等待服务健康
echo -e "${YELLOW}⏳  等待服务完全启动...${NC}"
sleep 5
echo ""

# 检查服务健康状态
HEALTHY_COUNT=$(docker compose ps --format '{{.Status}}' | grep -c healthy || true)
TOTAL_COUNT=$(docker compose ps --format '{{.Status}}' | wc -l)

if [ "$HEALTHY_COUNT" -eq "$TOTAL_COUNT" ]; then
    echo -e "${GREEN}✅ 所有服务健康运行！${NC}"
else
    echo -e "${YELLOW}⚠️  部分服务正在启动中，请稍后检查状态${NC}"
fi

echo ""
echo -e "${BLUE}🎉 BookStation 部署成功！${NC}"
