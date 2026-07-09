import re
import hashlib
import redis.asyncio as redis
from typing import Optional
from ..config import settings
from ..utils import logger

class Deduplicator:
    """内容去重器：基于 Redis 的布隆去重"""

    def __init__(self):
        self.redis_client = None
        self.url_key = settings.REDIS_KEYS['crawled_urls']
        self.hash_key = settings.REDIS_KEYS['chapter_hashes']

    async def connect(self):
        """连接 Redis"""
        try:
            redis_config = settings.REDIS
            self.redis_client = redis.Redis(
                host=redis_config['host'],
                port=redis_config['port'],
                password=redis_config['password'],
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info('✅ Deduplicator Redis connected')
        except Exception as e:
            logger.error(f'❌ Redis connection failed: {e}')
            raise

    async def close(self):
        """关闭连接"""
        if self.redis_client:
            await self.redis_client.close()

    async def is_url_crawled(self, url: str) -> bool:
        """检查 URL 是否已爬取"""
        return await self.redis_client.sismember(self.url_key, url)

    async def mark_url_crawled(self, url: str):
        """标记 URL 已爬取"""
        await self.redis_client.sadd(self.url_key, url)

    @staticmethod
    def generate_hash(content: str) -> str:
        """生成内容哈希"""
        # 去掉所有空白字符后再哈希
        normalized = re.sub(r'\s+', '', content)
        return hashlib.md5(normalized.encode('utf-8')).hexdigest()

    async def is_content_duplicate(self, content: str) -> bool:
        """检查内容是否重复"""
        content_hash = self.generate_hash(content)
        return await self.redis_client.sismember(self.hash_key, content_hash)

    async def mark_content_seen(self, content: str) -> str:
        """标记内容已见过，返回哈希值"""
        content_hash = self.generate_hash(content)
        await self.redis_client.sadd(self.hash_key, content_hash)
        return content_hash

    async def clear_all(self):
        """清空所有去重记录"""
        await self.redis_client.delete(self.url_key, self.hash_key)
        logger.info('🗑️ Deduplicator cache cleared')
