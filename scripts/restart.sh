#!/bin/bash
# ============================================
# BookStation 重启脚本
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
║           📚 BookStation 小说阅读网站 - 重启脚本               ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

echo -e "${YELLOW}🔄 正在重启所有服务...${NC}"
echo ""

docker compose restart

echo ""
echo -e "${GREEN}✅ 所有服务已重启！${NC}"
echo ""
echo -e "${BLUE}📊 服务状态:${NC}"
docker compose ps
