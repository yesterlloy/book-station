#!/bin/bash
# ============================================
# BookStation 管理后台构建脚本
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ADMIN_DIR="$PROJECT_ROOT/admin"

cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════╗
║              📦 BookStation 管理后台构建脚本                   ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js 18+${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 环境检查通过${NC}"
echo -e "   Node.js 版本: $(node -v)"
echo -e "   npm 版本: $(npm -v)"
echo ""

# 进入管理后台目录
cd "$ADMIN_DIR"

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 安装项目依赖...${NC}"
    npm install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${YELLOW}📦 依赖已安装，跳过${NC}"
fi

echo ""

# 构建生产版本
echo -e "${BLUE}🔨 开始构建生产版本...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 构建成功！${NC}"
    echo ""
    echo -e "${BLUE}📁 构建文件位于: ${YELLOW}admin/dist/${NC}"
    echo ""
    echo -e "${BLUE}📊 构建文件统计:${NC}"
    du -h dist/* | sort -hr
    echo ""

    # 显示访问信息
    echo -e "${BLUE}🌐 访问地址:${NC}"
    echo -e "   管理后台: ${GREEN}http://localhost:6002/admin/${NC}"
    echo -e "   开发模式: ${GREEN}http://localhost:6003/${NC}"
    echo ""

    # 如果 nginx 容器在运行，重启以加载新文件
    if docker compose ps nginx 2>/dev/null | grep -q "Up"; then
        echo -e "${YELLOW}🔄 Nginx 容器正在运行，是否重启容器加载新文件? (y/N)${NC}"
        read -r answer
        if [[ $answer =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}🔄 重启 Nginx 容器...${NC}"
            docker compose restart nginx
            echo -e "${GREEN}✅ Nginx 容器已重启${NC}"
        fi
    fi
else
    echo -e "${RED}❌ 构建失败！${NC}"
    exit 1
fi
