#!/bin/bash
# ============================================
# BookStation Docker 停止脚本
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
║              🛑 BookStation Docker 停止脚本                   ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 显示运行中的容器
RUNNING_COUNT=$(docker compose ps --format '{{.Status}}' | grep -c "Up" || true)

if [ "$RUNNING_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  没有运行中的服务${NC}"
    exit 0
fi

echo -e "${YELLOW}📊 当前运行中服务: ${RUNNING_COUNT} 个${NC}"
docker compose ps --format 'table {{.Name}}\t{{.Service}}\t{{.Status}}'
echo ""

# 选择停止模式
echo -e "${YELLOW}请选择停止模式:${NC}"
echo "   1) 停止所有服务（保留数据）"
echo "   2) 停止并删除容器（保留数据卷）"
echo "   3) 完全清理（删除容器、网络、数据卷）⚠️  危险操作"
echo ""
read -p "请输入选项 [1-3]: " stop_choice
echo ""

case $stop_choice in
    1)
        echo -e "${BLUE}🛑 停止所有服务...${NC}"
        docker compose stop
        ;;
    2)
        echo -e "${BLUE}🗑️  停止并删除容器...${NC}"
        docker compose down
        ;;
    3)
        echo -e "${RED}⚠️  警告：此操作将删除所有数据！${NC}"
        read -p "   确认完全清理? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}🧹 完全清理所有资源...${NC}"
            docker compose down -v --remove-orphans
            echo -e "${GREEN}✅ 清理完成，所有数据已删除${NC}"
        else
            echo -e "${YELLOW}已取消${NC}"
            exit 0
        fi
        ;;
    *)
        echo -e "${YELLOW}无效选项，仅停止服务${NC}"
        docker compose stop
        ;;
esac

echo ""
echo -e "${GREEN}✅ 操作完成！${NC}"
echo ""

# 显示最终状态
echo -e "${BLUE}📊 最终状态:${NC}"
docker compose ps --format 'table {{.Name}}\t{{.Service}}\t{{.Status}}' 2>/dev/null || echo "   无运行中的服务"
echo ""
