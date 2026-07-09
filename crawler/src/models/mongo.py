import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from ..config import settings
from ..utils import logger

class MongoDB:
    """MongoDB 异步连接管理器"""

    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    async def connect(cls):
        """连接数据库"""
        if cls._client is None:
            try:
                mongo_config = settings.MONGO
                if mongo_config['username'] and mongo_config['password']:
                    uri = f"mongodb://{mongo_config['username']}:{mongo_config['password']}@{mongo_config['host']}:{mongo_config['port']}/{mongo_config['database']}?authSource=admin"
                else:
                    uri = f"mongodb://{mongo_config['host']}:{mongo_config['port']}/{mongo_config['database']}"

                cls._client = AsyncIOMotorClient(uri, maxPoolSize=10)
                cls._db = cls._client[mongo_config['database']]

                # 测试连接
                await cls._client.admin.command('ping')
                logger.info('✅ MongoDB connected successfully')
                logger.info(f"📊 Database: {mongo_config['database']}")
            except Exception as e:
                logger.error(f'❌ MongoDB connection error: {e}')
                raise

    @classmethod
    def get_db(cls):
        """获取数据库实例"""
        if cls._db is None:
            raise RuntimeError('Database not connected. Call connect() first.')
        return cls._db

    @classmethod
    async def close(cls):
        """关闭连接"""
        if cls._client:
            cls._client.close()
            cls._client = None
            cls._db = None
            logger.info('📤 MongoDB connection closed')

# 快捷访问
def get_collection(name):
    return MongoDB.get_db()[name]

async def init_indexes():
    """初始化数据库索引"""
    db = MongoDB.get_db()

    # novels 索引
    await db.novels.create_index([('title', 1), ('author', 1)], unique=True)
    await db.novels.create_index([('category', 1)])
    await db.novels.create_index([('viewCount', -1)])
    await db.novels.create_index([('isHot', 1)])

    # chapters 索引
    await db.chapters.create_index([('novelId', 1), ('order', 1)], unique=True)
    await db.chapters.create_index([('hash', 1)])

    logger.info('📑 Database indexes initialized')
