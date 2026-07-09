from typing import List, Dict, Optional
from urllib.parse import urljoin
from .base_spider import BaseSpider
from ..utils import logger
from ..pipelines import ContentCleaner

class ExampleSpider(BaseSpider):
    """示例爬虫：需要根据实际目标网站调整选择器"""

    name = 'example_spider'
    base_url = 'https://example.com'
    source_name = '示例小说网'

    def __init__(self):
        super().__init__()
        self.cleaner = ContentCleaner()

    async def parse_novel_list(self, html: str) -> List[str]:
        """解析小说列表（本示例不使用）"""
        soup = self.parser.parse(html)
        novels = []

        for item in soup.select('.novel-item'):
            link = item.select_one('a')
            if link and link.get('href'):
                novels.append(urljoin(self.base_url, link['href']))

        return novels

    async def parse_novel_detail(self, html: str, url: str) -> Optional[Dict]:
        """解析小说详情页"""
        soup = self.parser.parse(html)

        # 这些选择器需要根据实际网站调整
        title = self.parser.extract_text(soup, 'h1.novel-title')
        author = self.parser.extract_text(soup, '.author-name')
        cover = self.parser.extract_attr(soup, '.novel-cover img', 'src')
        description = self.parser.extract_text(soup, '.novel-description')
        category = self.parser.extract_text(soup, '.novel-category')
        status = self.parser.extract_text(soup, '.novel-status')

        # 获取章节列表 URL
        chapter_url_el = soup.select_one('a#chapter-list')
        chapter_list_url = chapter_url_el.get('href') if chapter_url_el else url
        chapter_list_url = urljoin(url, chapter_list_url)

        if not title or not author:
            logger.error(f'❌ Missing title or author: {url}')
            return None

        return {
            'title': self.cleaner.clean_title(title),
            'author': self.cleaner.clean_author(author),
            'cover': urljoin(url, cover) if cover else '',
            'description': self.cleaner.clean_description(description) if description else '',
            'category': category or '其他',
            'status': status or '连载中',
            'chapter_list_url': chapter_list_url,
            'source': {
                'name': self.source_name,
                'url': url,
            },
        }

    async def parse_chapter_list(self, html: str, novel_url: str) -> List[Dict]:
        """解析章节列表"""
        soup = self.parser.parse(html)
        chapters = []

        for i, item in enumerate(soup.select('.chapter-list a'), 1):
            title = item.get_text(strip=True)
            href = item.get('href')

            if not href:
                continue

            chapters.append({
                'order': i,
                'title': title,
                'url': urljoin(novel_url, href),
            })

        return chapters

    async def parse_chapter_content(self, html: str) -> Optional[str]:
        """解析章节内容"""
        soup = self.parser.parse(html)

        # 找到内容容器
        content_div = soup.select_one('#content')
        if not content_div:
            return None

        # 移除脚本、样式等
        for tag in content_div(['script', 'style', 'div', 'a', 'iframe']):
            tag.decompose()

        # 获取纯文本，保留换行
        content = content_div.get_text('\n', strip=True)
        return content
