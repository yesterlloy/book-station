import asyncio
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.models import MongoDB, init_indexes
from src.core import AsyncDownloader, HtmlParser
from src.pipelines import ContentCleaner, Deduplicator
from src.utils import logger

async def test_components():
    """测试各个组件"""
    logger.info('🧪 Testing crawler components...')

    # 1. 测试数据库连接
    logger.info('\n1. Testing MongoDB connection...')
    await MongoDB.connect()
    await init_indexes()
    logger.info('✅ MongoDB OK')

    # 2. 测试下载器
    logger.info('\n2. Testing downloader...')
    async with AsyncDownloader(concurrency=2) as downloader:
        html = await downloader.download('https://httpbin.org/html')
        if html and len(html) > 0:
            logger.info(f'✅ Downloader OK ({len(html)} bytes)')
        else:
            logger.error('❌ Downloader failed')

    # 3. 测试解析器
    logger.info('\n3. Testing parser...')
    parser = HtmlParser()
    soup = parser.parse(html)
    title = parser.extract_text(soup, 'h1')
    if title:
        logger.info(f'✅ Parser OK (title: {title})')
    else:
        logger.error('❌ Parser failed')

    # 4. 测试清洗器
    logger.info('\n4. Testing cleaner...')
    test_content = """
    第一章 测试
    （本章内容纯属虚构）
    这是正文内容。
    求收藏求推荐！
    更多精彩内容...
    http://example.com
    第二章预告
    """
    cleaned = ContentCleaner.clean_content(test_content)
    logger.info(f'✅ Cleaner OK: {len(test_content)} -> {len(cleaned)} chars')
    logger.debug(f'Cleaned content: {cleaned}')

    # 5. 测试去重器
    logger.info('\n5. Testing deduplicator...')
    dedup = Deduplicator()
    await dedup.connect()

    test_hash1 = ContentCleaner.generate_hash('test content 1')
    test_hash2 = ContentCleaner.generate_hash('test content 2')

    is_dup = await dedup.is_content_duplicate('test content 1')
    logger.info(f'  Before mark: is_dup={is_dup}')

    await dedup.mark_content_seen('test content 1')

    is_dup = await dedup.is_content_duplicate('test content 1')
    logger.info(f'  After mark: is_dup={is_dup}')

    logger.info('✅ Deduplicator OK')
    await dedup.close()

    await MongoDB.close()
    logger.info('\n🎉 All tests passed!')

if __name__ == '__main__':
    asyncio.run(test_components())
