#!/bin/bash
# ============================================
# BookStation Docker 重启脚本
# ============================================

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
║              🔄 BookStation Docker 重启脚本                   ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 选择重启模式
echo ""
echo -e "${YELLOW}请选择重启模式:${NC}"
echo "   1) 重启所有服务"
echo "   2) 仅重启后端服务"
echo "   3) 仅重启 Nginx 服务"
echo "   4) 仅重启数据库服务"
echo ""
read -p "请输入选项 [1-4]: " restart_choice
echo ""

case $restart_choice in
    1)
        echo -e "${BLUE}🔄 重启所有服务...${NC}"
        docker compose restart
        ;;
    2)
        echo -e "${BLUE}🔄 重启后端服务...${NC}"
        docker compose restart backend
        ;;
    3)
        echo -e "${BLUE}🔄 重启 Nginx 服务...${NC}"
        docker compose restart nginx
        ;;
    4)
        echo -e "${BLUE}🔄 重启数据库服务...${NC}"
        docker compose restart mongodb redis
        ;;
    *)
        echo -e "${YELLOW}无效选项，重启所有服务${NC}"
        docker compose restart
        ;;
esac

echo ""
echo -e "${GREEN}✅ 重启命令已发送，请稍等...${NC}"
sleep 3

# 显示服务状态
echo ""
echo -e "${BLUE}📊 服务状态:${NC}"
docker compose ps --format 'table {{.Name}}\t{{.Service}}\t{{.Status}}'
echo ""
