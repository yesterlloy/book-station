import re
from typing import List
from ..utils import logger, count_chinese_chars

class ContentCleaner:
    """内容清洗器：过滤广告、垃圾文本"""

    # 广告关键词列表
    AD_KEYWORDS = [
        r'求收藏', r'求推荐', r'求打赏', r'求月票', r'求订阅',
        r'点击加载', r'正在加载', r'请稍后', r'浏览器', r'APP下载',
        r'最新章节', r'最快更新', r'笔趣阁', r'小说网', r'www\.', r'http',
        r'加入书架', r'推荐投票', r'点击下一页', r'返回目录',
    ]

    @classmethod
    def clean_content(cls, content: str, min_chars: int = 20) -> str:
        """清洗章节内容"""
        if not content:
            return ''

        # 按行分割
        lines = content.split('\n')
        cleaned_lines = []

        for line in lines:
            line = line.strip()

            # 跳过空行
            if not line:
                continue

            # 跳过太短的行（可能是广告）
            if len(line) < min_chars and count_chinese_chars(line) < 5:
                continue

            # 检查是否包含广告关键词
            is_ad = False
            for keyword in cls.AD_KEYWORDS:
                if re.search(keyword, line):
                    is_ad = True
                    break

            if is_ad:
                continue

            cleaned_lines.append(line.strip())

        # 合并内容，确保每段不空
        result = '\n'.join(cleaned_lines)
        result = re.sub(r'\n{3,}', '\n\n', result)  # 合并过多空行

        logger.debug(f'🧹 Cleaned content: {len(content)} -> {len(result)} chars')
        return result

    @staticmethod
    def clean_title(title: str) -> str:
        """清洗标题"""
        if not title:
            return ''

        # 移除常见前缀
        title = re.sub(r'^第\s*\d+\s*[章节集]\s*[：:]\s*', '', title)
        title = re.sub(r'^\d+\s*[、.．]\s*', '', title)

        # 移除多余空白
        title = ' '.join(title.split())
        return title.strip()

    @staticmethod
    def clean_author(author: str) -> str:
        """清洗作者名"""
        if not author:
            return ''

        # 移除常见前缀
        author = re.sub(r'作\s*者[：:]', '', author)
        author = re.sub(r'[作者]：', '', author)

        return author.strip()

    @staticmethod
    def clean_description(desc: str) -> str:
        """清洗简介"""
        if not desc:
            return ''

        # 移除多余空白和换行
        desc = re.sub(r'\s+', ' ', desc)
        return desc.strip()
