#!/bin/bash
# ============================================
# BookStation Docker 构建脚本
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
║              📚 BookStation Docker 构建脚本                   ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装，请先安装 Docker Compose${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 环境检查通过${NC}"

# 选择构建目标
echo ""
echo -e "${YELLOW}请选择构建模式:${NC}"
echo "   1) 开发环境 (Development)"
echo "   2) 生产环境 (Production)"
echo ""
read -p "请输入选项 [1-2]: " env_choice

case $env_choice in
    1)
        BUILD_TARGET="development"
        NODE_ENV="development"
        ;;
    2)
        BUILD_TARGET="production"
        NODE_ENV="production"
        ;;
    *)
        echo -e "${RED}无效选项，使用默认生产环境${NC}"
        BUILD_TARGET="production"
        NODE_ENV="production"
        ;;
esac

echo ""
echo -e "${BLUE}🔨 开始构建 ${BUILD_TARGET} 环境...${NC}"
echo ""

# 复制环境变量文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 未找到 .env 文件，使用 .env.${NODE_ENV} 作为模板${NC}"
    if [ -f ".env.${NODE_ENV}" ]; then
        cp ".env.${NODE_ENV}" .env
        echo -e "${GREEN}✅ 已创建 .env 文件${NC}"
    else
        echo -e "${YELLOW}⚠️  未找到 .env.${NODE_ENV}，使用 .env.example${NC}"
        cp .env.example .env
        echo -e "${GREEN}✅ 已创建 .env 文件，请根据需要修改配置${NC}"
    fi
fi

# 停止旧容器
echo ""
echo -e "${BLUE}🛑 停止旧容器...${NC}"
docker compose down 2>/dev/null || true

# 清理悬空镜像（可选）
echo ""
read -p "是否清理悬空镜像以释放空间? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🧹 清理悬空镜像...${NC}"
    docker image prune -f
fi

# 构建镜像
echo ""
echo -e "${BLUE}🔨 构建 Docker 镜像 (目标: ${BUILD_TARGET})...${NC}"
echo ""

if [ "$BUILD_TARGET" = "development" ]; then
    NODE_ENV=development docker compose build --build-arg NODE_ENV=development
else
    docker compose build
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 构建成功！${NC}"
    echo ""
    echo -e "${BLUE}📦 镜像列表:${NC}"
    docker images | grep bookstation
    echo ""
    echo -e "${YELLOW}🚀 启动服务请运行: ./scripts/docker-up.sh${NC}"
    echo ""
else
    echo -e "${RED}❌ 构建失败！${NC}"
    exit 1
fi
