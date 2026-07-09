from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from ..core import AsyncDownloader, HtmlParser
from ..pipelines import ContentCleaner, Deduplicator, StoragePipeline
from ..utils import logger

class BaseSpider(ABC):
    """爬虫基类，所有具体爬虫都需要继承此类"""

    name: str = 'base_spider'
    base_url: str = ''
    source_name: str = ''

    def __init__(self):
        self.downloader = None
        self.parser = HtmlParser()
        self.cleaner = ContentCleaner()
        self.deduplicator = Deduplicator()
        self.storage = StoragePipeline()
        self.stats = {
            'novels_found': 0,
            'novels_saved': 0,
            'chapters_found': 0,
            'chapters_saved': 0,
            'duplicates': 0,
        }

    async def init(self):
        """初始化爬虫"""
        await self.deduplicator.connect()

    async def close(self):
        """关闭爬虫"""
        await self.deduplicator.close()

    @abstractmethod
    async def parse_novel_list(self, html: str) -> List[str]:
        """解析小说列表页面，返回小说详情页 URL 列表"""
        pass

    @abstractmethod
    async def parse_novel_detail(self, html: str, url: str) -> Optional[Dict]:
        """解析小说详情页，返回小说信息和章节列表页 URL"""
        pass

    @abstractmethod
    async def parse_chapter_list(self, html: str, novel_url: str) -> List[Dict]:
        """解析章节列表页，返回章节信息列表"""
        pass

    @abstractmethod
    async def parse_chapter_content(self, html: str) -> Optional[str]:
        """解析章节内容页，返回正文内容"""
        pass

    async def crawl_novel(self, novel_url: str):
        """爬取单本小说"""
        logger.info(f'🔍 Crawling novel: {novel_url}')

        try:
            # 1. 下载小说详情页
            detail_html = await self.downloader.download(novel_url)
            if not detail_html:
                logger.error(f'❌ Failed to download novel detail: {novel_url}')
                return

            # 2. 解析小说信息
            novel_data = await self.parse_novel_detail(detail_html, novel_url)
            if not novel_data:
                logger.error(f'❌ Failed to parse novel detail: {novel_url}')
                return

            self.stats['novels_found'] += 1
            logger.info(f'📚 Found novel: {novel_data["title"]}')

            # 3. 保存小说信息
            novel_id = await self.storage.save_novel(novel_data)
            if not novel_id:
                logger.error(f'❌ Failed to save novel: {novel_data["title"]}')
                return

            self.stats['novels_saved'] += 1
            novel_data['_id'] = novel_id

            # 4. 下载并解析章节列表
            chapter_list_url = novel_data.get('chapter_list_url', novel_url)
            chapter_list_html = await self.downloader.download(chapter_list_url)
            if not chapter_list_html:
                logger.error(f'❌ Failed to download chapter list')
                return

            chapters = await self.parse_chapter_list(chapter_list_html, novel_url)
            self.stats['chapters_found'] += len(chapters)
            logger.info(f'📖 Found {len(chapters)} chapters')

            # 5. 批量下载章节内容
            chapter_contents = []
            for i, chapter in enumerate(chapters):
                # 检查是否已爬取
                if await self.deduplicator.is_url_crawled(chapter['url']):
                    self.stats['duplicates'] += 1
                    continue

                content_html = await self.downloader.download(chapter['url'])
                if not content_html:
                    continue

                content = await self.parse_chapter_content(content_html)
                if not content:
                    continue

                # 清洗内容
                cleaned_content = self.cleaner.clean_content(content)
                if len(cleaned_content) < 100:  # 内容太短跳过
                    logger.warning(f'⚠️ Content too short: {chapter["title"]}')
                    continue

                # 检查内容重复
                if await self.deduplicator.is_content_duplicate(cleaned_content):
                    self.stats['duplicates'] += 1
                    continue

                chapter_hash = await self.deduplicator.mark_content_seen(cleaned_content)
                await self.deduplicator.mark_url_crawled(chapter['url'])

                chapter_contents.append({
                    'novelId': novel_id,
                    'novelTitle': novel_data['title'],
                    'order': chapter['order'],
                    'title': self.cleaner.clean_title(chapter['title']),
                    'content': cleaned_content,
                    'sourceUrl': chapter['url'],
                    'hash': chapter_hash,
                })

                logger.debug(f'✅ Chapter {i+1}/{len(chapters)}: {chapter["title"]}')

            # 6. 批量保存章节
            saved_count = await self.storage.save_chapters_batch(chapter_contents)
            self.stats['chapters_saved'] += saved_count

            # 7. 更新小说最新章节信息
            if chapter_contents:
                last_chapter = max(chapter_contents, key=lambda x: x['order'])
                await self.storage.update_novel_last_chapter(
                    novel_id,
                    {
                        'title': last_chapter['title'],
                        'id': None,
                        'chapterCount': len(chapters),
                    }
                )

            logger.info(f'✅ Novel complete: {novel_data["title"]}, saved {saved_count} chapters')

        except Exception as e:
            logger.error(f'❌ Error crawling novel {novel_url}: {e}', exc_info=True)

    async def run(self, start_urls: List[str]):
        """运行爬虫"""
        logger.info(f'🚀 Starting spider: {self.name}')
        logger.info(f'📊 Start URLs: {len(start_urls)}')

        await self.init()

        async with AsyncDownloader() as downloader:
            self.downloader = downloader

            for url in start_urls:
                await self.crawl_novel(url)

        await self.close()

        logger.info('🏁 Spider finished')
        logger.info(f'📊 Final stats: {self.stats}')
