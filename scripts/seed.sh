#!/bin/bash
# ============================================
# BookStation 初始化测试数据脚本
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
║           📚 BookStation 小说阅读网站 - 数据初始化             ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

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

# 在后端容器中执行种子脚本
docker compose exec -T backend node seed-data.js

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
