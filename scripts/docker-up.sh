#!/bin/bash
# ============================================
# BookStation Docker 启动脚本
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════╗
║              🚀 BookStation Docker 启动脚本                   ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 未找到 .env 文件${NC}"
    echo -e "${YELLOW}   请先运行 ./scripts/docker-build.sh 或手动复制 .env 文件${NC}"
    exit 1
fi

# 选择启动模式
echo ""
echo -e "${YELLOW}请选择启动模式:${NC}"
echo "   1) 完整启动（数据库 + 后端 + Nginx + 管理后台）"
echo "   2) 仅启动数据库服务"
echo "   3) 仅启动后端服务"
echo "   4) 仅启动 Nginx 服务"
echo "   5) 启动管理后台服务"
echo ""
read -p "请输入选项 [1-5]: " start_choice

echo ""
echo -e "${BLUE}🚀 启动服务...${NC}"
echo ""

case $start_choice in
    1)
        echo -e "${BLUE}📦 启动所有服务...${NC}"
        docker compose up -d
        SERVICES="mongodb redis backend nginx"
        ;;
    2)
        echo -e "${BLUE}📦 启动数据库服务...${NC}"
        docker compose up -d mongodb redis
        SERVICES="mongodb redis"
        ;;
    3)
        echo -e "${BLUE}📦 启动后端服务...${NC}"
        docker compose up -d mongodb redis backend
        SERVICES="mongodb redis backend"
        ;;
    4)
        echo -e "${BLUE}📦 启动 Nginx 服务...${NC}"
        docker compose up -d nginx
        SERVICES="nginx"
        ;;
    5)
        echo -e "${BLUE}📦 启动管理后台服务...${NC}"
        docker compose up -d mongodb redis backend admin
        SERVICES="mongodb redis backend admin"
        ;;
    *)
        echo -e "${RED}无效选项，启动所有服务${NC}"
        docker compose up -d
        SERVICES="mongodb redis backend nginx admin"
        ;;
esac

echo ""
echo -e "${BLUE}⏳ 等待服务健康检查...${NC}"
echo ""

# 等待服务启动
for i in {1..30}; do
    sleep 2
    HEALTHY_COUNT=0
    TOTAL_COUNT=0

    for service in $SERVICES; do
        TOTAL_COUNT=$((TOTAL_COUNT + 1))
        if docker compose ps --format '{{.Service}} {{.Status}}' | grep -q "^$service.*healthy"; then
            HEALTHY_COUNT=$((HEALTHY_COUNT + 1))
        fi
    done

    echo -ne "\r   健康状态: ${HEALTHY_COUNT}/${TOTAL_COUNT} 服务已就绪"

    if [ "$HEALTHY_COUNT" -eq "$TOTAL_COUNT" ]; then
        echo ""
        break
    fi

    if [ $i -eq 30 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  部分服务启动超时，请检查日志${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ 服务启动完成！${NC}"
echo ""

# 显示服务状态
echo -e "${PURPLE}📊 服务状态:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps --format 'table {{.Name}}\t{{.Service}}\t{{.Status}}'
echo ""

# 显示访问信息
echo -e "${PURPLE}🌐 访问地址:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "   🎨 前端首页:      ${GREEN}http://localhost:6002${NC}"
echo -e "   📖 阅读器:        ${GREEN}http://localhost:6002/reader/${NC}"
echo -e "   🔧 管理后台:      ${GREEN}http://localhost:6003${NC}"
echo -e "   🌐 后端 API:      ${GREEN}http://localhost:6001${NC}"
echo -e "   🔍 API 健康检查:  ${GREEN}http://localhost:6001/api/health${NC}"
echo ""

# 显示数据库信息
echo -e "${PURPLE}💾 数据库信息:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "   MongoDB:         ${YELLOW}mongodb://localhost:27017${NC}"
echo -e "   Redis:           ${YELLOW}redis://localhost:6380${NC}"
echo ""

# 显示常用命令
echo -e "${PURPLE}📝 常用命令:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "   查看日志:        ${YELLOW}./scripts/docker-logs.sh${NC}"
echo -e "   停止服务:        ${YELLOW}./scripts/docker-down.sh${NC}"
echo -e "   重启服务:        ${YELLOW}./scripts/docker-restart.sh${NC}"
echo -e "   查看状态:        ${YELLOW}./scripts/status.sh${NC}"
echo -e "   插入测试数据:    ${YELLOW}./scripts/docker-seed.sh${NC}"
echo ""
