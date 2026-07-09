import asyncio
from typing import List, Type
from ..spiders import BaseSpider
from ..utils import logger
from ..models import MongoDB, init_indexes

class CrawlerScheduler:
    """爬虫调度器：管理多个爬虫并发运行"""

    def __init__(self):
        self.spiders = []

    def register_spider(self, spider_cls: Type[BaseSpider]):
        """注册爬虫"""
        self.spiders.append(spider_cls)
        logger.info(f'📋 Registered spider: {spider_cls.name}')

    async def run_single(self, spider_cls: Type[BaseSpider], urls: List[str]):
        """运行单个爬虫"""
        spider = spider_cls()
        await spider.run(urls)

    async def run_all(self, spider_urls: dict):
        """运行所有注册的爬虫"""
        logger.info(f'🚀 Starting crawler scheduler')
        logger.info(f'📋 Registered spiders: {len(self.spiders)}')

        # 连接数据库
        await MongoDB.connect()
        await init_indexes()

        tasks = []
        for spider_cls in self.spiders:
            if spider_cls.name in spider_urls:
                urls = spider_urls[spider_cls.name]
                task = self.run_single(spider_cls, urls)
                tasks.append(task)

        await asyncio.gather(*tasks)

        await MongoDB.close()
        logger.info('🏁 All spiders finished')

    @staticmethod
    async def run_spider(spider_cls: Type[BaseSpider], urls: List[str]):
        """便捷方法：直接运行单个爬虫"""
        scheduler = CrawlerScheduler()
        scheduler.register_spider(spider_cls)
        await scheduler.run_all({spider_cls.name: urls})
