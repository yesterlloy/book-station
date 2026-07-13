#!/bin/bash
# ============================================
# BookStation Docker 数据初始化脚本
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
║            📚 BookStation 数据初始化脚本                      ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 检查后端服务是否运行
if ! docker compose ps --format '{{.Service}} {{.Status}}' | grep -q "backend.*healthy"; then
    echo -e "${YELLOW}⚠️  后端服务未运行，请先启动服务${NC}"
    echo -e "${YELLOW}   运行: ./scripts/docker-up.sh${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  此操作将清空现有数据并重新初始化！${NC}"
read -p "   确认继续? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消。"
    exit 0
fi

echo ""
echo -e "${BLUE}📦 开始初始化数据...${NC}"
echo ""

# 复制种子脚本到容器并执行
docker compose exec -T backend node seed-data.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 数据初始化完成！${NC}"
    echo ""
    echo -e "${BLUE}👤 测试账号:${NC}"
    echo "   管理员: admin / admin123"
    echo "   作者: author1 / author123"
    echo "   作者: author2 / author123"
    echo "   读者: reader1 / reader123"
    echo "   读者: reader2 / reader123"
    echo ""
else
    echo -e "${RED}❌ 数据初始化失败！${NC}"
    exit 1
fi
