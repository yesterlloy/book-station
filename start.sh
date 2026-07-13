#!/bin/bash
# BookStation 一键启动脚本

echo "🚀 Starting BookStation..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Docker 服务是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker 未运行，请先启动 Docker${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker 运行中${NC}"
}

# 启动数据库服务
start_databases() {
    echo ""
    echo "📦 启动数据库服务..."
    docker compose up -d mongodb redis

    # 等待数据库启动
    echo "⏳ 等待数据库启动..."
    sleep 5

    # 检查状态
    if docker compose ps | grep -E "mongodb.*running" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB 启动成功${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB 可能还在启动中，请稍后查看${NC}"
    fi

    if docker compose ps | grep -E "redis.*running" > /dev/null; then
        echo -e "${GREEN}✅ Redis 启动成功${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis 可能还在启动中，请稍后查看${NC}"
    fi
}

# 插入测试数据
seed_data() {
    echo ""
    echo "📚 插入测试数据..."
    cd backend
    if [ ! -d "node_modules" ]; then
        echo "📦 安装依赖..."
        npm install
    fi
    node seed-data.js
    cd ..
}

# 启动后端服务
start_backend() {
    echo ""
    echo "🌐 启动后端服务..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..

    sleep 3
    echo -e "${GREEN}✅ 后端服务已启动: http://localhost:6001${NC}"
    echo "   API 文档: http://localhost:6001/api"
}

# 启动前端静态服务
start_frontend() {
    echo ""
    echo "🎨 启动前端服务..."
    if command -v python3 &> /dev/null; then
        cd frontend
        python3 -m http.server 6002 &
        FRONTEND_PID=$!
        cd ..
        echo -e "${GREEN}✅ 前端服务已启动: http://localhost:6002${NC}"
    else
        echo -e "${YELLOW}⚠️  未找到 Python3，请手动打开 frontend/index.html${NC}"
    fi
}

# 显示服务信息
show_info() {
    echo ""
    echo "=============================================="
    echo "🎉 BookStation 启动完成！"
    echo "=============================================="
    echo ""
    echo "📱 访问地址："
    echo "   首页: http://localhost:6002"
    echo "   阅读器: http://localhost:6002/reader/"
    echo "   后端 API: http://localhost:6001/api"
    echo ""
    echo "📚 测试账号（可选）："
    echo "   请先注册新用户"
    echo ""
    echo "🔧 常用命令："
    echo "   停止服务: docker compose stop"
    echo "   查看状态: docker compose ps"
    echo "   查看日志: docker compose logs -f"
    echo ""
    echo "⚠️  注意："
    echo "   关闭终端窗口会停止前后端服务"
    echo "   数据库会继续在后台运行"
    echo "=============================================="
    echo ""
    echo "按 Ctrl+C 停止前后端服务"
}

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ 服务已停止"
    exit 0
}

# 捕获 Ctrl+C
trap cleanup INT

# 主流程
check_docker
start_databases
seed_data
start_backend
start_frontend
show_info

# 等待用户中断
wait
