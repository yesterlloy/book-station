#!/bin/bash
# ============================================
# BookStation Docker 数据备份脚本
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════╗
║              💾 BookStation 数据备份脚本                      ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo ""
echo -e "${YELLOW}请选择备份类型:${NC}"
echo "   1) 完整备份 (MongoDB + Redis)"
echo "   2) 仅 MongoDB 备份"
echo "   3) 仅 Redis 备份"
echo ""
read -p "请输入选项 [1-3]: " backup_choice
echo ""

# 检查服务状态
echo -e "${BLUE}🔍 检查服务状态...${NC}"

MONGO_RUNNING=false
REDIS_RUNNING=false

if docker compose ps --format '{{.Service}} {{.Status}}' | grep -q "mongodb.*Up"; then
    MONGO_RUNNING=true
    echo -e "   ${GREEN}✅ MongoDB 运行中${NC}"
else
    echo -e "   ${YELLOW}⚠️  MongoDB 未运行${NC}"
fi

if docker compose ps --format '{{.Service}} {{.Status}}' | grep -q "redis.*Up"; then
    REDIS_RUNNING=true
    echo -e "   ${GREEN}✅ Redis 运行中${NC}"
else
    echo -e "   ${YELLOW}⚠️  Redis 未运行${NC}"
fi

echo ""

# 执行备份
case $backup_choice in
    1)
        BACKUP_TYPE="full"
        ;;
    2)
        BACKUP_TYPE="mongodb"
        ;;
    3)
        BACKUP_TYPE="redis"
        ;;
    *)
        echo -e "${YELLOW}无效选项，执行完整备份${NC}"
        BACKUP_TYPE="full"
        ;;
esac

# MongoDB 备份
if [ "$BACKUP_TYPE" = "full" ] || [ "$BACKUP_TYPE" = "mongodb" ]; then
    if [ "$MONGO_RUNNING" = true ]; then
        echo -e "${BLUE}💾 备份 MongoDB...${NC}"
        MONGO_BACKUP_FILE="$BACKUP_DIR/mongodb_${TIMESTAMP}.archive.gz"

        # 从环境变量获取密码
        MONGO_PASSWORD=$(grep MONGO_PASSWORD .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "password")
        MONGO_USERNAME=$(grep MONGO_USERNAME .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "admin")
        MONGO_DATABASE=$(grep MONGO_DATABASE .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "bookstation")

        docker compose exec -T mongodb mongodump \
            --username "$MONGO_USERNAME" \
            --password "$MONGO_PASSWORD" \
            --db "$MONGO_DATABASE" \
            --authenticationDatabase admin \
            --gzip \
            --archive > "$MONGO_BACKUP_FILE"

        if [ $? -eq 0 ]; then
            FILE_SIZE=$(du -h "$MONGO_BACKUP_FILE" | cut -f1)
            echo -e "${GREEN}✅ MongoDB 备份完成: ${YELLOW}${MONGO_BACKUP_FILE##*/} ${NC}(${FILE_SIZE})${NC}"
        else
            echo -e "${RED}❌ MongoDB 备份失败${NC}"
            rm -f "$MONGO_BACKUP_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️  跳过 MongoDB 备份（服务未运行）${NC}"
    fi
fi

# Redis 备份
if [ "$BACKUP_TYPE" = "full" ] || [ "$BACKUP_TYPE" = "redis" ]; then
    if [ "$REDIS_RUNNING" = true ]; then
        echo -e "${BLUE}💾 备份 Redis...${NC}"
        REDIS_BACKUP_FILE="$BACKUP_DIR/redis_${TIMESTAMP}.rdb"

        # 从环境变量获取密码
        REDIS_PASSWORD=$(grep REDIS_PASSWORD .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "redis_password")

        # 执行 BGSAVE
        docker compose exec -T redis redis-cli -a "$REDIS_PASSWORD" BGSAVE > /dev/null 2>&1

        # 等待备份完成
        sleep 2

        # 复制备份文件
        docker compose cp redis:/data/dump.rdb "$REDIS_BACKUP_FILE" 2>/dev/null

        if [ $? -eq 0 ] && [ -f "$REDIS_BACKUP_FILE" ]; then
            FILE_SIZE=$(du -h "$REDIS_BACKUP_FILE" | cut -f1)
            echo -e "${GREEN}✅ Redis 备份完成: ${YELLOW}${REDIS_BACKUP_FILE##*/} ${NC}(${FILE_SIZE})${NC}"
        else
            echo -e "${RED}❌ Redis 备份失败${NC}"
            rm -f "$REDIS_BACKUP_FILE" 2>/dev/null
        fi
    else
        echo -e "${YELLOW}⚠️  跳过 Redis 备份（服务未运行）${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ 备份流程完成！${NC}"
echo ""
echo -e "${BLUE}📂 备份文件位置: ${YELLOW}$BACKUP_DIR${NC}"
echo ""

# 显示备份列表
echo -e "${BLUE}📋 现有备份文件:${NC}"
ls -lh "$BACKUP_DIR" 2>/dev/null | grep -v "total" || echo "   无备份文件"
echo ""
