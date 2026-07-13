#!/bin/bash
# ============================================
# BookStation Docker 空间清理脚本
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
║              🧹 BookStation Docker 空间清理                   ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 显示当前磁盘使用情况
echo ""
echo -e "${BLUE}📊 当前 Docker 磁盘使用:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker system df
echo ""

# 选择清理模式
echo -e "${YELLOW}请选择清理模式:${NC}"
echo "   1) 清理悬空镜像 (推荐，安全)"
echo "   2) 清理未使用的镜像"
echo "   3) 清理未使用的卷"
echo "   4) 清理构建缓存"
echo "   5) 完整清理 (所有未使用资源) ⚠️"
echo ""
read -p "请输入选项 [1-5]: " prune_choice
echo ""

case $prune_choice in
    1)
        echo -e "${BLUE}🧹 清理悬空镜像...${NC}"
        docker image prune -f
        ;;
    2)
        echo -e "${BLUE}🧹 清理未使用的镜像...${NC}"
        docker image prune -a
        ;;
    3)
        echo -e "${BLUE}🧹 清理未使用的卷...${NC}"
        echo -e "${YELLOW}⚠️  警告：这将删除所有未使用的数据卷！${NC}"
        read -p "   确认继续? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker volume prune
        else
            echo -e "${YELLOW}已取消${NC}"
        fi
        ;;
    4)
        echo -e "${BLUE}🧹 清理构建缓存...${NC}"
        docker builder prune -f
        ;;
    5)
        echo -e "${BLUE}🧹 完整清理...${NC}"
        echo -e "${YELLOW}⚠️  警告：这将删除所有未使用的资源！${NC}"
        read -p "   确认继续? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker system prune -a --volumes
        else
            echo -e "${YELLOW}已取消${NC}"
        fi
        ;;
    *)
        echo -e "${YELLOW}无效选项${NC}"
        exit 0
        ;;
esac

echo ""
echo -e "${GREEN}✅ 清理完成！${NC}"
echo ""

# 显示清理后的磁盘使用情况
echo -e "${BLUE}📊 清理后磁盘使用:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker system df
echo ""
