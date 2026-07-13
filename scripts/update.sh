#!/bin/bash
# ============================================
# BookStation 更新部署脚本
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════╗
║           📚 BookStation 小说阅读网站 - 更新部署               ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

echo ""
echo -e "${YELLOW}⚠️  此操作将拉取最新代码并重启服务${NC}"
read -p "   确认继续? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消。"
    exit 0
fi

echo ""
echo -e "${BLUE}📦 开始更新...${NC}"
echo ""

# 1. 拉取最新代码
echo -e "${BLUE}1/5 拉取最新代码...${NC}"
git pull

# 2. 停止旧服务
echo ""
echo -e "${BLUE}2/5 停止旧服务...${NC}"
docker compose down

# 3. 重新构建镜像
echo ""
echo -e "${BLUE}3/5 构建最新镜像...${NC}"
docker compose build --pull

# 4. 启动服务
echo ""
echo -e "${BLUE}4/5 启动服务...${NC}"
docker compose up -d

# 5. 等待服务启动
echo ""
echo -e "${BLUE}5/5 等待服务健康...${NC}"
sleep 10

echo ""
echo -e "${GREEN}✅ 更新部署完成！${NC}"
echo ""
echo -e "${BLUE}📊 服务状态:${NC}"
docker compose ps
echo ""
