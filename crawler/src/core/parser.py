from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from urllib.parse import urljoin
from ..utils import logger

class HtmlParser:
    """HTML 解析器"""

    @staticmethod
    def parse(html: str, parser: str = 'lxml') -> BeautifulSoup:
        """解析 HTML"""
        return BeautifulSoup(html, parser)

    @staticmethod
    def extract_text(soup: BeautifulSoup, selector: str, strip: bool = True) -> Optional[str]:
        """提取单个文本"""
        element = soup.select_one(selector)
        if element:
            text = element.get_text(strip=strip)
            return text if text else None
        return None

    @staticmethod
    def extract_all_text(soup: BeautifulSoup, selector: str, strip: bool = True) -> List[str]:
        """提取多个文本"""
        elements = soup.select(selector)
        return [e.get_text(strip=strip) for e in elements if e.get_text(strip=strip)]

    @staticmethod
    def extract_attr(soup: BeautifulSoup, selector: str, attr: str) -> Optional[str]:
        """提取属性"""
        element = soup.select_one(selector)
        if element:
            return element.get(attr)
        return None

    @staticmethod
    def extract_all_attr(soup: BeautifulSoup, selector: str, attr: str) -> List[str]:
        """提取多个属性"""
        elements = soup.select(selector)
        return [e.get(attr) for e in elements if e.get(attr)]

    @staticmethod
    def extract_links(soup: BeautifulSoup, base_url: str = None) -> List[Dict[str, str]]:
        """提取所有链接"""
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            text = a.get_text(strip=True)
            # 相对路径转绝对路径
            if base_url and not href.startswith(('http://', 'https://')):
                href = urljoin(base_url, href)
            links.append({'url': href, 'text': text})
        return links
