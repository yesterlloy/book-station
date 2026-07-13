#!/bin/bash
# ============================================
# BookStation Docker 日志查看脚本
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
║              📜 BookStation Docker 日志查看                   ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 选择服务
echo ""
echo -e "${YELLOW}请选择要查看的日志:${NC}"
echo "   1) 所有服务日志"
echo "   2) 后端服务日志"
echo "   3) MongoDB 日志"
echo "   4) Redis 日志"
echo "   5) Nginx 日志"
echo "   6) 查看最近 100 行错误日志"
echo ""
read -p "请输入选项 [1-6]: " log_choice
echo ""

# 是否实时跟踪
read -p "是否实时跟踪日志? (y/N): " -n 1 -r
echo ""
FOLLOW_OPTION=""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    FOLLOW_OPTION="-f"
fi

case $log_choice in
    1)
        echo -e "${BLUE}📜 所有服务日志${NC}"
        docker compose logs $FOLLOW_OPTION --timestamps
        ;;
    2)
        echo -e "${BLUE}📜 后端服务日志${NC}"
        docker compose logs $FOLLOW_OPTION --timestamps backend
        ;;
    3)
        echo -e "${BLUE}📜 MongoDB 日志${NC}"
        docker compose logs $FOLLOW_OPTION --timestamps mongodb
        ;;
    4)
        echo -e "${BLUE}📜 Redis 日志${NC}"
        docker compose logs $FOLLOW_OPTION --timestamps redis
        ;;
    5)
        echo -e "${BLUE}📜 Nginx 日志${NC}"
        docker compose logs $FOLLOW_OPTION --timestamps nginx
        ;;
    6)
        echo -e "${BLUE}❌ 错误日志 (最近 100 行)${NC}"
        docker compose logs --tail 100 2>&1 | grep -i "error\|warn\|fatal\|panic" | head -100
        ;;
    *)
        echo -e "${YELLOW}无效选项，显示所有服务日志${NC}"
        docker compose logs $FOLLOW_OPTION --timestamps
        ;;
esac
