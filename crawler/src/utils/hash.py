import hashlib
import re

def generate_content_hash(content: str) -> str:
    """生成内容的 MD5 哈希，用于去重"""
    # 去掉所有空白字符
    normalized = re.sub(r'\s+', '', content)
    return hashlib.md5(normalized.encode('utf-8')).hexdigest()

def count_chinese_chars(text: str) -> int:
    """统计中文字符数量，用于判断有效内容"""
    return sum(1 for c in text if '一' <= c <= '鿿')
