#!/bin/bash
# ============================================
# BookStation 停止脚本
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
║           📚 BookStation 小说阅读网站 - 停止脚本               ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

echo -e "${YELLOW}⏹️  正在停止所有服务...${NC}"
echo ""

docker compose down

echo ""
echo -e "${GREEN}✅ 所有服务已停止！${NC}"
echo ""
echo -e "${BLUE}📊 当前状态:${NC}"
docker compose ps
