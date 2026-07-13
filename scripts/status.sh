#!/bin/bash
# ============================================
# BookStation 状态检查脚本
# ============================================

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
║           📚 BookStation 小说阅读网站 - 状态检查               ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

echo ""
echo -e "${PURPLE}📦 Docker 容器状态:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 格式化输出容器状态
docker compose ps --format 'table {{.Name}}\t{{.Service}}\t{{.Status}}'

echo ""
echo ""
echo -e "${PURPLE}📊 资源使用情况:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}'

echo ""
echo ""
echo -e "${PURPLE}🔗 端口映射:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps --format 'table {{.Name}}\t{{.Ports}}'

echo ""
echo ""
echo -e "${PURPLE}🌐 健康检查:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查后端 API 健康状态
if curl -s -f http://localhost/api/health > /dev/null 2>&1; then
    echo -e "   后端 API: ${GREEN}✅ 正常${NC}"
else
    echo -e "   后端 API: ${RED}❌ 异常${NC}"
fi

# 检查 Nginx 状态
if curl -s -f http://localhost/health > /dev/null 2>&1; then
    echo -e "   Nginx 代理: ${GREEN}✅ 正常${NC}"
else
    echo -e "   Nginx 代理: ${RED}❌ 异常${NC}"
fi

echo ""
echo ""
echo -e "${PURPLE}📁 日志文件位置:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   后端日志: ${YELLOW}./backend/logs/${NC}"
echo "   Nginx 日志: ${YELLOW}./docker/nginx/logs/${NC}"
echo ""
echo -e "${PURPLE}📝 查看日志命令:${NC}"
echo "   所有日志: docker compose logs -f"
echo "   后端日志: docker compose logs -f backend"
echo ""
